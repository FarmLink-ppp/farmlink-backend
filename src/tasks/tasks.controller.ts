import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  ParseEnumPipe,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';
import { RequestWithUser } from 'src/common/types/auth.types';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateTaskStatusDto } from './dto/update-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';

@Auth()
@ApiController('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
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
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.createTask(createTaskDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  getTasksForUser(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksForUser(req.user.id);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get tasks to be done by today' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
  })
  getTasksToBeDoneByToday(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksToBeDoneByToday(req.user.id);
  }

  @Get('by-status')
  @ApiOperation({ summary: 'Get tasks by status' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: true, type: String })
  getTasksByStatus(
    @Query('status', new ParseEnumPipe(TaskStatus)) status: TaskStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.getTasksByStatus(req.user.id, status);
  }

  @Get('upcoming')  // New endpoint for upcoming tasks
  @ApiOperation({ summary: 'Get upcoming tasks (PENDING or IN_PROGRESS)' })
  getUpcomingTasks(@Req() req: RequestWithUser) {
    return this.tasksService.getUpcomingTasks(req.user.id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiBody({
    description: 'Update task',
    type: UpdateTaskDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    type: Number,
  })
  updateTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.updateTask(taskId, updateTaskDto, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    type: Number,
  })
  @ApiBody({
    description: 'Update task status',
    type: UpdateTaskStatusDto,
  })
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

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign worker to task' })
  @ApiResponse({
    status: 200,
    description: 'Worker assigned to task successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    type: Number,
  })
  @ApiBody({
    description: 'Assign worker to task',
    type: AssignTaskDto,
  })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    type: Number,
  })
  deleteTask(
    @Param('id', ParseIntPipe) taskId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.deleteTask(taskId, req.user.id);
  }
}
