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
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TaskStatus } from '@prisma/client';
import { RequestWithUser } from 'src/common/types/auth.types';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateTaskStatusDto } from './dto/update-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';

@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@ApiResponse({
  status: 500,
  description: 'Internal server error',
})
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create task' })
  @ApiBody({
    description: 'Create task',
    type: CreateTaskDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.createTask(createTaskDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get tasks by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  @Get()
  getTasksForUser(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksForUser(req.user.id);
  }

  @ApiOperation({ summary: 'Get tasks to be done by today' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
  })
  @Get('today')
  getTasksToBeDoneByToday(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksToBeDoneByToday(req.user.id);
  }

  @ApiOperation({ summary: 'Get tasks by status' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  @Get('by-status')
  @ApiQuery({ name: 'status', enum: TaskStatus, required: true, type: String })
  getTasksByStatus(
    @Query('status', new ParseEnumPipe(TaskStatus)) status: TaskStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.getTasksByStatus(req.user.id, status);
  }

  @ApiOperation({ summary: 'Update task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    required: true,
    type: Number,
  })
  @ApiBody({
    description: 'Update task',
    type: UpdateTaskDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @Patch(':id')
  updateTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.updateTask(taskId, updateTaskDto, req.user.id);
  }

  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    required: true,
    type: Number,
  })
  @ApiBody({
    description: 'Update task status',
    type: UpdateTaskStatusDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() updateStatusDto: UpdateTaskStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.updateTaskStatus(
      taskId,
      updateStatusDto.status,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Assign worker to task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    required: true,
    type: Number,
  })
  @ApiBody({
    description: 'Assign worker to task',
    type: AssignTaskDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Worker assigned to task successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @Post(':id/assign')
  assignWorker(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() assignTaskDto: AssignTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.assignWorkerToTask(
      taskId,
      assignTaskDto.workerId,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @Delete(':id')
  deleteTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.deleteTask(taskId, req.user.id);
  }
}
