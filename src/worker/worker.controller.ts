import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
  Req,
  Query,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { EmploymentStatus } from '@prisma/client';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/common/types/auth.types';

@Auth()
@ApiController('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @ApiOperation({ summary: 'Create worker' })
  @ApiBody({
    description: 'Create worker',
    type: CreateWorkerDto,
  })
  @ApiResponse({
    status: 201,
    description: 'worker created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(
    @Body() createWorkerDto: CreateWorkerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.workerService.createWorker(createWorkerDto, req.user.id);
  }

  @Get('employer')
  @ApiOperation({ summary: 'Get workers by employer ID' })
  @ApiResponse({
    status: 200,
    description: 'workers retrieved successfully',
  })
  findByEmployer(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.workerService.findByEmployer(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get workers by status' })
  @ApiResponse({
    status: 200,
    description: 'workers retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Worker not found',
  })
  @ApiQuery({
    name: 'status',
    enum: EmploymentStatus,
    required: true,
    description: 'Worker employment status',
  })
  findByStatus(
    @Query('status') status: EmploymentStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.workerService.findByStatus(status, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get worker by ID' })
  @ApiResponse({
    status: 200,
    description: 'worker retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Worker not found',
  })
  @ApiParam({ name: 'id', type: Number, description: 'worker ID' })
  findOneWorker(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.workerService.findOneWorker(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update worker' })
  @ApiResponse({
    status: 200,
    description: 'Worker updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Worker not found',
  })
  @ApiBody({
    description: 'Update worker',
    type: UpdateWorkerDto,
  })
  @ApiParam({
    name: 'id',
    description: 'worker ID',
    type: Number,
  })
  updateWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkerDto: UpdateWorkerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.workerService.updateWorker(id, updateWorkerDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete worker' })
  @ApiResponse({
    status: 200,
    description: 'Worker deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiParam({
    name: 'id',
    description: 'worker ID',
    type: Number,
  })
  removeWorker(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.workerService.removeWorker(id, req.user.id);
  }

  @Post(':id/profile-image')
  @ApiOperation({ summary: 'upload image' })
  @ApiResponse({
    status: 200,
    description: 'image uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiParam({
    name: 'id',
    description: 'worker ID',
    type: Number,
  })
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads/workers/profile-images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadProfileImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'image/*' })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 1,
        })
        .build({ errorHttpStatusCode: 422 }),
    )
    file: Express.Multer.File,
    @Req()
    req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const imageUrl = `/uploads/workers/profile-images/${file.filename}`;
    await this.workerService.updateProfileImage(id, imageUrl, req.user.id);
    return {
      message: 'Profile image updated successfully',
      imageUrl,
    };
  }
}
