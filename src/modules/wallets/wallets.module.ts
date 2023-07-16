import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensHelper } from 'src/general/helpers';
import { PrismaService } from 'src/prisma.service';

import { CoinsService } from '../coins/coins.service';
import { UserService } from '../user/user.service';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService, PrismaService, JwtService, UserService, CoinsService, TokensHelper, UserService],
})
export class WalletsModule {}
