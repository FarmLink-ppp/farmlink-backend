import { Module } from '@nestjs/common';
import { LandDivisionService } from './land-division.service';
import { LandDivisionController } from './land-division.controller';

@Module({
  providers: [LandDivisionService],
  controllers: [LandDivisionController]
})
export class LandDivisionModule {}
