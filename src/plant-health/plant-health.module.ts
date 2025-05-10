import { Module } from '@nestjs/common';
import { PlantHealthService } from './plant-health.service';
import { PlantHealthController } from './plant-health.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PlantHealthController],
  providers: [PlantHealthService],
})
export class PlantHealthModule {}
