import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Decimal from 'decimal.js';
import * as moment from 'moment';

import { WalletsService } from '../modules/wallets/wallets.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WalletSchedule {
  constructor(private readonly prisma: PrismaService, private readonly walletService: WalletsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeExpiredTokens() {
    const date = moment().format('YYYY-MM-DD');
    const timestamp = new Date().getTime();
    const users = await this.prisma.user.findMany({ select: { id: true, wallets: { select: { id: true } } } });
    for (const user of users) {
      const promises = [];
      let accountAmount = new Decimal(0);
      for (const wallet of user.wallets) {
        const { balance: walletBalance, fiat: walletFiat } = await this.walletService.calculateWalletBalance(wallet.id);

        const balanceD = new Decimal(walletBalance);
        const fiatD = new Decimal(walletFiat);

        // totalBalance += walletFiat
        const totalBalance = balanceD.plus(fiatD);

        // accountAmount += totalBalance
        accountAmount = accountAmount.plus(totalBalance);

        const promise = this.prisma.walletValues.create({
          data: {
            amount: totalBalance.toNumber(),
            user: { connect: { id: user.id } },
            wallet: { connect: { id: wallet.id } },
            date,
            timestamp,
          },
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      await this.prisma.accountValues.create({
        data: {
          amount: Number(accountAmount),
          user: { connect: { id: user.id } },
          date,
          timestamp,
        },
      });
    }
    console.log('Wallet value set');
  }
}
