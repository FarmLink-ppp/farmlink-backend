import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { WeatherResponse } from 'src/common/types/weather.types';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly API_KEY: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.API_KEY = this.configService.get<string>('OPENWEATHER_API_KEY');
    if (!this.API_KEY) {
      this.logger.error('OpenWeather API key is not set in the configuration.');
      throw new Error(
        'OpenWeather API key is not set in the environment variables',
      );
    }
  }

  async getWeather(cityName: string): Promise<WeatherResponse> {
    if (!cityName.trim()) {
      this.logger.error('City name cannot be empty');
      throw new BadRequestException('City name cannot be empty');
    }
    const url = `${this.BASE_URL}?q=${encodeURIComponent(cityName)}&units=metric&appid=${this.API_KEY}`;

    const { data } = await firstValueFrom(
      this.httpService.get<WeatherResponse>(url).pipe(
        catchError((error: AxiosError) => {
          switch (error.status) {
            case 401:
              this.logger.error(
                'Invalid API key provided for OpenWeather API.',
              );
              throw new UnauthorizedException(
                'Invalid API key provided for OpenWeather API.',
              );
            case 404:
              this.logger.error('City not found in OpenWeather API.');
              throw new NotFoundException('City not found in OpenWeather API.');
            case 400:
              this.logger.error('Bad request to OpenWeather API.');
              throw new BadRequestException('Bad request to OpenWeather API.');
            case 429:
              this.logger.error('Too many requests to OpenWeather API.');
              throw new BadRequestException(
                'Too many requests to OpenWeather API.',
              );
            default:
              this.logger.error(
                `Unexpected error from OpenWeather API: ${error.message}`,
              );
              throw new BadRequestException(
                `Unexpected error from OpenWeather API: ${error.message}`,
              );
          }
        }),
      ),
    );

    return data;
  }
}
