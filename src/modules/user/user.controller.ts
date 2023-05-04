import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { InitUserDto } from './dto/init.data';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUser(@Req() request: IRequest) {
    return this.userService.getOneUser(request.user.id);
  }

  // Create User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Post()
  createUser(@Body() user: CreateUserDto): Promise<LoginResponseI> {
    return this.userService.createUser(user);
  }

  // Init User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt'))
  @Put('/init')
  initUser(
    @Body() initData: InitUserDto,
    @Req() request: IRequest,
  ): Promise<GetUserI> {
    return this.userService.initUser(initData, request.user.id);
  }
}
