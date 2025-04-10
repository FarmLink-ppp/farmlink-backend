import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreatePlantDto {
  @IsString()
  name: string;

  @IsString()
  category: string; // E.g., vegetable, fruit, etc.

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  landDivisionId: number; // Land division ID to associate with the plant
}
