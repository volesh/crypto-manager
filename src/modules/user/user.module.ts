import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensHelper } from 'src/general/helpers';
import { PrismaService } from 'src/prisma.service';

import { CoinsService } from '../coins/coins.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CoinsService, JwtService, TokensHelper],
})
export class UserModule {}
