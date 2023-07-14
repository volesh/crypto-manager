import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { WalletValuesController } from './daily-volume.controller';
import { WalletValuesService } from './daily-volume.service';

@Module({
  controllers: [WalletValuesController],
  providers: [WalletValuesService, PrismaService],
})
export class WalletValuesModule {}
