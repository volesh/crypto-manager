import { PrismaService } from './../../prisma.service';
import { Module } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { DepositsController } from './deposits.controller';
import { CoinsService } from '../coins/coins.service';

@Module({
  controllers: [DepositsController],
  providers: [DepositsService, CoinsService, PrismaService],
})
export class DepositsModule {}
