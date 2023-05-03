import { Prisma } from '@prisma/client';
import { UserService } from './user.service';
import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreatedUserI } from 'src/general/interfaces/user/created.user.interface';
import { CreateUserDto } from './dto/create.user.dto';
import { InitUserDto } from './dto/init.data';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser() {
    return this.userService.getUserByParam({
      id: 'de5c7e68-2013-44a5-b620-f4398dee7262',
    });
  }

  @Post()
  createUser(@Body() user: CreateUserDto): Promise<CreatedUserI> {
    return this.userService.createUser(user);
  }

  @Post('/init')
  initUser(@Body() initData: InitUserDto): Promise<GetUserI> {
    return this.userService.initUser(
      initData,
      'de5c7e68-2013-44a5-b620-f4398dee7262',
    );
  }
}
