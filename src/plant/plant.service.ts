import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePlantDto } from './dto/plant.dto';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async createPlant(createPlantDto: CreatePlantDto) {
    return this.prisma.plant.create({
      data: createPlantDto,
    });
  }
  async getPlants() {
    return this.prisma.plant.findMany();
  }

  async getPlantById(id: number) {
    return this.prisma.plant.findUnique({
      where: { id },
    });
  }
}
