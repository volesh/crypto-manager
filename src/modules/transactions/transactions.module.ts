import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../prisma.service';
import { CoinsService } from '../coins/coins.service';
import { UserService } from '../user/user.service';
import { TokensHelper } from './../../general/helpers';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, CoinsService, UserService, PrismaService, TokensHelper, JwtService],
})
export class TransactionsModule {}
