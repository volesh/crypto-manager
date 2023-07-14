import { BadRequestException, Injectable } from '@nestjs/common';
import { Fiat } from '@prisma/client';
import { currencyFileds } from 'src/general/configs';
import { CurrencyHelper } from 'src/general/helpers';
import { AccountValuesI } from 'src/general/interfaces/account-values/daily.volume.interface';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletValuesService {
  constructor(private readonly prisma: PrismaService) {}

  // async findAll(
  //   userId: string,
  //   fromDate: string,
  //   toDate: string,
  //   walletId: string,
  // ): Promise<{ data: WalletValues[]; currency: Fiat }> {
  //   const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { currency: true } });
  //   let where: any = { userId };
  //   if (fromDate && toDate) {
  //     const from = new Date(`${fromDate}T00:00:00.000Z`);
  //     const to = new Date(`${toDate}T00:00:00.000Z`);
  //     if (isNaN(from.getDate()) || isNaN(to.getDate())) {
  //       throw new BadRequestException('Date should be in yyyy-mm-dd format');
  //     }
  //     where = {
  //       AND: [{ userId }, { createdAt: { gte: from, lte: to } }],
  //     };
  //   } else if (fromDate) {
  //     const from = new Date(`${fromDate}T00:00:00.000Z`);
  //     if (isNaN(from.getDate())) {
  //       throw new BadRequestException('Date should be in yyyy-mm-dd format');
  //     }
  //     where = {
  //       AND: [{ userId }, { createdAt: { gte: from } }],
  //     };
  //   } else if (toDate) {
  //     const to = new Date(`${toDate}T00:00:00.000Z`);
  //     if (isNaN(to.getDate())) {
  //       throw new BadRequestException('Date should be in yyyy-mm-dd format');
  //     }
  //     where = {
  //       AND: [{ userId }, { createdAt: { lte: to } }],
  //     };
  //   }
  //   const wallets = await this.prisma.walletValues.findMany({ where });
  //   const updatedWallets = wallets.map((wallet) => {
  //     return CurrencyHelper.calculateCurrency(wallet, currencyFileds.walletValue, user.currency);
  //   });
  //   return { data: updatedWallets, currency: user.currency };
  // }

  async findAll(
    userId: string,
    fromDate: string,
    toDate: string,
    walletId: string,
  ): Promise<{ data: AccountValuesI[]; currency: Fiat }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { currency: true } });
    const where = this.generateWhere(userId, walletId, fromDate, toDate);
    let values = [];
    if (walletId) {
      values = await this.prisma.walletValues.findMany({ where });
    } else {
      values = await this.prisma.accountValues.findMany({ where });
    }
    const updatedValues = values.map((wallet) => {
      return CurrencyHelper.calculateCurrency(wallet, currencyFileds.walletValue, user.currency);
    });
    return { data: updatedValues, currency: user.currency };
  }

  generateWhere(userId: string, walletId: string, fromDate: string, toDate: string) {
    const array = [];
    const createdAt: { gte?: number; lte?: number } = {};
    let flag = false;
    const from = new Date(`${fromDate}T00:00:00.000Z`).getDate();
    const to = new Date(`${toDate}T00:00:00.000Z`).getDate();
    if (isNaN(from) || isNaN(to)) {
      return new BadRequestException('Date should be in yyyy-mm-dd format');
    }
    if (userId && !walletId) {
      array.push({ userId });
    }
    if (walletId) {
      array.push({ walletId });
    }
    if (fromDate) {
      createdAt.gte = from;
      flag = true;
    }
    if (fromDate) {
      createdAt.lte = to;
      flag = true;
    }
    if (flag) {
      array.push({ createdAt });
    }
    if (array.length > 1) {
      return { AND: array };
    }
    return array[0];
  }
}
