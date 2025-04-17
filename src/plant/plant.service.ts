import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async createPlant(createPlantDto: CreatePlantDto) {
    try {
      return await this.prisma.plant.create({
        data: {
          name: createPlantDto.name,
          description: createPlantDto.description,
          image_url: createPlantDto.imageUrl,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error creating plant');
    }
  }

  async getPlantById(id: number) {
    const plant = await this.prisma.plant.findUnique({ where: { id } });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    return plant;
  }

  async update(id: number, updatePlantDto: UpdatePlantDto) {
    const plant = await this.getPlantById(id);
    return await this.prisma.plant.update({
      where: { id },
      data: {
        name: updatePlantDto.name ?? plant.name,
        description: updatePlantDto.description ?? plant.description,
        image_url: updatePlantDto.imageUrl ?? plant.image_url,
      },
    });
  }

  async remove(id: number) {
    await this.getPlantById(id);
    return await this.prisma.plant.delete({ where: { id } });
  }
}
