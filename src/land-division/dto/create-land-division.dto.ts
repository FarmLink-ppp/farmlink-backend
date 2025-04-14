import { IsString, IsNumber, IsEnum, IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { CultivationStatus } from '@prisma/client'; // Enum imported from Prisma
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateLandDivisionDto {
  @ApiProperty({ example: 'North Plot', description: 'Name of the land division' })
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({ example: 1.5, description: 'Area size of the land division in hectares/acres' })
  @IsNumber()
  area: number;

  @ApiProperty({ example: 'Wheat', description: 'Type of crop cultivated' })
  @IsString()
  @IsNotEmpty()
  cropType: string;

  @ApiProperty({ enum: CultivationStatus, example: CultivationStatus.PLANTED })
  @IsEnum(CultivationStatus)
  cultivationStatus: CultivationStatus;

  @ApiProperty({ example: '35.6895,139.6917', description: 'GPS coordinates of the land division' })
  @IsString()
  @IsNotEmpty()
  geolocation: string;

  @ApiPropertyOptional({ example: 2, description: 'ID of the associated plant (if any)' })
  @IsOptional()
  @IsInt()
  plantId?: number; // Optional, but if provided it will link to a plant

  @ApiProperty({ example: 1, description: 'ID of the farm this division belongs to' })
  @IsInt()
  farmId: number; // This will reference the farm the land division belongs t
}
