import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SharePostDto {
        @IsNumber()
        @ApiProperty({
            title: 'the id of the post',
            example: 1,
            required: true,
          })
        postId: number;
  }