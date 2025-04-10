import { Module } from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantController } from './plant.controller';

@Module({
  providers: [PlantService],
  controllers: [PlantController]
})
export class PlantModule {}
