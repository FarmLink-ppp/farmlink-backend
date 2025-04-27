import { Module } from '@nestjs/common';
import { DailyTipService } from './daily-tip.service';
import { DailyTipController } from './daily-tip.controller';

@Module({
  controllers: [DailyTipController],
  providers: [DailyTipService],
})
export class DailyTipModule {}
