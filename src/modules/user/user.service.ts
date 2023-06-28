import { CurrencyHelper } from './../../general/helpers/currency.helper';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PasswordHelper } from 'src/general/helpers/password.helper';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import { InitUserDto } from './dto/init.data';
import { CoinsService } from '../coins/coins.service';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { createUserPresenter } from 'src/general/presenters/create.user.presenter';
import { TokensHelper } from 'src/general/helpers/tokens.helper';
import { LoginResponseI } from 'src/general/interfaces/user/response.login.interface';
import { currencyFileds } from 'src/general/configs/currency.fields';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coinsService: CoinsService,
    private readonly tokensHelper: TokensHelper,
  ) {}

  // Get One User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getOneUser(id: string, currency: string): Promise<GetUserI> {
    const user = await this.getFullUserInfo({ id });
    const fiat = await this.prisma.fiat.findUnique({ where: { code: currency } });
    if (!fiat) {
      throw new BadRequestException(`Fiat with code ${currency} not found`);
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
    const createdUser = await this.prisma.user.create({
      data: { ...user, password: hashedPassword },
      include: { currency: true },
    });
    const tokens = await this.tokensHelper.generateTokens(createdUser.id);
    await this.prisma.tokens.create({
      data: {
        ...tokens,
        user: { connect: { id: createdUser.id } },
      },
    });
    // Return user without password
    const userForResponse = CurrencyHelper.calculateCurrency(
      createUserPresenter({ ...createdUser }),
      currencyFileds.user,
      createdUser.currency,
    );
    return { user: userForResponse, tokens };
  }

  // Init Users Data !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async initUser(data: InitUserDto, id: string): Promise<GetUserI> {
    const { fiat } = data;

    // check is user exist
    const isUserExist = await this.getUserByParam({ id });
    if (!isUserExist) {
      throw new NotFoundException(`User with id '${id}' not found`);
    }
    if (isUserExist.isInitialized) {
      throw new BadRequestException('User already initialized');
    }
    // get invested money
    const invested = await this.calculateInvested(data);

    //update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { invested, isInitialized: true },
      include: { currency: true },
    });

    // create new coins for user
    for (let coin of data.coins) {
      await this.coinsService.createCoin(coin, id);
    }

    //Create fiat coin
    const promises = fiat.map((currency) => {
      return this.coinsService.createFiat(currency, isUserExist.id);
    });
    await Promise.all(promises);

    // calculate balance and income
    const { balance, notFixedIncome, fiat: receivedFiat } = await this.coinsService.calculateCryptoBalance(id);
    //return data
    const userForResponse = CurrencyHelper.calculateCurrency(
      createUserPresenter(updatedUser),
      currencyFileds.user,
      updatedUser.currency,
    );
    return {
      ...userForResponse,
      balance: balance + receivedFiat,
      fiat: receivedFiat,
      notFixedIncome,
      totalIncome: userForResponse.fixedIncome + notFixedIncome,
    };
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
    // calculate balance and income
    const { balance, notFixedIncome, fiat } = await this.coinsService.calculateCryptoBalance(isUserExist.id);
    //return data
    return {
      ...isUserExist,
      balance: balance + fiat,
      fiat: fiat,
      notFixedIncome: notFixedIncome,
      totalIncome: isUserExist.fixedIncome + notFixedIncome,
    };
  }

  // Get User by params !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getUserByParam(where: Partial<Prisma.UserWhereUniqueInput>): Promise<User | null> {
    if (where.email) {
      where.email = this.validateEmail(where.email);
    }
    return this.prisma.user.findUnique({ where });
  }

  // Update User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateUser(data: Prisma.UserUpdateInput, email: string): Promise<User> {
    if (data.email) {
      data.email = this.validateEmail(data.email as string);
    }
    const isUserExist = await this.getUserByParam({ email });
    if (!isUserExist) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.prisma.user.update({ where: { email }, data });
  }

  // Calculate invested money !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async calculateInvested(data: InitUserDto): Promise<number> {
    let invested = 0;
    const fiatCodes = data.fiat.map((fiat) => fiat.code);
    if (fiatCodes.length > 0) {
      const fiats = await this.prisma.fiat.findMany({
        where: { code: { in: fiatCodes } },
      });
      invested = data.fiat.reduce((accum, fiat) => {
        const fiatPrice = fiats.find((elem) => elem.code === fiat.code);
        return (accum += fiat.amount / fiatPrice.price);
      }, invested);
    }

    invested = data.coins.reduce((accum, coin) => {
      return (accum += coin.spendMoney);
    }, invested);

    return invested;
  }

  validateEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
