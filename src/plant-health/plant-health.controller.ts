import { PlantHealthService } from './plant-health.service';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Post, Req, UploadedFile } from '@nestjs/common';
import { RequestWithUser } from 'src/common/types/auth.types';
import { ApiResponse } from '@nestjs/swagger';
import { FileUpload } from 'src/common/decorators/file-upload.decorator';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Auth()
@ApiController('plant-health')
export class PlantHealthController {
  constructor(
    private readonly plantHealthService: PlantHealthService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('scan')
  @ApiResponse({
    status: 200,
    description: 'image uploaded successfully',
  })
  @FileUpload(
    'plantImage',
    './uploads/scans',
    1024 * 1024 * 1,
    /\/(jpg|jpeg|png|webp)$/i,
    'Upload plant image',
  )
  createScan(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const imageUrl = this.fileUploadService.generateFilePath(file, 'scans');
    return this.plantHealthService.createScan(req.user.id, imageUrl);
  }
}
