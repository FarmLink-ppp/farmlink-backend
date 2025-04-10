import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LandDivisionService } from './land-division.service';

@Controller('land-divisions')
export class LandDivisionController {
  constructor(private readonly landDivisionService: LandDivisionService) {}

  @Post()
  async create(@Body() data: any) {
    return this.landDivisionService.createLandDivision(data);
  }

  @Get()
  async findAll() {
    return this.landDivisionService.getLandDivisions();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.landDivisionService.getLandDivisionById(Number(id));
  }
}
