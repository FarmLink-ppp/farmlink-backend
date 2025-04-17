import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
@Injectable()
export class FarmService {
  constructor(private prisma: PrismaService) {}

  async createFarm(createFarmDto: CreateFarmDto, userId: number) {
    try {
      const existingFarm = await this.prisma.farm.findUnique({
        where: { user_id: userId },
      });

      if (existingFarm) {
        throw new ForbiddenException('User already has a farm');
      }
      return await this.prisma.farm.create({
        data: {
          name: createFarmDto.name,
          location: createFarmDto.location,
          area_unit: createFarmDto.areaUnit,
          total_area: createFarmDto.totalArea,
          user: { connect: { id: userId } },
        },
      });
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(error, 'Error creating farm');
    }
  }

  async getFarmByUserId(userId: number) {
    try {
      const farm = await this.prisma.farm.findUnique({
        where: { user_id: userId },
      });
      if (!farm) throw new NotFoundException('Farm not found');
      return farm;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        error,
        'Error fetching farm by user ID',
      );
    }
  }

  async getFarmById(id: number, userId: number) {
    try {
      const farm = await this.prisma.farm.findUnique({
        where: { id, user_id: userId },
        include: {
          divisions: {
            include: {
              plant: true,
            },
          },
        },
      });
      if (!farm) throw new NotFoundException('Farm not found');
      return farm;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        error,
        'Error fetching farm details',
      );
    }
  }

  async update(id: number, updateFarmDto: UpdateFarmDto, userId: number) {
    try {
      const farm = await this.getFarmById(id, userId);

      return await this.prisma.farm.update({
        where: { id },
        data: {
          name: updateFarmDto.name ?? farm.name,
          total_area: updateFarmDto.totalArea ?? farm.total_area,
          location: updateFarmDto.location ?? farm.location,
          area_unit: updateFarmDto.areaUnit ?? farm.area_unit,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error, 'Error updating farm');
    }
  }

  async remove(id: number, userId: number) {
    try {
      await this.getFarmById(id, userId);
      return await this.prisma.farm.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error, 'Error deleting farm');
    }
  }
}
