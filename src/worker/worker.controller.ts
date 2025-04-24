import { Controller, Get, Post, Body, Patch, Param, Delete,  Request,UseInterceptors, UploadedFile,BadRequestException } from '@nestjs/common';
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



@Auth()
@ApiController('worker')

export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

   @Post()
   @ApiOperation({ summary: 'Create task' })
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
  create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.createWorker(createWorkerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get workers' })
  @ApiResponse({
    status: 200,
    description: 'workers retrieved successfully',
  })
  findAll() {
    return this.workerService.findAllWorkers();
  }


  @Get('employer/:employerId')
  @ApiOperation({ summary: 'Get workers by employer ID' })
  @ApiResponse({
    status: 200,
    description: 'workers retrieved successfully',
  })

  findByEmployer(@Param('employerId') employerId: string) {
    return this.workerService.findByEmployer(+employerId);
  }


  @Get('status/:status')
  @ApiOperation({ summary: 'Get workers by status' })
  @ApiResponse({
    status: 200,
    description: 'workers retrieved successfully',
  })

  findByStatus(@Param('status') status: EmploymentStatus) {
    return this.workerService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get worker by ID' })
  @ApiResponse({
    status: 200,
    description: 'worker retrieved successfully',
  })

  findOne(@Param('id') id: string) {
    return this.workerService.findOneWorker(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update worker' })
    @ApiResponse({
      status: 200,
      description: 'worker updated successfully',
    })
    @ApiResponse({
      status: 400,
      description: 'Validation error',
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
  update(
    @Param('id') id: string, 
    @Body() updateWorkerDto: UpdateWorkerDto,
    @Request() req
  ) {
    // Récupération de l'ID utilisateur depuis le token JWT
    const userId = req.user.id;
    return this.workerService.updateWorker(+id, updateWorkerDto, userId);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete worker' })
  @ApiResponse({
    status: 200,
    description: 'worker deleted successfully',
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
  remove(@Param('id') id: string,
  @Request() req) {
    const userId = req.user.id;
    return this.workerService.removeWorker(+id,userId);
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
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `worker-${req.params.id}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  )
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Créer l'URL de l'image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${file.filename}`;
    
    return this.workerService.updateProfileImage(+id, imageUrl, req.user.id);
  }





}
