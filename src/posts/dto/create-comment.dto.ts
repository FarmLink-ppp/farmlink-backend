import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCommentDto {
  @ApiProperty({
    title: 'the text of the comment',
    example: 'very nice',
    required: true,
  })
  @IsString()
  content: string;
}
