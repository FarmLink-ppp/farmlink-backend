import { TaskPriority } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Irrigate tomato field',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Use the automated irrigation system for 30 minutes.',
    minLength: 5,
    maxLength: 500,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Priority level of the task',
    example: 'HIGH',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({
    description: 'Start date of the task in ISO format',
    example: '2025-04-15T08:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Due date of the task in ISO format',
    example: '2025-04-17T17:00:00Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Optional land division ID associated with the task',
    example: 42,
  })
  @IsOptional()
  landDivisionId?: number;
}
