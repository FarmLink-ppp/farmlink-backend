import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmploymentStatus } from '@prisma/client';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async createWorker(data: CreateWorkerDto, userId: number) {
    try {
      return this.prisma.worker.create({
        data: {
          name: data.name,
          image_url: data.imageUrl,
          contact: data.contact,
          User: {
            connect: { id: userId },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed to create worker');
    }
  }

  async findOneWorker(id: number, userId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id, employerId: userId },
      include: {
        assignments: true,
      },
    });

    if (!worker) {
      throw new NotFoundException(`Worker not found`);
    }

    return worker;
  }

  async updateWorker(id: number, data: UpdateWorkerDto, userId: number) {
    const worker = await this.findOneWorker(id, userId);

    try {
      return this.prisma.worker.update({
        where: { id },
        data: {
          name: data.name ?? worker.name,
          image_url: data.imageUrl ?? worker.image_url,
          contact: data.contact ?? worker.contact,
          employment_status: data.employmentStatus ?? worker.employment_status,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed to update worker');
    }
  }

  async removeWorker(id: number, userId: number) {
    await this.findOneWorker(id, userId);

    try {
      await this.prisma.worker.delete({
        where: { id: id },
      });
      return { message: 'worker deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed to delete worker');
    }
  }

  async findByEmployer(userId: number) {
    try {
      return this.prisma.worker.findMany({
        where: { employerId: userId },
        include: {
          assignments: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to find workers b employer',
      );
    }
  }

  async findByStatus(status: EmploymentStatus, userId: number) {
    try {
      return this.prisma.worker.findMany({
        where: { employment_status: status, employerId: userId },
        include: {
          assignments: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to find workers by status',
      );
    }
  }
  async updateProfileImage(id: number, imageUrl: string, userId: number) {
    await this.findOneWorker(id, userId);

    try {
      return this.prisma.worker.update({
        where: { id },
        data: {
          image_url: imageUrl,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to update worker profile image',
      );
    }
  }
}
