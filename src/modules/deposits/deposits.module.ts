import { Module } from '@nestjs/common';

import { CoinsService } from '../coins/coins.service';
import { PrismaService } from './../../prisma.service';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';

@Module({
  controllers: [DepositsController],
  providers: [DepositsService, CoinsService, PrismaService],
})
export class DepositsModule {}
