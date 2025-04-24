import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { EmploymentStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerDto } from './create-worker.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  @ApiPropertyOptional({
    description: 'Name of the worker',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;
@ApiPropertyOptional({
    description: 'URL of the worker\'s profile image',  
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Contact information of the worker',
    example: '+1234567890',
  })

  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({
    description: 'Employment status of the worker',
    example: 'ACTIVE',
    enum: EmploymentStatus,
  })

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employment_status?: EmploymentStatus;

  @IsOptional()
  @IsInt()
  employerId?: number;
}
