import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PlantService } from './plant.service';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post()
  async create(@Body() data: any) {
    return this.plantService.createPlant(data);
  }

  @Get()
  async findAll() {
    return this.plantService.getPlants();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.plantService.getPlantById(Number(id));
  }
}
