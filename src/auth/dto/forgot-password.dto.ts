import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'johndoe@example.com',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
