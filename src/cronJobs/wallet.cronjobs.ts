import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletsService } from 'src/modules/wallets/wallets.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletSchedule {
  constructor(private readonly prisma: PrismaService, private readonly walletService: WalletsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeExpiredTokens() {
    const users = await this.prisma.user.findMany({ select: { id: true, wallets: { select: { id: true } } } });
    for (const user of users) {
      const promises = [];
      let accountAmount = 0;
      for (const wallet of user.wallets) {
        const { balance: walletBalance, fiat: walletFiat } = await this.walletService.calculateWalletBalance(wallet.id);
        accountAmount += walletBalance + walletFiat;
        const promise = this.prisma.walletValues.create({
          data: {
            amount: walletBalance + walletFiat,
            user: { connect: { id: user.id } },
            wallet: { connect: { id: wallet.id } },
          },
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      await this.prisma.accountValues.create({
        data: {
          amount: accountAmount,
          user: { connect: { id: user.id } },
        },
      });
    }
    console.log('Wallet value set');
  }
}
