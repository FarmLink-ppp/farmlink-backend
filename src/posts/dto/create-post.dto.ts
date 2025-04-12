import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsEnum} from 'class-validator';
export enum PostCategoryEnum {
  DISCUSSIONS = 'DISCUSSIONS',
  PROBLEMS = 'PROBLEMS',
  SOLUTIONS = 'SOLUTIONS',
  TIPS = 'TIPS',
}

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
  @IsArray()
  @IsString({ each: true }) 
  image_urls?: string[];

  @ApiProperty({
    title: 'the category of a post',
    example: 'DISCUSSIONS',
    required: true,
  })
  @IsEnum(PostCategoryEnum, { message: 'Invalid post category' })
  @ApiProperty({
  enum: PostCategoryEnum,
  example: 'DISCUSSIONS',
  required: true,
})
category: PostCategoryEnum;

}
