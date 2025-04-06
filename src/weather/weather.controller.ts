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
  async getWeather(@Query('q') city_name: string) {
    return this.weatherService.getWeather(city_name);
  }
}


