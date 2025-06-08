import {
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';
import { RequestWithUser } from 'src/common/types/auth.types';

@Auth()
@ApiController('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new plant' })
  @ApiResponse({ status: 201, description: 'Plant created successfully' })
  create(@Body() createPlantDto: CreatePlantDto, @Req() req: RequestWithUser) {
    return this.plantService.createPlant(req.user.id, createPlantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all plants' })
  @ApiResponse({
    status: 200,
    description: 'List of all plants',
  })
  findAll(@Req() req: RequestWithUser) {
    return this.plantService.getAllPlants(req.user.id);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total number of plants for the user\'s farm' })
  @ApiResponse({ status: 200, description: 'Total plant count returned' })
  getPlantCount(@Req() req: RequestWithUser) {
    return this.plantService.getPlantCount(req.user.id);
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
  @Patch(':id/update')
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

  @Delete(':id/delete')
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
