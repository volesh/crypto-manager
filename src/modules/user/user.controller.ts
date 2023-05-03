import { UserService } from './user.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreatedUserI } from 'src/general/interfaces/user/created.user.interface';
import { CreateUserDto } from './dto/create.user.dto';
import { InitUserDto } from './dto/init.data';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUser(@Req() request: IRequest) {
    return this.userService.getOneUser(request.user.id);
  }

  @Post()
  createUser(@Body() user: CreateUserDto): Promise<CreatedUserI> {
    return this.userService.createUser(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/init')
  initUser(
    @Body() initData: InitUserDto,
    @Req() request: IRequest,
  ): Promise<GetUserI> {
    return this.userService.initUser(initData, request.user.id);
  }
}
