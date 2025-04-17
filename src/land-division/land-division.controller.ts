import {
  Controller,
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
@ApiResponse({
  status: 500,
  description: 'Internal server error',
})
@Auth()
@Controller('land-divisions')
export class LandDivisionController {
  constructor(private readonly landDivisionService: LandDivisionService) {}

  @ApiOperation({ summary: 'Create a new land division' })
  @ApiBody({ type: CreateLandDivisionDto })
  @ApiResponse({
    status: 201,
    description: 'Land division created successfully',
  })
  @Post()
  async create(
    @Body() createDto: CreateLandDivisionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.createLandDivision(createDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all land divisions for a specific farm' })
  @ApiParam({ name: 'farmId', type: Number, description: 'ID of the farm' })
  @ApiResponse({
    status: 200,
    description: 'List of land divisions for the specified farm',
  })
  @Get('farm/:farmId')
  async getAllByFarmId(
    @Param('farmId', ParseIntPipe) farmId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.getLandDivisionsByFarmId(
      farmId,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Get land division by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division',
  })
  @ApiResponse({ status: 200, description: 'Return land division' })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.getLandDivisionById(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update a land division' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Land division updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @Patch(':id')
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

  @ApiOperation({ summary: 'Delete a land division' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Land division deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.deleteLandDivision(id, req.user.id);
  }

  @ApiOperation({ summary: 'Get the plant planted in this land division' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the land division',
  })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  @Get(':id/plant')
  async getPlant(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.landDivisionService.getPlantByLandDivisionId(id, req.user.id);
  }
}
