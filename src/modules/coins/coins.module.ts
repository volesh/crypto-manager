import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CoinsController],
  providers: [CoinsService, PrismaService],
})
export class CoinsModule {}
