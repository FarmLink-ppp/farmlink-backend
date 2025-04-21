import {
  Body,
  Controller,
  Get,
  UseInterceptors,
  UploadedFile,
  Param,
  Req,
  ParseFilePipeBuilder,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from 'src/common/types/auth.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';

@Auth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Update user profile image' })
  @ApiResponse({
    status: 200,
    description: 'Profile image updated successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profileImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadProfileImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'image/*' })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 1,
        })
        .build({ errorHttpStatusCode: 422 }),
    )
    file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const imageUrl = `/uploads/profile-images/${file.filename}`;
    await this.usersService.update(req.user.id, {
      profileImage: imageUrl,
    });

    return {
      message: 'Profile image updated successfully',
      imageUrl,
    };
  }
}
