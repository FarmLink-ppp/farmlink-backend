import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  ParseEnumPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TaskStatus } from '@prisma/client';
import { RequestWithUser } from 'src/common/types/auth.types';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.createTask(createTaskDto, req.user.id);
  }

  @Get()
  getTasksForUser(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksForUser(req.user.id);
  }

  @Get('today')
  getTasksToBeDoneByToday(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksToBeDoneByToday(req.user.id);
  }

  @Get('by-status')
  async getTasksByStatus(
    @Query('status', new ParseEnumPipe(TaskStatus)) status: TaskStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.getTasksByStatus(req.user.id, status);
  }

  @Patch(':id')
  updateTask(
    @Param('id') taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.updateTask(taskId, updateTaskDto, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') taskId: number,
    @Body('status', new ParseEnumPipe(TaskStatus)) status: TaskStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.updateTaskStatus(taskId, status, req.user.id);
  }

  @Post(':id/assign')
  assignWorker(
    @Param('id') taskId: number,
    @Body('workerId') workerId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.assignWorkerToTask(taskId, workerId, req.user.id);
  }
}
