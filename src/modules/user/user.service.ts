import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PasswordHelper } from 'src/general/helpers/password.helper';
import { ResponseUserI } from 'src/general/interfaces/user/response.user.interface';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import { createUserPresenter } from 'src/general/presenters/user';
import { InitUserDto } from './dto/init.data';
import { CoinsService } from '../coins/coins.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coinsService: CoinsService,
  ) {}

  // Get User by params !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getUserByParam(
    where: Partial<Prisma.UserWhereUniqueInput>,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

  // Create User !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createUser(user: CreateUserDto): Promise<ResponseUserI> {
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
  async initData(data: InitUserDto, id: string): Promise<ResponseUserI> {
    const { fiat, invested, fixedIncome } = data;
    // check is user exist
    const isUserExist = await this.getUserByParam({ id });
    if (!isUserExist) {
      throw new BadRequestException(`User with id '${id}' not found`);
    }
    //update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { fiat, invested, fixedIncome },
    });
    // create new tokens for user
    for (let coin in data.coins) {
      await this.coinsService.createCoin(coin, id);
    }
  }

  async updateUser(
    user: Prisma.UserUpdateInput,
    id: string,
  ): Promise<ResponseUserI> {
    return this.prisma.user.update({ where: { id }, data: user });
  }
}
