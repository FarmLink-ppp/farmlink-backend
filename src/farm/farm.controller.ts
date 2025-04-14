import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { ApiTags, ApiOperation, ApiResponse,ApiParam} from '@nestjs/swagger';


@ApiTags('Farms')
@Controller('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({ status: 201, description: 'Farm successfully created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() createFramDto: CreateFarmDto) {
    return this.farmService.createFarm(createFramDto);
  }
  

  @Get(':id')
  @ApiOperation({ summary: 'Get a farm by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm found and returned' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async findOne(@Param('id') id: string) {
    return this.farmService.getFarmById(Number(id));
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a farm by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async update(@Param('id') id: string, @Body() updateFramDto: UpdateFarmDto) {
    return this.farmService.update(+id, updateFramDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a farm by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async remove(@Param('id') id: string) {
    return this.farmService.remove(+id);
  }
}
