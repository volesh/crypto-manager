import { BadRequestException, Injectable } from '@nestjs/common';
import { Fiat, WalletValues } from '@prisma/client';
import { currencyFileds } from 'src/general/configs/currency.fields';
import { CurrencyHelper } from 'src/general/helpers/currency.helper';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletValuesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, fromDate: string, toDate: string): Promise<{ data: WalletValues[]; currency: Fiat }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { currency: true } });
    let where: any = { userId };
    if (fromDate && toDate) {
      const from = new Date(`${fromDate}T00:00:00.000Z`);
      const to = new Date(`${toDate}T00:00:00.000Z`);
      if (isNaN(from.getDate()) || isNaN(to.getDate())) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      where = {
        AND: [{ userId }, { createdAt: { gte: from, lte: to } }],
      };
    } else if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00.000Z`);
      if (isNaN(from.getDate())) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      where = {
        AND: [{ userId }, { createdAt: { gte: from } }],
      };
    } else if (toDate) {
      const to = new Date(`${toDate}T00:00:00.000Z`);
      if (isNaN(to.getDate())) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      where = {
        AND: [{ userId }, { createdAt: { lte: to } }],
      };
    }
    const wallets = await this.prisma.walletValues.findMany({ where });
    const updatedWallets = wallets.map((wallet) => {
      return CurrencyHelper.calculateCurrency(wallet, currencyFileds.wallet, user.currency);
    });
    return { data: updatedWallets, currency: user.currency };
  }
}
