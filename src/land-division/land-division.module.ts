import { Module } from '@nestjs/common';
import { LandDivisionService } from './land-division.service';
import { LandDivisionController } from './land-division.controller';
import { FarmService } from 'src/farm/farm.service';
import { PlantService } from 'src/plant/plant.service';

@Module({
  providers: [LandDivisionService, FarmService, PlantService],
  controllers: [LandDivisionController],
})
export class LandDivisionModule {}
