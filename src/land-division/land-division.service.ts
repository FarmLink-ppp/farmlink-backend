import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LandDivision } from '@prisma/client';
import { CreateLandDivisionDto } from './dto/create-land-division.dto';
import { UpdateLandDivisionDto } from './dto/update-land-division.dto';
import { ApiTags } from '@nestjs/swagger';

@Injectable()   
export class LandDivisionService {
  constructor(private prisma: PrismaService) {}

  async createLandDivision(createLandDivisionDto: CreateLandDivisionDto) {
    return this.prisma.landDivision.create({
      data: {
        name: createLandDivisionDto.name,
        area: createLandDivisionDto.area,
        crop_type  : createLandDivisionDto.cropType,
        cultivation_status: createLandDivisionDto.cultivationStatus,
        geolocation: createLandDivisionDto.geolocation,
        farm: { connect: { id: createLandDivisionDto.farmId } }, // Link to a farm
        plant: createLandDivisionDto.plantId ? { connect: { id: createLandDivisionDto.plantId } } : undefined, // Link to a plant if provided
      },
    });
  }

  async getLandDivisionsByFarmId(farmId: number) {
    return this.prisma.landDivision.findMany({
      where: { farm_id: farmId },
      include: {
        plant: true, // This includes the related plant for each land division
      },
    });
  }
  async getLandDivisionById(id: number) {
    const division= this.prisma.landDivision.findUnique({
      where: { id },
      include: {
        plant: true,
        farm: true,
      },
    });
    if (!division) {
      throw new NotFoundException('Land division not found');
    }
    return division;
  }
  async updateLandDivision(id: number, updateLandDivisionDto: UpdateLandDivisionDto) {
    const division = await this.getLandDivisionById(id);
    if (!division) { 
      throw new NotFoundException('Land division not found');
    }

    return this.prisma.landDivision.update({
      where: { id },
      data: {
        name: updateLandDivisionDto.name ?? division.name,
        area: updateLandDivisionDto.area ?? division.area,
        crop_type: updateLandDivisionDto.cropType ?? division.crop_type,
        cultivation_status: updateLandDivisionDto.cultivationStatus ?? division.cultivation_status,
        geolocation: updateLandDivisionDto.geolocation ?? division.geolocation,
        farm_id: updateLandDivisionDto.farmId ??division.farm_id, // Update farm if farmId is provided
        plant_id: updateLandDivisionDto.plantId ?? division.plant_id, // Update plant_id directly if plantId is provided
      },
    });
  }
  async deleteLandDivision(id: number) {
    return this.prisma.landDivision.delete({
      where: { id },
    });
  }

}