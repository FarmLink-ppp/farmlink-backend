import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { WeatherModule } from './weather/weather.module';
import { FarmModule } from './farm/farm.module';
import { PlantModule } from './plant/plant.module';
import { LandDivisionModule } from './land-division/land-division.module';
import { TasksModule } from './tasks/tasks.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WorkerModule } from './worker/worker.module';
import { FollowModule } from './follow/follow.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { DailyTipModule } from './daily-tip/daily-tip.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('THROTTLE_TTL', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT', 10),
          },
        ],
      }),
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    WeatherModule,
    FarmModule,
    PlantModule,
    LandDivisionModule,
    TasksModule,
    WorkerModule,
    FollowModule,
    FileUploadModule,
    DailyTipModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
