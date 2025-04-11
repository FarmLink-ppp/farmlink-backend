import { Controller, Get, Post, Body, Patch, Param, Delete,Query, UseGuards, Req, ParseEnumPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TaskStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.createTask(createTaskDto, req.user.id);
  }

  @Get()
  getTasksForUser(@Req() req) {
    return this.tasksService.getTasksForUser(req.user.id); 
  }

  @Get('today')
  getTasksToBeDoneByDate(@Req() req) { 
    const today = new Date();
    return this.tasksService.getTasksToBeDoneByDate(req.user.id, today); 
  }

  @Get('by-status')
  async getTasksByStatus(
    @Query('status', new ParseEnumPipe(TaskStatus)) status: TaskStatus,
    @Req() req
  ) {
    return this.tasksService.getTasksByStatus(req.user.id, status);
  }

  @Patch(':id')
updateTask(
  @Param('id') id: string,
  @Body() updateTaskDto: UpdateTaskDto
) {
  return this.tasksService.updateTask(Number(id), updateTaskDto);
}

  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body('status', new ParseEnumPipe(TaskStatus)) status: TaskStatus) {
    return this.tasksService.updateTaskStatus(Number(id), status);
  }

  @Post(':id/assign')
  assignWorker(
    @Param('id') taskId: number,
    @Body('workerId') workerId: number
  ) {
    return this.tasksService.assignWorkerToTask(Number(taskId), workerId);
  }
}
