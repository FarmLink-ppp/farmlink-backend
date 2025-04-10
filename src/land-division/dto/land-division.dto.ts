import { IsString, IsNumber, IsEnum, IsInt, IsOptional } from 'class-validator';
import { CultivationStatus } from '@prisma/client'; // Enum imported from Prisma

export class CreateLandDivisionDto {
  @IsString()
  name: string;

  @IsNumber()
  area: number;

  @IsString()
  crop_type: string;

  @IsEnum(CultivationStatus)
  cultivation_status: CultivationStatus;

  @IsString()
  geolocation: string;

  @IsInt()
  farm_id: number; // Farm ID to associate with the division
}
