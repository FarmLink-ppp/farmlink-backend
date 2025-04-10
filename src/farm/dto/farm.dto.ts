import { IsString, IsInt, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { AreaUnit } from '@prisma/client'; // Enum imported from Prisma

export class CreateFarmDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  total_area: number;

  @IsEnum(AreaUnit)
  area_unit: AreaUnit;

  @IsOptional()
  @IsInt()
  user_id?: number; // User ID is optional during creation
}
