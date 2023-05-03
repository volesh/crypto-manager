import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { CoinsService } from '../coins/coins.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CoinsService],
})
export class UserModule {}
