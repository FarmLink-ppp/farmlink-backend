import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Farm } from '@prisma/client';  
import { CreateFarmDto } from './dto/farm.dto';
@Injectable()
export class FarmService {
  constructor(private prisma: PrismaService) {}

  async createFarm(createFarmDto: CreateFarmDto): Promise<Farm> {
    const { user_id, ...farmData } = createFarmDto;
  
    // If you want to associate the farm with the authenticated user, set user_id here
    const farm = await this.prisma.farm.create({
      data: {
        ...farmData,
        user: { connect: { id: user_id } }, // Ensure user is connected by ID if user_id is provided
      },
    });
    return farm;
  }
  

  async getFarms() {
    return this.prisma.farm.findMany({
      include: {
        divisions: {
          include: {
            plant: true,
          },
        },
      },
    });
  }

  async getFarmById(id: number) {
    return this.prisma.farm.findUnique({
      where: { id },
      include: {
        divisions: {
          include: {
            plant: true,
          },
        },
      },
    });
  }
}
