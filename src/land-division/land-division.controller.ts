import {
  Get,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { LandDivisionService } from './land-division.service';
import { CreateLandDivisionDto } from './dto/create-land-division.dto';
import { UpdateLandDivisionDto } from './dto/update-land-division.dto';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { RequestWithUser } from 'src/common/types/auth.types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';

@Auth()
@ApiController('land-divisions')
export class LandDivisionController {
  constructor(private readonly landDivisionService: LandDivisionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new land division' })
  @ApiBody({ type: CreateLandDivisionDto })
  @ApiResponse({
    status: 201,
    description: 'Land division created successfully',
  })
  async create(
    @Body() createDto: CreateLandDivisionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.createLandDivision(createDto, req.user.id);
  }

  @Get('farm/:farmId')
  @ApiOperation({ summary: 'Get all land divisions for a specific farm' })
  @ApiResponse({
    status: 200,
    description: 'List of land divisions for the specified farm',
  })
  @ApiParam({ name: 'farmId', type: Number, description: 'ID of the farm' })
  async getAllByFarmId(
    @Param('farmId', ParseIntPipe) farmId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.getLandDivisionsByFarmId(
      farmId,
      req.user.id,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get land division by ID' })
  @ApiResponse({ status: 200, description: 'Return land division' })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.getLandDivisionById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a land division' })
  @ApiResponse({
    status: 200,
    description: 'Land division updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division to update',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLandDivisionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.updateLandDivision(
      id,
      updateDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a land division' })
  @ApiResponse({
    status: 200,
    description: 'Land division deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division to delete',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.deleteLandDivision(id, req.user.id);
  }

  @Get(':id/plant')
  @ApiOperation({ summary: 'Get the plant planted in this land division' })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division',
  })
  async getPlant(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.getPlantByLandDivisionId(id, req.user.id);
  }
}
