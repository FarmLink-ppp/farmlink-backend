import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, UnauthorizedException, ParseIntPipe } from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { ApiOperation, ApiResponse,ApiParam, ApiBearerAuth, ApiCookieAuth} from '@nestjs/swagger';
import { RequestWithUser } from 'src/common/types/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
@Controller('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({ status: 201, description: 'Farm successfully created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 403, description: 'User already has a farm' })
  async create(@Body() createFramDto: CreateFarmDto,@Req() req: RequestWithUser,) {
    if(!req.user || ! req.user.id ) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    return this.farmService.createFarm(createFramDto, userId);
  }
  

  @Get(':id')
  @ApiOperation({ summary: 'Get the authenticated user\'s farm by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm found and returned' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async findOne(@Param('id',ParseIntPipe) id: number,@Req() req: RequestWithUser) {
    if(!req.user || ! req.user.id ) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    return this.farmService.getFarmById(id,userId);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a farm ' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async update(@Param('id',ParseIntPipe) id: number, @Body() updateFramDto: UpdateFarmDto,@Req() req: RequestWithUser) {
    if(!req.user || ! req.user.id ) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    return this.farmService.update(id, updateFramDto,userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a farm by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async remove(@Param('id',ParseIntPipe) id: number,@Req() req: RequestWithUser) {
    if(!req.user || ! req.user.id ) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    return this.farmService.remove(id,userId);
  }
}
