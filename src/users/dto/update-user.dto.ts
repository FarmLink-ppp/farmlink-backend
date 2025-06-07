import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { AccountType } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'The user account type',
    example: 'PUBLIC',
    enum: AccountType,
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;
}
