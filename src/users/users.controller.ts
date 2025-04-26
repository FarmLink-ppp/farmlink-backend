import {
  Body,
  Get,
  UploadedFile,
  Param,
  Req,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from 'src/common/types/auth.types';
import { Express } from 'express';
import { ApiResponse } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiController } from 'src/common/decorators/custom-controller.decorator';
import { FileUpload } from 'src/common/decorators/file-upload.decorator';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Auth()
@ApiController('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.usersService.findBy({ id });
  }

  @Patch('/profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(req.user.id, updateUserDto);
  }

  @Post('/profile/upload-image')
  @ApiResponse({
    status: 200,
    description: 'Profile image updated successfully',
  })
  @FileUpload(
    'profileImage',
    './uploads/users',
    1024 * 1024 * 1,
    /\/(jpg|jpeg|png|webp)$/i,
    'Update user profile image',
  )
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const imageUrl = this.fileUploadService.processUploadedFile(file, 'users');
    await this.usersService.update(req.user.id, {
      profileImage: imageUrl,
    });

    return {
      message: 'Profile image updated successfully',
      imageUrl,
    };
  }
}
