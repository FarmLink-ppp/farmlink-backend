import { IsString, IsOptional, IsInt, IsEnum, MinLength, MaxLength } from 'class-validator';
import { EmploymentStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkerDto {
 @ApiProperty({
    description: 'Name of the worker',
    example: 'John Doe',
  }
)
  @IsString()
   @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'URL of the worker\'s profile image',  
    example: 'https://example.com/image.jpg',
  })

  @IsOptional()
  @IsString()
  image_url?: string;

@ApiProperty({
    description: 'Contact information of the worker',
    example: '+1234567890',
  })
  @IsString()
  contact: string;

  @ApiPropertyOptional({
    description: 'Employment status of the worker',
    example: 'ACTIVE',
    enum: EmploymentStatus,
  })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employment_status?: EmploymentStatus;

  @IsInt()
  employerId: number;
}