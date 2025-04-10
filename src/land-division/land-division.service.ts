import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LandDivision } from '@prisma/client';
import { CreateLandDivisionDto } from './dto/land-division.dto';

@Injectable()   
export class LandDivisionService {
  constructor(private prisma: PrismaService) {}

  async createLandDivision(createLandDivisionDto: CreateLandDivisionDto) {
    return this.prisma.landDivision.create({
      data: createLandDivisionDto,
    });
  }

  async getLandDivisions() {
    return this.prisma.landDivision.findMany({
      include: {
        plant: true,
      },
    });
  }

  async getLandDivisionById(id: number) {
    return this.prisma.landDivision.findUnique({
      where: { id },
      include: {
        plant: true,
      },
    });
  }
}