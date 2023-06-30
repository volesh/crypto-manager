import { JwtModule, JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma.service';
import { CoinsService } from '../coins/coins.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { TokensHelper } from 'src/general/helpers/tokens.helper';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, JwtService, CoinsService, AtStrategy, RtStrategy, TokensHelper],
})
export class AuthModule {}
