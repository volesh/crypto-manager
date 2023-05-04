import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { CoinsService } from '../coins/coins.service';
import { TokensHelper } from 'src/general/helpers/tokens.helper';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CoinsService, TokensHelper],
})
export class UserModule {}
