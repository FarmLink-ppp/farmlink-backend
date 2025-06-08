import { ApiProperty } from '@nestjs/swagger';
import { PostCategory } from '@prisma/client';
import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({
    title: 'the content of a post',
    example: 'this is a new plant',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    title: 'the images of the post',
    example: [],
    required: false,
  })
  @IsOptional()
  image_urls: string[] = [];

  @ApiProperty({
    title: 'the category of a post',
    example: PostCategory.DISCUSSIONS,
    enum: PostCategory,
  })
  @IsEnum(PostCategory, { message: 'Invalid post category' })
  category: PostCategory;
}
