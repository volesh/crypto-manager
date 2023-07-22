import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coins, Fiat, Prisma, Transactions } from '@prisma/client';
import Decimal from 'decimal.js';
import { currencyFileds } from 'src/general/configs';
import { CoinTypeEnum, TransactionStatusEnum } from 'src/general/enums';
import { CurrencyHelper } from 'src/general/helpers';
import { StringresponseI } from 'src/general/interfaces/responses/string.response.interface';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { PrismaService } from 'src/prisma.service';

import { CoinsService } from '../coins/coins.service';
import { UserService } from '../user/user.service';
import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import { CreateTransactionDto } from './dto/create.transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly coinsService: CoinsService,
  ) {}

  // Get Transactions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getTransactions(
    userId: string,
    walletId: string,
    page: number,
    perPage: number,
    orderBy: string,
    date: string,
    coinId: string,
    status: TransactionStatusEnum,
  ): Promise<PaginationResponseI<Transactions>> {
    const skip = (page - 1) * perPage;
    const where = this.generateWhere(date, null, walletId, coinId, status);
    const user = await this.userService.getOneUser(userId);
    const fiat = await this.prisma.fiat.findUnique({ where: { id: user.currencyId } });
    const totalTransactions = await this.prisma.transactions.count({
      where,
    });
    const totalPages = Math.ceil(totalTransactions / perPage);

    const transactions = await this.prisma.transactions.findMany({
      where,
      include: { fromCoin: true, toCoin: true },
      skip,
      take: perPage,
      orderBy: { [orderBy]: 'asc' },
    });
    const transformedTransactions = transactions.map((transaction) => {
      return CurrencyHelper.calculateCurrency(transaction, currencyFileds.transaction, fiat);
    });
    return {
      data: transformedTransactions,
      page: page,
      perPage,
      totalPages,
      currency: fiat,
    };
  }

  // Delete Transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async deleteTransaction(id: string): Promise<StringresponseI> {
    const transactionForDelete = await this.prisma.transactions.findUnique({
      where: { id },
      include: { fromCoin: true, toCoin: true, user: true, wallet: true },
    });
    if (!transactionForDelete) {
      throw new NotFoundException(`Transaction with id: ${id} not found`);
    }
    if (transactionForDelete.toCoin.amount < transactionForDelete.toCount) {
      throw new BadRequestException(
        `You can't delete this transactions because ypu will have negative ${transactionForDelete.toCoin.coinName} balance`,
      );
    }
    if (transactionForDelete.income) {
      // transactionForDelete.wallet.fixedIncome - transactionForDelete.income
      const fixedIncome = Number(
        new Decimal(transactionForDelete.wallet.fixedIncome).minus(new Decimal(transactionForDelete.income)).valueOf(),
      );
      await this.prisma.wallets.update({ where: { id: transactionForDelete.walletId }, data: { fixedIncome } });
      // const fixedIncome = 1 - transactionForDelete.income;
      // await this.userService.updateUser({ fixedIncome }, transactionForDelete.user.email);
    }
    // Change from coin
    await this.updateCoinsAfterDelete(transactionForDelete.fromCoin, transactionForDelete.toCoin, transactionForDelete);
    await this.prisma.transactions.delete({ where: { id } });
    return { status: 'Transaction deleted' };
  }

  // Save transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async saveTransaction(data: Prisma.TransactionsCreateInput): Promise<Transactions> {
    return this.prisma.transactions.create({ data });
  }

  // Generate Where !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  generateWhere(
    date: string,
    userId: string,
    walletId: string,
    coinId: string,
    status: TransactionStatusEnum,
  ): Prisma.UserWhereInput {
    const whereArr = [];
    if (date) {
      const fromDate = new Date(`${date}T00:00:00.000Z`);
      const toDate = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
      if (isNaN(fromDate.getDate())) {
        throw new BadRequestException('Date should be in yyyy-mm-dd fromat');
      }
      const whereDate = {
        createdAt: { gte: fromDate, lte: toDate },
      };
      whereArr.push(whereDate);
    }
    if (status) {
      whereArr.push({ status });
    }
    if (coinId) {
      const whereCoin = {
        OR: [{ fromCoin: { coinId } }, { toCoin: { coinId } }],
      };
      whereArr.push(whereCoin);
    }
    if (walletId) {
      whereArr.push({ walletId });
    }

    if (userId) {
      whereArr.push({ userId });
    }

    if (whereArr.length > 1) {
      return { AND: whereArr };
    }
    return whereArr[0];
  }

  // Update Coins After Delete !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateCoinsAfterDelete(fromCoin: Coins, toCoin: Coins, transaction: Transactions) {
    // fromCoin.amount + transaction.fromCount
    const fromAmount = Number(new Decimal(fromCoin.amount).plus(new Decimal(transaction.fromCount)).valueOf());

    // fromCoin.spendMoney + transaction.purchse_price
    const fromSpendMoney = Number(new Decimal(fromCoin.spendMoney).plus(new Decimal(transaction.purchse_price)).valueOf());

    // toCoin.amount - transaction.toCount
    const toAmount = Number(new Decimal(toCoin.amount).minus(new Decimal(transaction.toCount)).valueOf());

    // toCoin.spendMoney - transaction.purchse_price
    const toSpendMoney = Number(new Decimal(toCoin.spendMoney).minus(new Decimal(transaction.purchse_price)).valueOf());

    // toSpendMoney / toAmount
    const toAvgPrice =
      toAmount !== 0 ? Number(new Decimal(toSpendMoney).dividedBy(new Decimal(toAmount)).valueOf()) : toCoin.avgPrice;

    // fromSpendMoney / fromAmount
    const fromAvgPrice =
      fromAmount !== 0 ? Number(new Decimal(fromSpendMoney).dividedBy(new Decimal(fromAmount)).valueOf()) : fromCoin.avgPrice;

    await this.coinsService.updateCoin(fromAmount, fromAvgPrice, fromSpendMoney, fromCoin.id);
    await this.coinsService.updateCoin(toAmount, toAvgPrice, toSpendMoney, toCoin.id);
  }

  // Create transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createTransaction(transaction: CreateTransactionDto, userId: string) {
    const user = await this.userService.getOneUser(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const fromCoin = await this.coinsService.getCoinByCoinId(transaction.fromId, transaction.walletId);
    let toCoin = await this.coinsService.getCoinByCoinId(transaction.toId, transaction.walletId);
    if (!fromCoin || fromCoin.amount < transaction.fromCount) {
      throw new BadRequestException(`The user does not have enough ${transaction.fromId}`);
    }
    if (!toCoin && transaction.toCoinType === CoinTypeEnum.Fiat) {
      toCoin = await this.coinsService.createFiat({ code: transaction.toId, amount: 0 }, userId, transaction.walletId);
    } else if (!toCoin && transaction.toCoinType === CoinTypeEnum.Coin) {
      toCoin = await this.coinsService.createCoin(
        { coinId: transaction.toId, amount: 0, spendMoney: 0 },
        userId,
        transaction.walletId,
      );
    }
    return this.genreateTransaction(transaction, fromCoin, toCoin, user);
  }

  async genreateTransaction(
    transaction: CreateTransactionDto,
    fromCoin: Coins,
    toCoin: Coins,
    user: GetUserI,
  ): Promise<Transactions & { currency: Fiat }> {
    const fromType = fromCoin.type;
    const toType = toCoin.type;

    // transaction.fromCount * fromCoin.avgPrice;
    const spendMoney = Number(new Decimal(transaction.fromCount).times(new Decimal(fromCoin.avgPrice)).valueOf());

    //  fromCoin.amount - transaction.fromCount
    const fromAmount = Number(new Decimal(fromCoin.amount).minus(new Decimal(transaction.fromCount)).valueOf());

    // toCoin.amount + transaction.toCount
    const toAmount = Number(new Decimal(toCoin.amount).plus(transaction.toCount).valueOf());

    const wallet = await this.prisma.wallets.findUnique({ where: { id: transaction.walletId } });

    // fromCoin.spendMoney - spendMoney
    let fromSpendMoney = Number(new Decimal(fromCoin.spendMoney).minus(new Decimal(spendMoney)).valueOf());
    if (fromSpendMoney < 0.01) fromSpendMoney = 0;

    if (fromType === toType && fromType === CoinTypeEnum.Fiat) {
      const toFiat = await this.prisma.fiat.findUnique({ where: { code: toCoin.coinId } });
      if (!toFiat) {
        throw new BadRequestException(`Fiat with code: ${toCoin.coinId} not found`);
      }

      // transaction.fromCount * fromCoin.avgPrice
      const purchse_price = Number(new Decimal(transaction.fromCount).times(new Decimal(fromCoin.avgPrice)).valueOf());

      // (toCoin.spendMoney + spendMoney) / toAmount
      const toCoinSpendMoney = new Decimal(toCoin.spendMoney).plus(new Decimal(spendMoney));
      const toAvg = Number(toCoinSpendMoney.dividedBy(new Decimal(toAmount)).valueOf());

      await this.coinsService.updateCoin(fromAmount, fromCoin.avgPrice, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toAvg, toCoin.spendMoney + spendMoney, toCoin.id);

      // purchse_price / transaction.toCount
      const pricePerCoin = Number(new Decimal(purchse_price).dividedBy(new Decimal(transaction.toCount)).valueOf());
      const createdTransaction = await this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        price_per_coin: pricePerCoin,
        toCoin: { connect: { id: toCoin.id } },
        user: { connect: { id: user.id } },
        purchse_price,
        status: TransactionStatusEnum.Transfer,
        wallet: { connect: { id: transaction.walletId } },
      });
      const transformedTransaction = CurrencyHelper.calculateCurrency(
        createdTransaction,
        currencyFileds.transaction,
        user.currency,
      );
      return { ...transformedTransaction, currency: user.currency };
    }

    if (fromType === toType && fromType === CoinTypeEnum.Coin) {
      const fromAvg = fromAmount === 0 ? 0 : fromCoin.avgPrice;

      // (toCoin.spendMoney + spendMoney) / toAmount
      const toCoinSpendMoney = new Decimal(toCoin.spendMoney).plus(new Decimal(spendMoney));
      const toAvg = Number(toCoinSpendMoney.dividedBy(new Decimal(toAmount)).valueOf());
      await this.coinsService.updateCoin(fromAmount, fromAvg, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toAvg, toCoin.spendMoney + spendMoney, toCoin.id);

      // transaction.fromCount * fromCoin.avgPrice
      const purchasePrice = Number(new Decimal(transaction.fromCount).times(new Decimal(fromCoin.avgPrice)).valueOf());
      const createdTransaction = await this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        toCoin: { connect: { id: toCoin.id } },
        user: { connect: { id: user.id } },
        purchse_price: purchasePrice,
        status: TransactionStatusEnum.Transfer,
        wallet: { connect: { id: transaction.walletId } },
      });

      const transformedTransaction = CurrencyHelper.calculateCurrency(
        createdTransaction,
        currencyFileds.transaction,
        user.currency,
      );
      return { ...transformedTransaction, currency: user.currency };
    }

    if (fromType === CoinTypeEnum.Coin && toType === CoinTypeEnum.Fiat) {
      const fiat = await this.prisma.fiat.findUnique({ where: { code: toCoin.coinId } });
      if (!fiat) {
        throw new BadRequestException(`Fiat with code: ${toCoin.coinId} not found`);
      }
      const fromAvg = fromAmount === 0 ? 0 : fromCoin.avgPrice;

      // transaction.toCount * toCoin.avgPrice - spendMoney
      const income = Number(
        new Decimal(transaction.toCount).times(new Decimal(toCoin.avgPrice)).minus(new Decimal(spendMoney)).valueOf(),
      );

      // wallet.fixedIncome + income
      const fixedIncome = Number(new Decimal(wallet.fixedIncome).plus(new Decimal(income)).valueOf());
      await this.prisma.wallets.update({
        where: { id: transaction.walletId },
        data: { fixedIncome },
      });

      // toAmount * toCoin.avgPrice
      const toSpendMoney = Number(new Decimal(toAmount).times(new Decimal(toCoin.avgPrice)).valueOf());
      await this.coinsService.updateCoin(fromAmount, fromAvg, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toCoin.avgPrice, toSpendMoney, toCoin.id);

      // (transaction.toCount * toCoin.avgPrice) / transaction.fromCount
      const pricePerCoin = Number(
        new Decimal(transaction.toCount).times(new Decimal(toCoin.avgPrice)).dividedBy(new Decimal(transaction.fromCount)),
      );

      // transaction.fromCount * fromCoin.avgPrice
      const purchasePrice = Number(new Decimal(transaction.fromCount).times(new Decimal(fromCoin.avgPrice)).valueOf());
      const createdTransaction = await this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        toCoin: { connect: { id: toCoin.id } },
        price_per_coin: pricePerCoin,
        income,
        user: { connect: { id: user.id } },
        purchse_price: purchasePrice,
        wallet: { connect: { id: transaction.walletId } },
        status: TransactionStatusEnum.Sell,
      });

      const transformedTransaction = CurrencyHelper.calculateCurrency(
        createdTransaction,
        currencyFileds.transaction,
        user.currency,
      );
      return { ...transformedTransaction, currency: user.currency };
    }

    if (fromType === CoinTypeEnum.Fiat && toType === CoinTypeEnum.Coin) {
      const fiat = await this.prisma.fiat.findUnique({ where: { code: fromCoin.coinId } });
      if (!fiat) {
        throw new BadRequestException(`Fiat with code: ${toCoin.coinId} not found`);
      }

      // (toCoin.spendMoney + spendMoney) / toAmount
      const toAvg = Number(
        new Decimal(toCoin.spendMoney).plus(new Decimal(spendMoney)).dividedBy(new Decimal(toAmount)).valueOf(),
      );

      // toCoin.spendMoney + spendMoney
      const toCoinSpendMoney = Number(new Decimal(toCoin.spendMoney).plus(new Decimal(spendMoney)).valueOf());
      await this.coinsService.updateCoin(fromAmount, fromCoin.avgPrice, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toAvg, toCoinSpendMoney, toCoin.id);

      // (transaction.fromCount * fromCoin.avgPrice) / transaction.toCount
      const pricePerCoin = Number(
        new Decimal(transaction.fromCount)
          .times(new Decimal(fromCoin.avgPrice))
          .dividedBy(new Decimal(transaction.toCount))
          .valueOf(),
      );

      // transaction.fromCount * fromCoin.avgPrice
      const purchasePrice = Number(new Decimal(transaction.fromCount).times(new Decimal(fromCoin.avgPrice)).valueOf());
      const createdTransaction = await this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        toCoin: { connect: { id: toCoin.id } },
        price_per_coin: pricePerCoin,
        user: { connect: { id: user.id } },
        purchse_price: purchasePrice,
        status: TransactionStatusEnum.Buy,
        wallet: { connect: { id: transaction.walletId } },
      });

      const transformedTransaction = CurrencyHelper.calculateCurrency(
        createdTransaction,
        currencyFileds.transaction,
        user.currency,
      );
      return { ...transformedTransaction, currency: user.currency };
    }
  }
}
