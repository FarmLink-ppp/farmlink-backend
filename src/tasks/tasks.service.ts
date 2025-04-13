import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(data: CreateTaskDto, userId: number) {
    const startDate = new Date(data.startDate);
    const dueDate = new Date(data.dueDate);
    if (startDate > dueDate)
      throw new BadRequestException('Start date cannot be after due date');

    try {
      return this.prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: TaskStatus.PENDING,
          start_date: startDate,
          due_date: dueDate,
          land_division_id: data.landDivisionId ?? null,
          user_id: userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed to create task');
    }
  }

  async getTaskById(taskId: number) {
    try {
      return this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignments: {
            include: { worker: true },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to retrieve task by ID',
      );
    }
  }

  async getTasksForUser(userId: number) {
    try {
      return this.prisma.task.findMany({
        where: { user_id: userId },
        include: { assignments: { include: { worker: true } } },
        orderBy: { due_date: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to retrieve tasks for user',
      );
    }
  }

  async getTasksToBeDoneByToday(userId: number) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      return this.prisma.task.findMany({
        where: {
          user_id: userId,
          status: {
            in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
          },
          OR: [
            // tasks that are due today
            {
              due_date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            {
              due_date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            // tasks that are in progress and started today
            {
              status: TaskStatus.IN_PROGRESS,
              start_date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          ],
        },
        orderBy: {
          due_date: 'asc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to retrieve tasks for today',
      );
    }
  }

  async getTasksByStatus(userId: number, status: TaskStatus) {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to retrieve tasks by status',
      );
    }
  }

  async updateTask(taskId: number, data: UpdateTaskDto, userId: number) {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new BadRequestException('Task not found');
    }
    if (task.user_id !== userId) {
      throw new BadRequestException(
        'You are not authorized to update this task',
      );
    }
    try {
      return this.prisma.task.update({
        where: { id: taskId },
        data: {
          title: data.title ?? task.title,
          description: data.description ?? task.description,
          priority: data.priority ?? task.priority,
          start_date: data.startDate
            ? new Date(data.startDate)
            : task.start_date,
          due_date: data.dueDate ? new Date(data.dueDate) : task.due_date,
          land_division_id: data.landDivisionId ?? task.land_division_id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Failed to update task');
    }
  }

  async updateTaskStatus(taskId: number, status: TaskStatus, userId: number) {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new BadRequestException('Task not found');
    }
    if (task.user_id !== userId) {
      throw new BadRequestException(
        'You are not authorized to update this task',
      );
    }

    try {
      return this.prisma.task.update({
        where: { id: taskId },
        data: { status },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to update task status',
      );
    }
  }

  async assignWorkerToTask(taskId: number, workerId: number, userId: number) {
    try {
      const task = await this.getTaskById(taskId);
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      if (task.user_id !== userId) {
        throw new BadRequestException(
          'You are not authorized to assign a worker to this task',
        );
      }
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
      });
      if (!worker) {
        throw new BadRequestException('Worker not found');
      }
      const existingAssignment = await this.prisma.taskAssignment.findFirst({
        where: {
          task_id: taskId,
          worker_id: workerId,
        },
      });
      if (existingAssignment) {
        return existingAssignment;
      }
      return this.prisma.taskAssignment.create({
        data: {
          task_id: taskId,
          worker_id: workerId,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        error,
        'Failed to assign worker to task',
      );
    }
  }
}
