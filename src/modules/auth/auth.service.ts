import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Prisma } from '@prisma/client';

import { currencyFileds } from '../../general/configs';
import { TokensTypeEnum } from '../../general/enums';
import { CurrencyHelper, PasswordHelper, TokensHelper } from '../../general/helpers';
import { ReqUserI, ReqUserOAuth } from '../../general/interfaces/request/request.interface';
import { StringresponseI } from '../../general/interfaces/responses/string.response.interface';
import { TokensI } from '../../general/interfaces/tokens/tokens.interface';
import { LoginResponseI } from '../../general/interfaces/user/response.login.interface';
import { createUserPresenter } from '../../general/presenters';
import { PrismaService } from '../../prisma.service';
import { UserService } from '../user/user.service';
import { ChangePassDto } from './dto/change.pass.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthLoginDto, OAuthRegisterDto } from './dto/oauth.dto';

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
    data.email = this.userService.validateEmail(data.email);
    data.password = data.password.trim();
    const user = await this.userService.getFullUserInfo({ email: data.email });

    if (!user) {
      throw new NotFoundException(`User with email "${data.email}" not Found`);
    }
    const isPasswordSame = await PasswordHelper.comparePassword(user.password, data.password);
    if (!isPasswordSame) {
      throw new BadRequestException('Wrong password');
    }
    const tokens = await this.tokensHelper.generateTokens(user.id);
    await this.saveTokens({ ...tokens, user: { connect: { id: user.id } } });

    const userForResponse = CurrencyHelper.calculateCurrency(createUserPresenter(user), currencyFileds.user, user.currency);

    return {
      user: userForResponse,
      tokens,
    };
  }

  // Google login !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async googleLogin({ email, name }: ReqUserOAuth): Promise<LoginResponseI> {
    const user = await this.userService.isUserExist(email);
    let userForResponse: any = {};
    if (user) {
      userForResponse = await this.userService.getFullUserInfo({ email });
    } else {
      userForResponse = await this.userService.saveUser({ name, email });
    }
    const tokens = await this.tokensHelper.generateTokens(userForResponse.id);
    await this.saveTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { connect: { id: userForResponse.id } },
    });
    const fullUser = await this.userService.getFullUserInfo({ email });

    return { user: fullUser, tokens };
  }

  // OAuth Login !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async oAuthLogin(body: OAuthLoginDto): Promise<LoginResponseI> {
    const email = await this.tokensHelper.validateOAuth(body.token, body.type);
    const isUserExist = await this.userService.isUserExist(email);
    if (!isUserExist) {
      throw new NotFoundException(`User not found`);
    }
    const tokens = await this.tokensHelper.generateTokens(isUserExist.id);
    await this.saveTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { connect: { id: isUserExist.id } },
    });
    const userForResponse = await this.userService.getFullUserInfo({ email });
    return { user: userForResponse, tokens };
  }

  // Oauth Register !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async oAuthRegister(body: OAuthRegisterDto): Promise<LoginResponseI> {
    const email = await this.tokensHelper.validateOAuth(body.token, body.type);

    const user = await this.userService.isUserExist(email);
    if (user) {
      throw new BadRequestException(`User with this email already exist`);
    }
    const createdUser = await this.userService.saveUser({ email, name: body.name });
    const tokens = await this.tokensHelper.generateTokens(createdUser.id);
    await this.saveTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { connect: { id: createdUser.id } },
    });
    const fullUserInfo = await this.userService.getFullUserInfo({ email });

    return { user: fullUserInfo, tokens };
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
    const tokens = await this.tokensHelper.generateTokens(id);
    await this.saveTokens({ ...tokens, user: { connect: { id } } });
    return tokens;
  }

  // Frogot passwoord !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async forgotPass(email: string): Promise<StringresponseI> {
    const validatedEmail = this.userService.validateEmail(email);
    const user = await this.userService.getUserByParam({
      email: validatedEmail,
    });
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }

    const token = await this.prisma.actionTokens.findFirst({
      where: { type: TokensTypeEnum.ForgotPass, userEmail: email },
    });

    let random = token?.value;

    if (!random) {
      random = this.generateRandom();
      await this.prisma.actionTokens.create({
        data: {
          value: random,
          type: TokensTypeEnum.ForgotPass,
          userEmail: validatedEmail,
        },
      });
    }

    await this.mailerService.sendMail({
      from: 'No Reply',
      to: email,
      subject: 'Crypto Manager',
      html: `<div>Verefication code <b>${random}</b></div>`,
    });

    return { status: 'Email sended' };
  }

  // Change Password !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async changePassword({ newPassword, ...rest }: ChangePassDto): Promise<StringresponseI> {
    rest.email = this.userService.validateEmail(rest.email);
    await this.isCodeValid(rest, TokensTypeEnum.ForgotPass);
    const hashedPassword = await PasswordHelper.hashPassword(newPassword);
    await this.userService.changePassword({ password: hashedPassword }, rest.email);
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
  async isCodeValid(data: { email: string; code: number }, type: TokensTypeEnum): Promise<boolean> {
    data.email = this.userService.validateEmail(data.email);
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
