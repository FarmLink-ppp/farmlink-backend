import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AreaUnit } from '@prisma/client';

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
  areaUnit: AreaUnit;
}
