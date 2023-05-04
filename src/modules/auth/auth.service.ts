import { TokensTypeEnum } from '../../general/enums/tokens.types.enum';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { PasswordHelper } from 'src/general/helpers/password.helper';
import { JwtService } from '@nestjs/jwt';
import { envConfig } from 'src/general/configs/envConfig';
import { TokensI } from 'src/general/interfaces/tokens/tokens.interface';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';
import { UserService } from '../user/user.service';
import { createUserPresenter } from 'src/general/presenters/user/create.user.presenter';
import { MailerService } from '@nestjs-modules/mailer';
import { ChangePassDto } from './dto/change.pass.dto';
import { ReqUserI } from 'src/general/interfaces/request/request.interface';
import { StringresponseI } from 'src/general/interfaces/responses/string.response.interface';
import { TokensHelper } from 'src/general/helpers/tokens.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokensHelper: TokensHelper,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
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
    const tokens = await this.tokensHelper.generateTokens(user.id);
    await this.saveTokens({ ...tokens, user: { connect: { id: user.id } } });
    const userForResponse = createUserPresenter(user);
    return {
      user: userForResponse,
      tokens,
    };
  }

  // Logout !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async logout(data: ReqUserI): Promise<StringresponseI> {
    await this.prisma.tokens.deleteMany({
      where: { userId: data.id, accessToken: data.token },
    });
    return { status: 'Logout successful' };
  }

  // Refresh !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async refresh(id: string, token: string): Promise<TokensI> {
    await this.prisma.tokens.deleteMany({ where: { refreshToken: token } });
    return this.tokensHelper.generateTokens(id);
  }

  // Frogot passwoord !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async forgotPass(email: string): Promise<{ status: string }> {
    const user = await this.userService.getUserByParam({ email });
    if (!user) {
      throw new NotFoundException(`User woth email "${email}" not found`);
    }
    const random = this.generateRandom();

    await this.mailerService.sendMail({
      from: 'No Reply',
      to: 'volesh2@gmail.com',
      subject: 'Crypto Manager',
      html: `<div>Verefication code <b>${random}</b></div>`,
    });

    await this.prisma.actionTokens.create({
      data: {
        value: random,
        type: TokensTypeEnum.ForgotPass,
        userEmail: email,
      },
    });
    return { status: 'Email sended' };
  }

  // Change Password !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async changePassword({
    newPassword,
    ...rest
  }: ChangePassDto): Promise<StringresponseI> {
    await this.isCodeValid(rest, TokensTypeEnum.ForgotPass);
    const hashedPassword = await PasswordHelper.hashPassword(newPassword);
    await this.userService.updateUser({ password: hashedPassword }, rest.email);
    await this.prisma.actionTokens.deleteMany({
      where: { userEmail: rest.email, value: rest.code },
    });
    return { status: 'Password changed' };
  }

  // Save tokens !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async saveTokens(data: Prisma.TokensCreateInput): Promise<void> {
    await this.prisma.tokens.create({ data });
  }

  // Is code valid !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async isCodeValid(
    data: { email: string; code: number },
    type: TokensTypeEnum,
  ): Promise<boolean> {
    const token = await this.prisma.actionTokens.findFirst({
      where: { userEmail: data.email, value: data.code, type },
    });
    if (!token) {
      throw new BadRequestException('Wrong token');
    }
    return true;
  }

  // Generate random number !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  generateRandom(): number {
    return +Math.random().toString().split('').splice(2, 6).join('');
  }
}
