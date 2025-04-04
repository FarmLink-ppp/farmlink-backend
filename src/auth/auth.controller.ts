import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
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
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ResendEmailVerificationDto } from './dto/resend-email.dto';
import {
  RequestWithCookies,
  RequestWithUser,
} from 'src/common/types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(loginDto, res);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @ApiCookieAuth('refresh-token')
  @Post('refresh')
  async refreshToken(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }
    return await this.authService.refreshTokens(refreshToken, res);
  }

  @Post('verify-email')
  async verifyEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    return await this.authService.verifyEmail(emailVerificationDto);
  }

  @Post('resend-verification')
  async resendVerificationEmail(
    @Body() resendEmailVerificationDto: ResendEmailVerificationDto,
  ) {
    return await this.authService.resendVerificationEmail(
      resendEmailVerificationDto.email,
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @ApiCookieAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.logout(req.user.id, res);
  }
}
