import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LandDivision } from '@prisma/client';
import { CreateLandDivisionDto } from './dto/create-land-division.dto';
import { UpdateLandDivisionDto } from './dto/update-land-division.dto';
import { ApiTags } from '@nestjs/swagger';

@Injectable()   
export class LandDivisionService {
  constructor(private prisma: PrismaService) {}

  async createLandDivision(createLandDivisionDto: CreateLandDivisionDto,userId: number) {
    // Check if the user is associated with the farm
  const farm = await this.prisma.farm.findUnique({
    where: { id: createLandDivisionDto.farmId },
    include: { user: true }, // Assuming the farm has a relation to the user (owner)
  });
  if (!farm) {
    throw new Error('Farm not found');
  }
  if (farm.user.id !== userId) {
    throw new UnauthorizedException('You are not authorized to create a land division for this farm');
  }
    return this.prisma.landDivision.create({
      data: {
        name: createLandDivisionDto.name,
        area: createLandDivisionDto.area,
        cultivation_status: createLandDivisionDto.cultivationStatus,
        geolocation: createLandDivisionDto.geolocation,
        farm: { connect: { id: createLandDivisionDto.farmId } }, // Link to a farm
        plant: { connect: { id: createLandDivisionDto.plantId } },// Link to a plant if provided
      },
    });
  }

  async getLandDivisionsByFarmId(farmId: number,userId: number) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
      select: { user_id: true }, // Adjust this field based on your schema (user or user_id)
    });
  
    if (!farm) {
      throw new Error('Farm not found');
    }
  
    if (farm.user_id !== userId) {
      throw new UnauthorizedException('You are not authorized to access this farm\'s land divisions');
    }
    return this.prisma.landDivision.findMany({
      where: { farm_id: farmId },
      include: {
        plant: true, // This includes the related plant for each land division
      },
    });
  }
  async getLandDivisionById(id: number,userId: number) {
    const division = await this.prisma.landDivision.findUnique({
      where: { id },
      include: {
        plant: true,
        farm: {
          select: {
            user_id: true, // Explicitly select the user_id field
          },
        },
      },
    });
    if (!division) {
      throw new NotFoundException('Land division not found');
    }
    if (division.farm?.user_id !== userId) {
      throw new UnauthorizedException('You are not authorized to access this land division');
    }
    return division;
  }
  async updateLandDivision(id: number, updateLandDivisionDto: UpdateLandDivisionDto,userId: number) {
    const division = await this.getLandDivisionById(id, userId);
    return this.prisma.landDivision.update({
      where: { id },
      data: {
        name: updateLandDivisionDto.name ?? division.name,
        area: updateLandDivisionDto.area ?? division.area,
        cultivation_status: updateLandDivisionDto.cultivationStatus ?? division.cultivation_status,
        geolocation: updateLandDivisionDto.geolocation ?? division.geolocation,
        farm_id: updateLandDivisionDto.farmId ??division.farm_id, // Update farm if farmId is provided
        plant_id: updateLandDivisionDto.plantId ?? division.plant_id, // Update plant_id directly if plantId is provided
      },
    });
  }
  async deleteLandDivision(id: number, userId: number) {
    const division = await this.getLandDivisionById(id, userId);
    return this.prisma.landDivision.delete({
      where: { id },
    });
  }
  async getPlantByLandDivisionId(landDivisionId: number, userId: number) {
    const landDivision = await this.prisma.landDivision.findUnique({
      where: { id: landDivisionId },
      include: {
        plant: true,
        farm: true,
      },
    });
  
    if (!landDivision) {
      throw new Error('Land division not found');
    }
    if (landDivision.farm.user_id !== userId) {
      throw new UnauthorizedException('You are not authorized to access this land division');
    }
  
  
    return landDivision.plant;
  }
}