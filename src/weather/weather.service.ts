import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly API_KEY: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.API_KEY = this.configService.get<string>('OPENWEATHER_API_KEY')!;

  }

  async getWeather(city_name: string): Promise<any> {
    const url = `${this.BASE_URL}?q=${city_name}&appid=${this.API_KEY}`;

    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError<any>) => {
          this.logger.error(`Failed to fetch weather for "${city_name}": ${error.message}`);
          throw error;
        }),
      ),
    );

    return data;
  }
}



