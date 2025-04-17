import {
  Controller,
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

@ApiResponse({
  status: 500,
  description: 'Internal server error',
})
@Auth()
@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @ApiOperation({ summary: 'Create a new plant' })
  @ApiResponse({ status: 201, description: 'Plant created successfully' })
  @Post()
  create(@Body() createPlantDto: CreatePlantDto) {
    return this.plantService.createPlant(createPlantDto);
  }

  @ApiOperation({ summary: 'Get a specific plant by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the plant to retrieve',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantService.getPlantById(id);
  }
  @ApiOperation({ summary: 'Update a plant by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the plant to update',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    return this.plantService.update(id, updatePlantDto);
  }

  @ApiOperation({ summary: 'Delete a plant by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the plant to delete',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantService.remove(id);
  }
}
