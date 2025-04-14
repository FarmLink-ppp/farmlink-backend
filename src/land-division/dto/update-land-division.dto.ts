import { IsString, IsNumber, IsEnum, IsOptional, IsInt } from 'class-validator';
import { CultivationStatus } from '@prisma/client';
import { CreateLandDivisionDto } from './create-land-division.dto';
import { PartialType } from '@nestjs/swagger';


export class UpdateLandDivisionDto extends PartialType(CreateLandDivisionDto) {

}
