import { TokensHelper } from './../../general/helpers/tokens.helper';
import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CoinsService } from '../coins/coins.service';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, CoinsService, UserService, PrismaService, TokensHelper, JwtService],
})
export class TransactionsModule {}
