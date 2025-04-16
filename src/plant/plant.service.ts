import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async createPlant(createPlantDto: CreatePlantDto) {
    return this.prisma.plant.create({
      data: createPlantDto,
    });
  }
  async findAll() {
    return this.prisma.plant.findMany({
      include: {
        land_divisions: true, // Optional: includes related land divisions
      },
    });
  }

  async getPlantById(id: number) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) {
      throw new NotFoundException('Plant not found');}
    
    return plant;
  }
  async update(id: number, updatePlantDto: UpdatePlantDto) {
    const plant = await this.getPlantById(id);
    return this.prisma.plant.update({
      where: { id },
      data: {
        name: updatePlantDto.name ?? plant.name,
        description: updatePlantDto.description ?? plant.description,
        image_url: updatePlantDto.imageUrl ?? plant.image_url,
    
    }  });
  }
  async remove(id: number) {
    return this.prisma.plant.delete({ where: { id } });
  }
  
}

