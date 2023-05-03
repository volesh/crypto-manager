import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PasswordHelper } from 'src/general/helpers/password.helper';
import { JwtService } from '@nestjs/jwt';
import { envConfig } from 'src/general/configs/envConfig';
import { TokensI } from 'src/general/interfaces/tokens/tokens.interface';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';
import { UserService } from '../user/user.service';
import { createUserPresenter } from 'src/general/presenters/user/create.user.presenter';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // Login !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async login(data: LoginDto): Promise<LoginResponseI> {
    const user = await this.userService.getFullUserInfo({ email: data.email });
    if (!user) {
      throw new NotFoundException(`User with email "${data.email}" not Found`);
    }
    const isPasswordSame = await PasswordHelper.comparePassword(
      user.password,
      data.password,
    );
    if (!isPasswordSame) {
      throw new BadRequestException('Wrong password');
    }
    const tokens = await this.generateTokens(user.id);
    await this.saveTokens({ ...tokens, user: { connect: { id: user.id } } });
    const userForResponse = createUserPresenter(user);
    return {
      user: userForResponse,
      tokens,
    };
  }

  // Save tokens !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async saveTokens(data: Prisma.TokensCreateInput): Promise<void> {
    await this.prisma.tokens.create({ data });
  }

  // Generate Tokens !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async generateTokens(id: string): Promise<TokensI> {
    const accessToken = await this.jwtService.signAsync(
      { id },
      {
        secret: envConfig.access_key,
        expiresIn: '15m',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { id },
      {
        secret: envConfig.refresh_key,
        expiresIn: '7d',
      },
    );
    return { accessToken, refreshToken };
  }
}
