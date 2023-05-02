import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PasswordHelper } from 'src/general/helpers/password.helper';
import { ResponseUserI } from 'src/general/interfaces/user.interfaces/response.user.interface';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import { createUserPresenter } from 'src/general/presenters/user';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByParam(
    where: Partial<Prisma.UserWhereUniqueInput>,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

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

    // Create user
    const createdUser = await this.prisma.user.create({
      data: { ...user, password: hashedPassword },
    });

    // Return user without password
    return createUserPresenter(createdUser);
  }

  async updateUser(
    user: Prisma.UserUpdateInput,
    id: string,
  ): Promise<ResponseUserI> {
    return this.prisma.user.update({ where: { id }, data: user });
  }
}
