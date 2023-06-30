import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { WalletValuesController } from './wallet-values.controller';
import { WalletValuesService } from './wallet-values.service';

@Module({
  controllers: [WalletValuesController],
  providers: [WalletValuesService, PrismaService],
})
export class WalletValuesModule {}
