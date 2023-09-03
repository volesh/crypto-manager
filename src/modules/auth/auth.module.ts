import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokensHelper } from 'src/general/helpers';
import { PrismaService } from 'src/prisma.service';

import { CoinsService } from '../coins/coins.service';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, JwtService, CoinsService, AtStrategy, RtStrategy, TokensHelper],
})
export class AuthModule {}
