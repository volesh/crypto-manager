import { Stringresponse } from './../../general/swagger.responses/auth.responses/string.response';
import { Body, Controller, Post, UseGuards, Get, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { TokensI } from 'src/general/interfaces/tokens/tokens.interface';
import { ChangePassDto } from './dto/change.pass.dto';
import { StringresponseI } from 'src/general/interfaces/responses/string.response.interface';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponse } from 'src/general/swagger.responses/auth.responses/login.response';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';
import { TokenResponse } from 'src/general/swagger.responses/auth.responses/tokens.response';
import { FrotgotPassDto } from './dto/forgot.pass.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiResponse({ type: LoginResponse })
  @ApiBody({ type: LoginDto })
  @Post('/login')
  login(@Body() data: LoginDto): Promise<LoginResponseI> {
    return this.authService.login(data);
  }

  // Logout !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: Stringresponse })
  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  logout(@Req() request: IRequest): Promise<StringresponseI> {
    return this.authService.logout(request.user);
  }

  // Refresh !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: TokenResponse })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('/refresh')
  refresh(@Req() request: IRequest): Promise<TokensI> {
    return this.authService.refresh(request.user.id, request.user.token);
  }

  // Forgot Password !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBody({ type: FrotgotPassDto })
  @ApiResponse({ type: Stringresponse })
  @Post('/forgotPass')
  forgotPass(@Body() { email }: FrotgotPassDto): Promise<StringresponseI> {
    return this.authService.forgotPass(email);
  }

  // Change password !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBody({ type: ChangePassDto })
  @ApiResponse({ type: Stringresponse })
  @Patch('/changePass')
  codeVerefication(@Body() data: ChangePassDto): Promise<StringresponseI> {
    return this.authService.changePassword(data);
  }
}
