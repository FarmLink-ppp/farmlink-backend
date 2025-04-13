import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({
    description: 'The ID of worker to assign the task to',
    type: Number,
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  workerId: number;
}
