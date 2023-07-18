import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';

@Module({
  controllers: [CoinsController],
  providers: [CoinsService, PrismaService],
})
export class CoinsModule {}
