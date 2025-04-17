import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from 'src/common/types/auth.types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiResponse } from '@nestjs/swagger';

@ApiResponse({
  status: 500,
  description: 'Internal server error',
})
@Auth()
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

  @Patch('/profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(req.user.id, updateUserDto);
  }
}
