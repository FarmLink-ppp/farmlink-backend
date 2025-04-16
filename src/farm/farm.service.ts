import { Injectable,NotFoundException,ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Farm } from '@prisma/client';  
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
@Injectable()
export class FarmService {
  constructor(private prisma: PrismaService) {}

  async createFarm(createFarmDto: CreateFarmDto,userId: number) {
    const existingFarm = await this.prisma.farm.findUnique({
      where: { user_id: userId },
    });
  
    if (existingFarm) {
      throw new ForbiddenException('User already has a farm');
    }
    // If you want to associate the farm with the authenticated user, set user_id here
    const farm = await this.prisma.farm.create({
      data: {
        name: createFarmDto.name,
        location: createFarmDto.location,
        area_unit: createFarmDto.areaUnit, // Map areaUnit to area_unit
        total_area: createFarmDto.totalArea, // Map totalArea to total_area
        user: { connect: { id: userId  } }, // Ensure user is connected by ID
      },
    });
    return farm;
  }
  


  async getFarmById(id: number,userId: number) {
    const farm= this.prisma.farm.findUnique({
      where: { id,user_id: userId, },
      include: {
        divisions: {
          include: {
            plant: true,
          },
        },
      },
    });
    if (!farm) {
      throw new NotFoundException('Farm not found or not belong to the user');
    }
    return farm;
  }
  async update(id: number, updateFarmDto: UpdateFarmDto, userId: number){
    const farm = await this.getFarmById(id, userId);
    if (!farm) {
      throw new NotFoundException('Farm not found or not belong to the user');
    }
    if (farm.user_id !== userId) {
      throw new NotFoundException('Access denied');
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
  async remove(id: number, userId: number) {
    const farm = await this.getFarmById(id,userId);
    return this.prisma.farm.delete({
      where: { id },
    });
  }
}
