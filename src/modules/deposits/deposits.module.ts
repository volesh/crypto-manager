import { Module } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { DepositsController } from './deposits.controller';
import { CoinsService } from '../coins/coins.service';

@Module({
  controllers: [DepositsController],
  providers: [DepositsService, CoinsService],
})
export class DepositsModule {}
