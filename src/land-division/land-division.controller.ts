import { Controller, Get,Delete,Patch, Post, Body, Param, ParseIntPipe, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import { LandDivisionService } from './land-division.service';
import { CreateLandDivisionDto } from './dto/create-land-division.dto';
import { UpdateLandDivisionDto } from './dto/update-land-division.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { RequestWithUser } from 'src/common/types/auth.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@ApiResponse({
  status: 500,
  description: 'Internal server error',
})
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('land-divisions')
export class LandDivisionController {
  constructor(private readonly landDivisionService: LandDivisionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new land division' })
  @ApiResponse({ status: 201, description: 'Land division created successfully' })
  @ApiBody({ type: CreateLandDivisionDto })
  async create(@Body() createDto: CreateLandDivisionDto, @Req() req: RequestWithUser) {
    const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
    return this.landDivisionService.createLandDivision(createDto, userId);
  }

  @Get('farm/:farmId')
@ApiOperation({ summary: 'Get all land divisions for a specific farm' })
@ApiParam({ name: 'farmId', type: Number, description: 'ID of the farm' })
  @ApiResponse({
    status: 200,
    description: 'List of land divisions for the specified farm',
  })
async getAllByFarmId(@Param('farmId',ParseIntPipe) farmId: number, @Req() req: RequestWithUser) {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
  return this.landDivisionService.getLandDivisionsByFarmId(farmId,userId);
}
  @Get(':id')
  @ApiOperation({ summary: 'Get land division by ID' })
  @ApiResponse({ status: 200, description: 'Land division found' })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  async findOne(@Param('id',ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
    return this.landDivisionService.getLandDivisionById(id,userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a land division' })
  @ApiResponse({ status: 200, description: 'Land division updated successfully' })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  async update(
    @Param('id',ParseIntPipe) id:number,
    @Body() updateDto: UpdateLandDivisionDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
    return this.landDivisionService.updateLandDivision(id, updateDto,userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a land division' })
  @ApiResponse({ status: 200, description: 'Land division deleted successfully' })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  async remove(@Param('id',ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
    return this.landDivisionService.deleteLandDivision(id,userId);
  }
  @Get(':id/plant')
  @ApiOperation({ summary: 'Get the plant planted in this land division' })
  @ApiResponse({ status: 404, description: 'Land division not found' })
  async getPlant(@Param('id',ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
    return this.landDivisionService.getPlantByLandDivisionId(id,userId);
  }
}
