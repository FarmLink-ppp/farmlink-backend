import { CreateLandDivisionDto } from './create-land-division.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateLandDivisionDto extends PartialType(CreateLandDivisionDto) {}
