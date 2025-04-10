import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/types/auth.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.usersService.findBy({ id });
  }
  
  @UseGuards(JwtAuthGuard)
  @Put('/profile')
  async updateProfile(@Req() req: RequestWithUser,@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(req.user.id,updateUserDto);
  }
}
