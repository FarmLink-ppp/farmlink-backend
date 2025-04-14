import { Injectable,NotFoundException,ConflictException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Farm } from '@prisma/client';  
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
@Injectable()
export class FarmService {
  constructor(private prisma: PrismaService) {}

  async createFarm(createFarmDto: CreateFarmDto) {
  
    // If you want to associate the farm with the authenticated user, set user_id here
    const farm = await this.prisma.farm.create({
      data: {
        name: createFarmDto.name,
        location: createFarmDto.location,
        area_unit: createFarmDto.areaUnit, // Map areaUnit to area_unit
        total_area: createFarmDto.totalArea, // Map totalArea to total_area
        user: { connect: { id: createFarmDto.userId } }, // Ensure user is connected by ID
      },
    });
    return farm;
  }
  


  async getFarmById(id: number) {
    const farm= this.prisma.farm.findUnique({
      where: { id },
      include: {
        divisions: {
          include: {
            plant: true,
          },
        },
      },
    });
    if (!farm) {
      throw new NotFoundException('farm not found');
    }
    return farm;
  }
  async update(id: number, updateFarmDto: UpdateFarmDto){
    const farm=await this.getFarmById(id);
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
  
    return this.prisma.farm.update({
      where: { id },
      data: {
        name: updateFarmDto.name ?? farm.name,
        total_area: updateFarmDto.totalArea ?? farm.total_area,
        location: updateFarmDto.location ?? farm.location,
        area_unit: updateFarmDto.areaUnit ?? farm.area_unit,
      },
    });
  }
  async remove(id: number) {
    const farm = await this.getFarmById(id);
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    return this.prisma.farm.delete({
      where: { id },
    });
  }
}
