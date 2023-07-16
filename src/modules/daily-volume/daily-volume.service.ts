import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Fiat } from '@prisma/client';
import { currencyFileds } from 'src/general/configs';
import { CurrencyHelper } from 'src/general/helpers';
import { AccountValuesI } from 'src/general/interfaces/account-values/daily.volume.interface';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletValuesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    fromDate: string,
    toDate: string,
    walletId: string,
  ): Promise<{ data: AccountValuesI[]; currency: Fiat }> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { currency: true } });
      const where = this.generateWhere(userId, walletId, fromDate, toDate);
      let values = [];
      if (walletId) {
        values = await this.prisma.walletValues.findMany({ where });
      } else {
        values = await this.prisma.accountValues.findMany({ where });
      }
      if (values.length === 0) {
        throw new NotFoundException('Values not found');
      }
      const updatedValues = values.map((data) => {
        const { timestamp, ...wallet } = data;
        return CurrencyHelper.calculateCurrency(wallet, currencyFileds.walletValue, user.currency);
      });
      return { data: updatedValues, currency: user.currency };
    } catch (e) {
      throw e;
    }
  }

  generateWhere(userId: string, walletId: string, fromDate: string, toDate: string) {
    const array = [];
    const timestamp: { gte?: number; lte?: number } = {};
    let flag = false;
    const from = new Date(fromDate).getTime();
    const to = new Date(toDate).getTime();

    if (userId && !walletId) {
      array.push({ userId });
    }
    if (walletId) {
      array.push({ walletId });
    }
    if (fromDate) {
      if (isNaN(from)) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      timestamp.gte = from;
      flag = true;
    }
    if (toDate) {
      if (isNaN(to)) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      timestamp.lte = to;
      flag = true;
    }
    if (flag) {
      array.push({ timestamp });
    }
    if (array.length > 1) {
      return { AND: array };
    }
    return array[0];
  }
}
