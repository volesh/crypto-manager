import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { TokensI } from 'src/general/interfaces/tokens/tokens.interface';
import { TokensTypeEnum } from 'src/general/enums/tokens.types.enum';
import { ChangePassDto } from './dto/change.pass.dto';
import { StringresponseI } from 'src/general/interfaces/responses/string.response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Post('/login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  // Logout !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  logout(@Req() request: IRequest): Promise<StringresponseI> {
    return this.authService.logout(request.user);
  }

  // Refresh !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('/refresh')
  refresh(@Req() request: IRequest): Promise<TokensI> {
    return this.authService.refresh(request.user.id, request.user.token);
  }

  // Forgot Password !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Post('/forgotPass')
  forgotPass(@Body() { email }: { email: string }) {
    return this.authService.forgotPass(email);
  }

  // Code verefication !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Post('/changePass')
  codeVerefication(@Body() data: ChangePassDto): Promise<StringresponseI> {
    return this.authService.changePassword(data);
  }
}
