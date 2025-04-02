import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.login(loginDto, res);
    } catch (error) {
      this.handleError(error, 'Login failed');
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.authService.register(createUserDto);
    } catch (error) {
      this.handleError(error, 'Registration failed');
    }
  }

  @Post('refresh')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.refreshTokens(refreshTokenDto, res);
    } catch (error) {
      this.handleError(error, 'Token refresh failed');
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    try {
      return await this.authService.verifyEmail(emailVerificationDto);
    } catch (error) {
      this.handleError(error, 'Email verification failed');
    }
  }

  @Post('resend-verification/:email')
  async resendVerificationEmail(@Param('email') email: string) {
    try {
      return await this.authService.resendVerificationEmail(email);
    } catch (error) {
      this.handleError(error, 'Resend verification email failed');
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(resetPasswordDto);
    } catch (error) {
      this.handleError(error, 'Password reset failed');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto);
    } catch (error) {
      this.handleError(error, 'Forgot password request failed');
    }
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request & { user: { sub: number; username: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.logout(req.user.sub, res);
    } catch (error) {
      this.handleError(error, 'Logout failed');
    }
  }

  private handleError(error: any, defaultMessage: string) {
    if (error instanceof HttpException) {
      throw error;
    }

    console.error(`${defaultMessage}:`, error);

    throw new HttpException(defaultMessage, HttpStatus.INTERNAL_SERVER_ERROR, {
      cause: error,
    });
  }
}
