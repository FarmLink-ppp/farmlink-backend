import { CreateWorkerDto } from './create-worker.dto';
import { EmploymentStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  @ApiPropertyOptional({
    description: 'Employment status of the worker',
    example: 'ACTIVE',
    enum: EmploymentStatus,
  })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;
}
