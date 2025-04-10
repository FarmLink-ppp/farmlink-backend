import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'The user account type',
    example: 'PUBLIC',
    required: false,
  })
  @IsOptional()
  accountType?: AccountType;
  
}

enum AccountType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}
