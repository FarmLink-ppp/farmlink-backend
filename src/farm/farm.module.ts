import { Module } from '@nestjs/common';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';

@Module({
  providers: [FarmService],
  controllers: [FarmController],
  exports: [FarmService],
})
export class FarmModule {}
