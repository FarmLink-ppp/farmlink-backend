import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly API_KEY = '0450eac5da790aef62d2c5df12dbd9e2';
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  async getWeather(city_name: string) {
    try {
      const url = `${this.BASE_URL}?q=${city_name}&appid=${this.API_KEY}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Error fetching weather data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

