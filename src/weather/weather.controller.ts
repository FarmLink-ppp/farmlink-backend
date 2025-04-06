import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get weather by city name' })
  @ApiResponse({
    status: 200,
    description: 'Weather data retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid API key',
  })
  @ApiResponse({
    status: 404,
    description: 'City not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiCookieAuth('access-token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getWeather(@Query('q') cityName: string) {
    return this.weatherService.getWeather(cityName);
  }
}
