import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import Decimal from 'decimal.js';
import { currencyFileds } from 'src/general/configs';
import { CurrencyHelper, PasswordHelper, TokensHelper } from 'src/general/helpers';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';
import { createUserPresenter } from 'src/general/presenters';
import { CreateUser } from 'src/general/swagger.responses/user.responses/createUser.response';
import { PrismaService } from 'src/prisma.service';

import { CoinsService } from '../coins/coins.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coinsService: CoinsService,
    private readonly tokensHelper: TokensHelper,
  ) {}

  // Get One User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getOneUser(id: string): Promise<GetUserI> {
    const user = await this.getFullUserInfo({ id });
    const fiat = await this.prisma.fiat.findUnique({ where: { id: user.currencyId } });
    if (!fiat) {
      throw new BadRequestException(`Fiat not found`);
    }
    const userForResponse = CurrencyHelper.calculateCurrency(user, currencyFileds.user, fiat);
    return createUserPresenter({ ...userForResponse, currency: fiat });
  }

  // Create User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createUser(user: CreateUserDto): Promise<LoginResponseI> {
    user.email = this.validateEmail(user.email);
    user.password = user.password.trim();

    // Check is email unigue
    const isUnique = await this.getUserByParam({ email: user.email });
    if (isUnique) {
      throw new BadRequestException(`User with email "${user.email}" already exist`);
    }
    // Hash password
    const hashedPassword = await PasswordHelper.hashPassword(user.password);
    // Create user with hashed password
    const createdUser = await this.saveUser({ ...user, password: hashedPassword });
    const tokens = await this.tokensHelper.generateTokens(createdUser.id);
    await this.prisma.tokens.create({
      data: {
        ...tokens,
        user: { connect: { id: createdUser.id } },
      },
    });
    const fullUser = await this.getFullUserInfo({ email: user.email });
    return { user: fullUser, tokens };
  }

  // Creare user OAuth !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async saveUser(data: { name: string; email: string; password?: string; cirrencyId?: string }) {
    const createdUser = await this.prisma.user.create({
      data,
      include: { currency: true },
    });

    return CurrencyHelper.calculateCurrency(createUserPresenter({ ...createdUser }), currencyFileds.user, createdUser.currency);
  }

  // Get full User Info !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getFullUserInfo(where: Prisma.UserWhereUniqueInput): Promise<GetUserI> {
    if (where.email) {
      where.email = this.validateEmail(where.email);
    }
    // check is user exist
    const isUserExist = await this.getUserByParam(where);
    if (!isUserExist) {
      throw new NotFoundException(`User not found`);
    }
    const wallets = await this.prisma.wallets.findMany({ where: { userId: isUserExist.id } });
    let invested = 0;
    let fixedIncome = 0;
    let withdraw = 0;
    wallets.forEach((wallet) => {
      // invested += wallet.invested
      invested = Number(new Decimal(invested).plus(new Decimal(wallet.invested)).valueOf());

      // fixedIncome += wallet.fixedIncome;
      fixedIncome = Number(new Decimal(fixedIncome).plus(new Decimal(wallet.fixedIncome)).valueOf());

      // withdraw += wallet.withdraw;
      withdraw = Number(new Decimal(withdraw).plus(new Decimal(wallet.withdraw)).valueOf());
    });
    // calculate balance and income
    const { balance, notFixedIncome, fiat } = await this.coinsService.calculateCryptoBalance(isUserExist.id);
    //return data
    return {
      ...isUserExist,
      // blance + fiat
      balance: Number(new Decimal(balance).plus(new Decimal(fiat)).valueOf()),
      fiat: fiat,
      notFixedIncome,
      // totalIncome: fixedIncome + notFixedIncome,
      totalIncome: Number(new Decimal(fixedIncome).plus(new Decimal(notFixedIncome)).valueOf()),
      invested,
      withdraw,
      fixedIncome,
    };
  }

  // Get User by params !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getUserByParam(where: Partial<Prisma.UserWhereUniqueInput>): Promise<User | null> {
    if (where.email) {
      where.email = this.validateEmail(where.email);
    }
    return this.prisma.user.findUnique({ where, include: { currency: true } });
  }

  // Update User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateUser(data: UpdateUserDto, id: string): Promise<CreateUser> {
    const isUserExist = await this.getOneUser(id);
    if (!isUserExist) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    let currency = isUserExist.currency;
    if (data.currencyId) {
      currency = await this.prisma.fiat.findUnique({ where: { id: data.currencyId } });
      if (!currency) {
        throw new NotFoundException(`Currency with id: ${data.currencyId} not found`);
      }
    }
    const updateUser = await this.prisma.user.update({ where: { id }, data });
    return { ...updateUser, currency };
  }

  // Is user exist !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async isUserExist(email: string): Promise<User | null> {
    const newEmail = this.validateEmail(email);
    return this.prisma.user.findUnique({ where: { email: newEmail } });
  }

  // Update User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async changePassword(data: Prisma.UserUpdateInput, email: string): Promise<User> {
    if (data.email) {
      data.email = this.validateEmail(data.email as string);
    }
    const isUserExist = await this.getUserByParam({ email });
    if (!isUserExist) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.prisma.user.update({ where: { email }, data });
  }

  validateEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
