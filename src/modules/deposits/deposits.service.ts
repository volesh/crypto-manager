import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coins, Deposits, Prisma, Wallets } from '@prisma/client';
import Decimal from 'decimal.js';
import { DepositsEnum, OrderEnum } from 'src/general/enums';
import { PaginationResponseI } from 'src/general/interfaces/pagination/pagination.response.interface';
import { PrismaService } from 'src/prisma.service';

import { CoinsService } from '../coins/coins.service';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Injectable()
export class DepositsService {
  constructor(private readonly prisma: PrismaService, private readonly coinsService: CoinsService) {}

  // Create !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async create({ walletId, ...rest }: CreateDepositDto): Promise<Deposits> {
    const wallet = await this.prisma.wallets.findUnique({ where: { id: walletId }, include: { user: true } });
    if (!wallet || !wallet.user) {
      throw new NotFoundException(`Not found`);
    }
    let fiat = await this.prisma.coins.findFirst({
      where: { coinId: rest.code, walletId: wallet.id },
    });
    if (!fiat && rest.status === DepositsEnum.Buy) {
      fiat = await this.coinsService.createFiat(rest, wallet.user.id, wallet.id);
    } else if ((!fiat || fiat.amount < rest.amount) && rest.status === DepositsEnum.Sell) {
      throw new BadRequestException(`In your balance less then ${rest.amount}`);
    }
    await this.updateData({ ...rest, walletId }, wallet, fiat);
    const data: Prisma.DepositsCreateInput = {
      ...rest,
      user: { connect: { id: wallet.user.id } },
      wallet: { connect: { id: wallet.id } },
    };
    return this.prisma.deposits.create({ data });
  }

  // Find All !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async findAll(
    userId: string,
    page: number,
    perPage: number,
    status: DepositsEnum,
    orderDirecrion: OrderEnum,
    orderBy: string,
    walletId: string,
  ): Promise<PaginationResponseI<Deposits>> {
    const wallet = await this.prisma.wallets.findUnique({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with id: ${walletId} not found`);
    }
    if (userId !== wallet.userId) {
      throw new BadRequestException('This is not your wallet');
    }
    const where = this.generateWhere(walletId, status);
    const skip = (page - 1) * perPage;
    const totalDeposits = await this.prisma.deposits.count({
      where,
    });
    const totalPages = Math.ceil(totalDeposits / perPage);
    const deposits = await this.prisma.deposits.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { [orderBy]: orderDirecrion },
    });
    return {
      page,
      perPage,
      data: deposits,
      totalPages,
    };
  }

  // Delete deposit !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async remove(id: string): Promise<Deposits> {
    const deposit = await this.prisma.deposits.findUnique({
      where: { id },
      include: { wallet: true },
    });
    if (!deposit) {
      throw new NotFoundException(`Deposit with id ${id} not found`);
    }
    const fiat = await this.coinsService.getCoinByCoinId(deposit.code, deposit.walletId);
    if (!fiat) {
      throw new NotFoundException('Coin not found');
    }
    if (deposit.status === DepositsEnum.Buy) {
      if (fiat.amount < deposit.amount) {
        throw new BadRequestException(`You can't delete this deposit bacause in your balanse less then deposit amount`);
      } else {
        // fiat.amount - deposit.amount
        const amount = Number(new Decimal(fiat.amount).minus(new Decimal(deposit.amount)).valueOf());

        // fiat.spendMoney - deposit.amount
        const spendMoney = Number(new Decimal(fiat.spendMoney).minus(new Decimal(deposit.amount)).valueOf());
        await this.coinsService.updateCoin(amount, 1, spendMoney, fiat.id);

        //deposit.wallet.invested - deposit.amount
        const invested = Number(new Decimal(deposit.wallet.invested).minus(new Decimal(deposit.amount)).valueOf());
        await this.prisma.wallets.update({
          where: { id: deposit.walletId },
          data: { invested },
        });
      }
    } else {
      // fiat.amount + deposit.amount
      const amount = Number(new Decimal(fiat.amount).plus(new Decimal(deposit.amount)).valueOf());

      // fiat.spendMoney + deposit.amount
      const spendMoney = Number(new Decimal(fiat.spendMoney).plus(new Decimal(deposit.amount)).valueOf());

      await this.coinsService.updateCoin(amount, 1, spendMoney, fiat.id);

      // deposit.wallet.invested + deposit.amount
      const invested = Number(new Decimal(deposit.wallet.invested).plus(new Decimal(deposit.amount)).valueOf());

      // deposit.wallet.withdraw - deposit.amount
      const withdraw = Number(new Decimal(deposit.wallet.withdraw).minus(new Decimal(deposit.amount)).valueOf());
      await this.prisma.wallets.update({
        where: { id: deposit.walletId },
        data: {
          invested,
          withdraw,
        },
      });
    }
    return this.prisma.deposits.delete({ where: { id } });
  }

  // Generate where !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  generateWhere(walletId: string, status: DepositsEnum) {
    const whereArr = [{}];
    whereArr.push({ walletId });
    if (status) {
      whereArr.push({ status });
    }
    if (whereArr.length > 1) {
      return { AND: whereArr };
    }
    return { walletId };
  }

  // Update User And Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateData(deposit: CreateDepositDto, wallet: Wallets, fiat: Coins) {
    const promisesArr = [];
    const { price } = await this.prisma.fiat.findUnique({ where: { code: fiat.coinId } });

    // deposit.amount / price
    const spendMoney = Number(new Decimal(deposit.amount).dividedBy(new Decimal(price)).valueOf());
    if (deposit.status === DepositsEnum.Buy) {
      // wallet.invested + spendMoney
      const invested = Number(new Decimal(wallet.invested).plus(new Decimal(spendMoney)).valueOf());

      // fiat.amount + deposit.amount
      const amount = Number(new Decimal(fiat.amount).plus(new Decimal(deposit.amount)).valueOf());
      const walletUpdate = this.prisma.wallets.update({
        where: { id: wallet.id },
        data: { invested },
      });

      // (fiat.spendMoney + spendMoney) / (fiat.amount + deposit.amount);
      const avg = Number(new Decimal(invested).dividedBy(new Decimal(amount)).valueOf());

      // fiat.spendMoney + spendMoney
      const fiatSpendMoney = Number(new Decimal(fiat.spendMoney).plus(new Decimal(spendMoney)).valueOf());
      const fiatUpdate = this.coinsService.updateCoin(amount, avg, fiatSpendMoney, fiat.id);

      promisesArr.push(walletUpdate);
      promisesArr.push(fiatUpdate);
    } else {
      // wallet.withdraw + spendMoney
      const withdraw = Number(new Decimal(wallet.withdraw).plus(new Decimal(spendMoney)).valueOf());
      const walletUpdate = this.prisma.wallets.update({
        where: { id: wallet.id },
        data: {
          withdraw,
        },
      });
      //fiat.amount - deposit.amount
      const fiatAmount = Number(new Decimal(fiat.amount).minus(new Decimal(deposit.amount)).valueOf());

      // fiat.spendMoney - spendMoney
      const fiatSpendMoney = Number(new Decimal(fiat.spendMoney).minus(new Decimal(spendMoney)).valueOf());

      const fiatUpdate = this.coinsService.updateCoin(fiatAmount, fiat.avgPrice, fiatSpendMoney, fiat.id);
      promisesArr.push(walletUpdate);
      promisesArr.push(fiatUpdate);
    }
    await Promise.all(promisesArr);
  }
}
