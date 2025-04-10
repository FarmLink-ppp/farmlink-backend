import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FarmService } from './farm.service';

@Controller('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  async create(@Body() data: any) {
    return this.farmService.createFarm(data);
  }

  @Get()
  async findAll() {
    return this.farmService.getFarms();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.farmService.getFarmById(Number(id));
  }
}
