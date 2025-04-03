import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/mail/mail.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    try {
      const user = await this.usersService.findByCredentials(username);
      if (!user) {
        return null;
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid credentials');
      }

      if (!user.is_verified)
        throw new ForbiddenException('Email is not verified');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(loginDto: LoginDto, res: Response) {
    try {
      const user = await this.validateUser(
        loginDto.username,
        loginDto.password,
      );

      const tokens = await this.getTokens(user!.id, loginDto.username);
      await this.storeRefreshToken(user!.id, tokens.refreshToken);
      user!.refresh_token = tokens.refreshToken;
      this.setCookies(res, tokens);

      return {
        user,
        tokens,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error, 'Login failed');
    }
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.usersService.create(createUserDto);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiration = new Date();
      verificationTokenExpiration.setHours(
        verificationTokenExpiration.getHours() + 24,
      ); // 24h
      await this.usersService.updateVerificationToken(
        newUser.id,
        verificationToken,
        verificationTokenExpiration,
      );

      await this.emailService.sendVerificationEmail(
        newUser.email,
        newUser.full_name,
        verificationToken,
      );

      return {
        message:
          'Registration successful. Please check your email to verify your account.',
        user: newUser,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error, 'Registration failed');
    }
  }

  async logout(userId: number, res: Response) {
    try {
      await this.usersService.updateRefreshToken(userId, null, null);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error, 'Logout failed');
    }
  }

  async verifyEmail(emailVerificationDto: EmailVerificationDto) {
    try {
      const { token } = emailVerificationDto;
      const user = await this.usersService.findByVerificationToken(token);
      if (!user) {
        throw new ForbiddenException('Invalid or expired verification token');
      }
      if (
        user.verify_token_expires &&
        new Date() > new Date(user.verify_token_expires)
      )
        throw new ForbiddenException('Verification token expired');

      await this.usersService.verifyUser(user.id);
      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error,
        'Email verification failed',
      );
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const user = await this.usersService.findBy({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.is_verified) {
        throw new BadRequestException('Email already verified');
      }
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiration = new Date();
      verificationTokenExpiration.setHours(
        verificationTokenExpiration.getHours() + 24,
      ); // 24h
      await this.usersService.updateVerificationToken(
        user.id,
        verificationToken,
        verificationTokenExpiration,
      );

      await this.emailService.sendVerificationEmail(
        user.email,
        user.full_name,
        verificationToken,
      );
      return {
        message:
          'Verification email resent. Please check your inbox or spam folder.',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error,
        'Failed to resend verification email',
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;
      const user = await this.usersService.findBy({ email });
      if (!user) {
        return {
          message: 'If this email is registered, a reset link has been sent.',
        };
      }
      const resetToken = crypto.randomBytes(32).toString('hex');

      const resetTokenExpiration = new Date();
      resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1); // 1h

      await this.usersService.updateResetToken(
        user.id,
        resetToken,
        resetTokenExpiration,
      );

      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.full_name,
        resetToken,
      );
      return {
        message:
          'Password reset email sent. Please check your inbox or spam folder.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to process password reset request',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, password } = resetPasswordDto;

      const user = await this.usersService.findByResetToken(token);
      if (!user) {
        throw new ForbiddenException('Invalid reset token');
      }
      if (
        user.reset_pass_expires &&
        new Date() > new Date(user.reset_pass_expires)
      )
        throw new ForbiddenException('Reset token expired');
      // update password
      await this.usersService.update(user.id, { password });
      // set reset token to null
      await this.usersService.updateResetToken(user.id, null, null);

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error, 'Password reset failed');
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto, res: Response) {
    try {
      const { refreshToken } = refreshTokenDto;

      // Verify the refresh token
      const payload: { sub: number; username: string } =
        await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });

      const user = await this.usersService.findBy(
        { id: payload.sub },
        { refresh_token: true, refresh_token_expires: true },
      );

      if (!user || !user.refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = refreshToken === user.refresh_token;

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (
        user.refresh_token_expires &&
        new Date() > new Date(user.refresh_token_expires)
      ) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const tokens = await this.getTokens(user.id, user.username);

      await this.storeRefreshToken(user.id, tokens.refreshToken);

      this.setCookies(res, tokens);

      return {
        tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new InternalServerErrorException(error, 'Token refresh failed');
    }
  }

  private async getTokens(userId: number, username: string) {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          { sub: userId, username },
          {
            expiresIn: '1d',
            secret: this.configService.get<string>('JWT_SECRET'),
          },
        ),
        this.jwtService.signAsync(
          { sub: userId, username },
          {
            expiresIn: '30d',
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          },
        ),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error generating tokens');
    }
  }

  private async storeRefreshToken(userId: number, refreshToken: string) {
    try {
      const refreshTokenExpires = new Date();
      refreshTokenExpires.setHours(refreshTokenExpires.getHours() + 30);

      await this.usersService.updateRefreshToken(
        userId,
        refreshToken,
        refreshTokenExpires,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error storing refresh token',
      );
    }
  }

  private setCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 60 * 24 * 1000, // 30 days
    });
  }
}
