import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiResponse({
  status: 429,
  description: 'Too many requests',
})
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
@Auth()
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

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
    status: 404,
    description: 'City not found',
  })
  @Get()
  async getWeather(@Query('q') cityName: string) {
    return this.weatherService.getWeather(cityName);
  }
}
