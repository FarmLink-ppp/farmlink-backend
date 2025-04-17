import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RequestWithUser } from 'src/common/types/auth.types';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiResponse({
  status: 500,
  description: 'Internal server error',
})
@Auth()
@Controller('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({ status: 201, description: 'Farm successfully created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 403, description: 'User already has a farm' })
  @Post()
  async create(
    @Body() createFarmDto: CreateFarmDto,
    @Req() req: RequestWithUser,
  ) {
    return this.farmService.createFarm(createFarmDto, req.user.id);
  }

  @ApiOperation({ summary: "Get the authenticated user's farm by ID" })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm found and returned' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.farmService.getFarmById(id, req.user.id);
  }
  @ApiOperation({ summary: 'Update a farm ' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFarmDto: UpdateFarmDto,
    @Req() req: RequestWithUser,
  ) {
    return this.farmService.update(id, updateFarmDto, req.user.id);
  }

  @ApiOperation({ summary: 'Delete a farm by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.farmService.remove(id, req.user.id);
  }
}
