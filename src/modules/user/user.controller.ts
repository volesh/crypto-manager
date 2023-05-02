import { Prisma } from '@prisma/client';
import { UserService } from './user.service';
import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ResponseUserI } from 'src/general/interfaces/user.interfaces/response.user.interface';
import { CreateUserDto } from './dto/create.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser() {
    return this.userService.getUserByParam({ id: '123' });
  }

  @Post()
  createUser(@Body() user: CreateUserDto): Promise<ResponseUserI> {
    return this.userService.createUser(user);
  }

  @Put()
  updateUser(@Body() user: Prisma.UserUpdateInput): Promise<ResponseUserI> {
    return this.userService.updateUser(user, '1');
  }
}
