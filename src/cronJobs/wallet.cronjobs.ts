import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinsService } from 'src/modules/coins/coins.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletSchedule {
  constructor(private readonly prisma: PrismaService, private readonly coinsService: CoinsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeExpiredTokens() {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      const { balance, fiat } = await this.coinsService.calculateCryptoBalance(user.id);
      await this.prisma.walletValues.create({
        data: {
          amount: balance + fiat,
          user: { connect: { id: user.id } },
        },
      });
    }
    console.log('Wallet value set');
  }
}
