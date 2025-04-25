import { Controller, Get, Post, Body, Patch, Param, Delete,  Request,UseInterceptors, UploadedFile,BadRequestException, ParseIntPipe } from '@nestjs/common';
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
  createWorker(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.createWorker(createWorkerDto);
  }

 


  @Get('employer/:employerId')
  @ApiOperation({ summary: 'Get workers by employer ID' })
  @ApiResponse({
    status: 200,
    description: 'workers retrieved successfully',
  })

  findByEmployer(@Param('employerId',ParseIntPipe) employerId: number,
  @Request() req)
 {
    const userId = req.user.id;
    return this.workerService.findByEmployer(employerId, userId);
  }


  @Get('status/:status')
  @ApiOperation({ summary: 'Get workers by status' })
  @ApiResponse({
    status: 200,
    description: 'workers retrieved successfully',
  })

  findByStatus(@Param('status') status: EmploymentStatus,
  @Request() req) {
    const userId = req.user.id;
    return this.workerService.findByStatus(status, userId);
   }

  @Get(':id')
  @ApiOperation({ summary: 'Get worker by ID' })
  @ApiResponse({
    status: 200,
    description: 'worker retrieved successfully',
  })

  findOneWorker(@Param('id',ParseIntPipe) id: number,
  @Request() req) {
    const userId = req.user.id;
    return this.workerService.findOneWorker(id, userId);
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
  
  
    updateWorker(
    @Param('id',ParseIntPipe) id: number, 
    @Body() updateWorkerDto: UpdateWorkerDto,
    @Request() req
  ) {

    const userId = req.user.id;
    return this.workerService.updateWorker(id, updateWorkerDto, userId);
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
  removeWorker(@Param('id',ParseIntPipe) id: number,
  @Request() req) {
    const userId = req.user.id;
    return this.workerService.removeWorker(id,userId);
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
        fileSize: 1024 * 1024 * 1, // 1MB
      },
    }),
  )
  async uploadProfileImage(
    @Param('id',ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Créer l'URL de l'image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${file.filename}`;
    
    return this.workerService.updateProfileImage(id, imageUrl, req.user.id);
  }





}
