import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PlantService } from './plant.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plant' })
  @ApiResponse({ status: 201, description: 'Plant created successfully' })
  create(@Body() dto: CreatePlantDto) {
    return this.plantService.createPlant(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all plants' })
  findAll() {
    return this.plantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plant by ID' })
  findOne(@Param('id') id: string) {
    return this.plantService.getPlantById(+id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a plant by ID' })
  update(@Param('id') id: string, @Body() dto: UpdatePlantDto) {
    return this.plantService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plant by ID' })
  remove(@Param('id') id: string) {
    return this.plantService.remove(+id);
  }

}
