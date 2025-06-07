import { Module } from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantController } from './plant.controller';
import { FarmModule } from 'src/farm/farm.module';

@Module({
  imports: [FarmModule],
  providers: [PlantService],
  controllers: [PlantController],
  exports: [PlantService],
})
export class PlantModule {}
