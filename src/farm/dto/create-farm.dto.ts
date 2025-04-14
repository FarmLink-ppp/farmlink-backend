import { IsString, IsOptional, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AreaUnit } from '@prisma/client'; // Enum imported from Prisma

export class CreateFarmDto {
  @ApiProperty({
    description: 'Name of the farm',
    example: 'Green Valley Farm',
  })
  
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: 'Location of the farm',
    example: 'Beja, Tunisia',
  })
  @IsString()
  @IsNotEmpty()
  location: string;
  
  @ApiProperty({
    description: 'Total area of the farm',
    example: 25.5,
  })
  @IsNumber()
  totalArea: number;

  @ApiPropertyOptional({
    description: 'Unit of area (default: HECTARES)',
    enum: AreaUnit,
    example: AreaUnit.HECTARES,
  })
  @IsEnum(AreaUnit)
  @IsOptional()
  areaUnit?: AreaUnit = AreaUnit.HECTARES;

  @ApiProperty({
    description: 'ID of the user who owns the farm',
    example: 1,
  })
  @IsNumber()
  userId: number; // If you're using authentication, this might be set server-side
  

}
