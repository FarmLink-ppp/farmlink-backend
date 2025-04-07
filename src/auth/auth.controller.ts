import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ResendEmailVerificationDto } from './dto/resend-email.dto';
import {
  RequestWithCookies,
  RequestWithUser,
} from 'src/common/types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in and received tokens',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(loginDto, res);
  }

  @ApiOperation({ summary: 'Register user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description:
      'User successfully registered and waiting for email verification',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 409,
    description: 'User with this email or username already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 201,
    description: 'Tokens successfully refreshed',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token or refresh token expired',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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

  @ApiOperation({ summary: 'Verify email' })
  @ApiBody({ type: EmailVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired verification token',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    return await this.authService.verifyEmail(emailVerificationDto);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ type: ResendEmailVerificationDto })
  @ApiResponse({
    status: 200,
    description:
      'If this email is registered and not verified, a verification email has been sent. Please check your inbox or spam folder.',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Post('resend-verification')
  async resendVerificationEmail(
    @Body() resendEmailVerificationDto: ResendEmailVerificationDto,
  ) {
    return await this.authService.resendVerificationEmail(
      resendEmailVerificationDto.email,
    );
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description:
      'If this email is registered, a password reset email has been sent. Please check your inbox or spam folder.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired reset token',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.logout(req.user.id, res);
  }
}
