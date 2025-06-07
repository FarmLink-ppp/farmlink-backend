import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePlantDto {
  @ApiProperty({ example: 'Tomato', description: 'Name of the plant' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'A red vegetable plant',
    description: 'Description of the plant',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/tomato.jpg',
    description: 'Image URL of the plant',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
