import { Module } from '@nestjs/common';
import { WalletValuesService } from './wallet-values.service';
import { WalletValuesController } from './wallet-values.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [WalletValuesController],
  providers: [WalletValuesService, PrismaService],
})
export class WalletValuesModule {}
