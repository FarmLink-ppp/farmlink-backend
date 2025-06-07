import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
@Injectable()
export class FarmService {
  constructor(private prisma: PrismaService) {}

  async createFarm(createFarmDto: CreateFarmDto, userId: number) {
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
  }

  async getFarmByUserId(userId: number) {
    const farm = await this.prisma.farm.findUnique({
      where: { user_id: userId },
    });
    if (!farm) throw new NotFoundException('Farm not found');
    return farm;
  }

  async update(updateFarmDto: UpdateFarmDto, userId: number) {
    const farm = await this.getFarmByUserId(userId);

    return await this.prisma.farm.update({
      where: { user_id: userId },
      data: {
        name: updateFarmDto.name ?? farm.name,
        total_area: updateFarmDto.totalArea ?? farm.total_area,
        location: updateFarmDto.location ?? farm.location,
        area_unit: updateFarmDto.areaUnit ?? farm.area_unit,
      },
    });
  }

  async remove(userId: number) {
    await this.getFarmByUserId(userId);
    return await this.prisma.farm.delete({
      where: { user_id: userId },
    });
  }
}
