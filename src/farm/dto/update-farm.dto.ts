// dto/update-farm.dto.ts
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { AreaUnit } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { CreateFarmDto } from './create-farm.dto';

export class UpdateFarmDto extends PartialType(CreateFarmDto) {
}
