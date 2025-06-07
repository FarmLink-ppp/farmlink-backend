import { Get, Post, Body, Patch, Delete, Req } from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/common/types/auth.types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';

@Auth()
@ApiController('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({ status: 201, description: 'Farm successfully created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 403, description: 'User already has a farm' })
  async create(
    @Body() createFarmDto: CreateFarmDto,
    @Req() req: RequestWithUser,
  ) {
    return this.farmService.createFarm(createFarmDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get the authenticated user's farm" })
  @ApiResponse({ status: 200, description: 'Farm found and returned' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async findOne(@Req() req: RequestWithUser) {
    return this.farmService.getFarmByUserId(req.user.id);
  }

  @Patch('update')
  @ApiOperation({ summary: "Update authenticated user's farm" })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async update(
    @Body() updateFarmDto: UpdateFarmDto,
    @Req() req: RequestWithUser,
  ) {
    return this.farmService.update(updateFarmDto, req.user.id);
  }

  @Delete('delete')
  @ApiOperation({ summary: "Delete authenticated user's farm" })
  @ApiResponse({ status: 200, description: 'Farm deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async remove(@Req() req: RequestWithUser) {
    return this.farmService.remove(req.user.id);
  }
}
