import { ApiResponse, ApiTags, ApiBearerAuth, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Body, Controller, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { InitUserDto } from './dto/init.data';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';
import { ErrorResponse } from 'src/general/swagger.responses/errors.responses/error.response';
import { LoginResponse } from 'src/general/swagger.responses/auth.responses/login.response';
import { UserResponse } from 'src/general/swagger.responses/user.responses/user.response';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: UserResponse })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUser(@Req() request: IRequest, @Query('currency') currency: string = 'USD'): Promise<GetUserI> {
    return this.userService.getOneUser(request.user.id, currency);
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
