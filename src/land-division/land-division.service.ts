import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateLandDivisionDto } from './dto/create-land-division.dto';
import { UpdateLandDivisionDto } from './dto/update-land-division.dto';
import { FarmService } from 'src/farm/farm.service';
import { PlantService } from 'src/plant/plant.service';

@Injectable()
export class LandDivisionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly farmService: FarmService,
    private readonly plantService: PlantService,
  ) {}

  async createLandDivision(
    createLandDivisionDto: CreateLandDivisionDto,
    userId: number,
  ) {
    const farm = await this.farmService.getFarmByUserId(userId);

    if (createLandDivisionDto.plantId) {
      // check if a plant really exists with that id
      await this.plantService.getPlantById(createLandDivisionDto.plantId);
      return this.prisma.landDivision.create({
        data: {
          name: createLandDivisionDto.name,
          area: createLandDivisionDto.area,
          cultivation_status: createLandDivisionDto.cultivationStatus,
          geolocation: createLandDivisionDto.geolocation,
          farm: { connect: { id: farm.id } },
          plant: { connect: { id: createLandDivisionDto.plantId } },
        },
      });
    }
    return this.prisma.landDivision.create({
      data: {
        name: createLandDivisionDto.name,
        area: createLandDivisionDto.area,
        cultivation_status: createLandDivisionDto.cultivationStatus,
        geolocation: createLandDivisionDto.geolocation,
        farm: { connect: { id: farm.id } },
      },
    });
  }

  async getLandDivisionsByFarmId(userId: number) {
    const farm = await this.farmService.getFarmByUserId(userId);

    return this.prisma.landDivision.findMany({
      where: { farm_id: farm.id },
      include: {
        plant: true,
      },
    });
  }
  async getLandDivisionById(id: number, userId: number) {
    const division = await this.prisma.landDivision.findUnique({
      where: { id },
      include: {
        plant: true,
        farm: {
          select: {
            user_id: true,
          },
        },
      },
    });
    if (!division) {
      throw new NotFoundException('Land division not found');
    }
    if (division.farm.user_id !== userId) {
      throw new ForbiddenException('Access to this land division is forbidden');
    }
    return division;
  }
  async updateLandDivision(
    id: number,
    updateLandDivisionDto: UpdateLandDivisionDto,
    userId: number,
  ) {
    const division = await this.getLandDivisionById(id, userId);
    if (updateLandDivisionDto.plantId) {
      await this.plantService.getPlantById(updateLandDivisionDto.plantId);
    }
    return this.prisma.landDivision.update({
      where: { id },
      data: {
        name: updateLandDivisionDto.name ?? division.name,
        area: updateLandDivisionDto.area ?? division.area,
        cultivation_status:
          updateLandDivisionDto.cultivationStatus ??
          division.cultivation_status,
        geolocation: updateLandDivisionDto.geolocation ?? division.geolocation,
        plant_id:
          updateLandDivisionDto.plantId !== undefined
            ? updateLandDivisionDto.plantId
            : division.plant_id,
      },
      include: {
        plant: true,
      },
    });
  }
  async deleteLandDivision(id: number, userId: number) {
    await this.getLandDivisionById(id, userId);
    return this.prisma.landDivision.delete({
      where: { id },
      include: {
        plant: true,
      },
    });
  }
  async getPlantByLandDivisionId(landDivisionId: number, userId: number) {
    const landDivision = await this.getLandDivisionById(landDivisionId, userId);
    if (!landDivision.plant_id) {
      throw new NotFoundException('This land division has no plant assigned');
    }
    return this.plantService.getPlantById(landDivision.plant_id);
  }
}
