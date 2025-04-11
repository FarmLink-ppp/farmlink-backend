import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {

  constructor(private prisma: PrismaService) {}

  async createTask(data: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'PENDING', 
        start_date: new Date(data.start_date),
        due_date: new Date(data.due_date),
        land_division_id: data.land_division_id ?? null,
        user_id: userId,
      },
    });
  }

  async getTasksForUser(userId: number) {
    return this.prisma.task.findMany({
      where: { user_id: userId },
      include: { assignments: { include: { worker: true } } },
      orderBy: { due_date: 'asc' },
    });
  }

  async getTasksToBeDoneByDate(userId: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    return this.prisma.task.findMany({
      where: {
        user_id: userId,
        status: {
          in: ['PENDING', 'IN_PROGRESS'], // tâches pas encore complétées
        },
        start_date: {
          lte: endOfDay,
        },
        due_date: {
          gte: startOfDay,
        },
      },
      orderBy: {
        start_date: 'asc',
      },
    });
  }
  
  async getTasksByStatus(userId: number, status: TaskStatus) {
    return this.prisma.task.findMany({
      where: {
        user_id: userId,
        status: status,
      },
      orderBy: {
        due_date: 'asc',
      },
      include: {
        assignments: {
          include: { worker: true },
        },
      },
    });
  }
  
  async updateTask(taskId: number, data: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        start_date: new Date(data.start_date as string),
        due_date: new Date(data.due_date as string),
        land_division_id: data.land_division_id ?? null,
      },
    });
  }
  
  async updateTaskStatus(taskId: number, status: TaskStatus) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async assignWorkerToTask(taskId: number, workerId: number) {
    return this.prisma.taskAssignment.create({
      data: {
        task_id: taskId,
        worker_id: workerId,
      },
    });
  }
}
