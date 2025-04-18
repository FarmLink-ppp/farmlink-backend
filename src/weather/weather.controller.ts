import { Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';

@Auth()
@ApiController('weather')
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
    status: 404,
    description: 'City not found',
  })
  @ApiQuery({
    name: 'q',
    description: 'City name to get the weather for',
    type: String,
  })
  async getWeather(@Query('q') cityName: string) {
    return this.weatherService.getWeather(cityName);
  }
}
