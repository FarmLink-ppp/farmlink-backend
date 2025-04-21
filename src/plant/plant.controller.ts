import {
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';

@Auth()
@ApiController('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plant' })
  @ApiResponse({ status: 201, description: 'Plant created successfully' })
  create(@Body() createPlantDto: CreatePlantDto) {
    return this.plantService.createPlant(createPlantDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Plant found and returned',
  })
  @ApiResponse({
    status: 404,
    description: 'Plant not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the plant to retrieve',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantService.getPlantById(id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a plant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Plant updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Plant not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the plant to update',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    return this.plantService.update(id, updatePlantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Plant deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Plant not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the plant to delete',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantService.remove(id);
  }
}
