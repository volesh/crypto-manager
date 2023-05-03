import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PasswordHelper } from 'src/general/helpers/password.helper';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import { createUserPresenter } from 'src/general/presenters/user';
import { InitUserDto } from './dto/init.data';
import { CoinsService } from '../coins/coins.service';
import { CreatedUserI } from 'src/general/interfaces/user/created.user.interface';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coinsService: CoinsService,
  ) {}

  // Create User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createUser(user: CreateUserDto): Promise<CreatedUserI> {
    // Check is email unigue
    const isUnique = await this.getUserByParam({ email: user.email });
    if (isUnique) {
      throw new BadRequestException(
        `User with email "${user.email}" already exist`,
      );
    }
    // Hash password
    const hashedPassword = await PasswordHelper.hashPassword(user.password);
    // Create user with hashed password
    const createdUser = await this.prisma.user.create({
      data: { ...user, password: hashedPassword },
    });
    // Return user without password
    return createUserPresenter(createdUser);
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
    const invested = this.calculateInvested(data);

    //update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { fiat, invested, isInitialized: true },
    });

    // create new coins for user
    for (let coin of data.coins) {
      await this.coinsService.createCoin(coin, id);
    }

    // calculate balance and income
    const { balance, notFixedIncome } =
      await this.coinsService.calculateCryptoBalance(id);
    //return data
    const userForResponse = createUserPresenter(updatedUser);
    return {
      ...userForResponse,
      balance: balance + userForResponse.fiat,
      notFixedIncome,
      totalIncome: userForResponse.fixedIncome + notFixedIncome,
    };
  }

  // Get User by params !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getUserByParam(
    where: Partial<Prisma.UserWhereUniqueInput>,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

  // Calculate invested money !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  calculateInvested(data: InitUserDto): number {
    let invested = data.fiat;

    invested = data.coins.reduce((accum, coin) => {
      return (accum += coin.spendMoney);
    }, invested);

    return invested;
  }
}
