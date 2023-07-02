import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';
import { LoginResponse } from 'src/general/swagger.responses/auth.responses/login.response';
import { ErrorResponse } from 'src/general/swagger.responses/errors.responses/error.response';
import { UserResponse } from 'src/general/swagger.responses/user.responses/user.response';

import { CreateUserDto } from './dto/create.user.dto';
import { InitUserDto } from './dto/init.data';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: UserResponse })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUser(@Req() request: IRequest): Promise<GetUserI> {
    return this.userService.getOneUser(request.user.id);
  }

  // Create User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiCreatedResponse({ type: LoginResponse })
  @ApiResponse({ type: ErrorResponse })
  @ApiBody({ type: CreateUserDto })
  @Post()
  createUser(@Body() user: CreateUserDto): Promise<LoginResponseI> {
    return this.userService.createUser(user);
  }

  // Init User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBody({ type: InitUserDto })
  @ApiResponse({ type: UserResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('/init')
  initUser(@Body() initData: InitUserDto, @Req() request: IRequest): Promise<GetUserI> {
    return this.userService.initUser(initData, request.user.id);
  }
}
