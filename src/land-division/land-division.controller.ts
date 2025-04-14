import { Controller, Get,Delete,Patch, Post, Body, Param } from '@nestjs/common';
import { LandDivisionService } from './land-division.service';
import { CreateLandDivisionDto } from './dto/create-land-division.dto';
import { UpdateLandDivisionDto } from './dto/update-land-division.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
@ApiTags('Land Divisions')
@Controller('land-divisions')
export class LandDivisionController {
  constructor(private readonly landDivisionService: LandDivisionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new land division' })
  @ApiResponse({ status: 201, description: 'Land division created successfully' })
  @ApiBody({ type: CreateLandDivisionDto })
  async create(@Body() createDto: CreateLandDivisionDto) {
    return this.landDivisionService.createLandDivision(createDto);
  }

  @Get('farm/:farmId')
@ApiOperation({ summary: 'Get all land divisions for a specific farm' })
@ApiParam({ name: 'farmId', type: Number, description: 'ID of the farm' })
  @ApiResponse({
    status: 200,
    description: 'List of land divisions for the specified farm',
  })
async getAllByFarmId(@Param('farmId') farmId: string) {
  return this.landDivisionService.getLandDivisionsByFarmId(Number(farmId));
}
  @Get(':id')
  @ApiOperation({ summary: 'Get land division by ID' })
  @ApiResponse({ status: 200, description: 'Land division found' })
  async findOne(@Param('id') id: string) {
    return this.landDivisionService.getLandDivisionById(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a land division' })
  @ApiResponse({ status: 200, description: 'Land division updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLandDivisionDto,
  ) {
    return this.landDivisionService.updateLandDivision(Number(id), updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a land division' })
  @ApiResponse({ status: 200, description: 'Land division deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.landDivisionService.deleteLandDivision(Number(id));
  }
  @Get(':id/plant')
  @ApiOperation({ summary: 'Get the plant planted in this land division' })
  async getPlant(@Param('id') id: string) {
    return this.landDivisionService.getPlantByLandDivisionId(Number(id));
  }
}
