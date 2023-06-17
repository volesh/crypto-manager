import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import { Coins, Prisma, Transactions, User } from '@prisma/client';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from '../user/user.service';
import { CoinsService } from '../coins/coins.service';
import { TransactionStatusEnum } from 'src/general/enums/transaction.status.enum';
import { GetUserI } from 'src/general/interfaces/user/get.user.interface';
import { CoinTypeEnum } from 'src/general/enums/coins.type.enum';

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
    page: number,
    perPage: number,
    orderBy: string,
    date: string,
    coinId: string,
    status: TransactionStatusEnum,
  ): Promise<PaginationResponseI<Transactions>> {
    const skip = (page - 1) * perPage;
    const where = this.generateWhere(date, userId, coinId, status);
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
    return {
      data: transactions,
      page: page,
      perPage,
      totalPages,
    };
  }

  // Delete Transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async deleteTransaction(id: string): Promise<Transactions> {
    const transactionForDelete = await this.prisma.transactions.findUnique({
      where: { id },
      include: { fromCoin: true, toCoin: true, user: true },
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
      const fixedIncome = transactionForDelete.user.fixedIncome - transactionForDelete.income;
      await this.userService.updateUser({ fixedIncome }, transactionForDelete.user.email);
    }
    // Change from coin
    await this.updateCoinsAfterDelete(transactionForDelete.fromCoin, transactionForDelete.toCoin, transactionForDelete);
    return this.prisma.transactions.delete({ where: { id } });
  }

  // Create Transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // async createTransaction(transaction: CreateTransactionDto, userId: string): Promise<Transactions> {
  //   const isUserExist = await this.userService.getFullUserInfo({ id: userId });
  //   if (!isUserExist) {
  //     throw new NotFoundException(`User with id: ${userId} not found`);
  //   }
  //   if (transaction.fromId === transaction.toId) {
  //     throw new BadRequestException(`fromId and toId can't be same`);
  //   }
  //   if (transaction.fromId === transaction.fromId) {
  //     return this.buyCoin(transaction.fromCount, transaction.toCount, userId, transaction.toId);
  //   } else if (transaction.toId === transaction.toId) {
  //     return this.sellCoin(transaction.toCount, transaction.fromCount, isUserExist, transaction.fromId);
  //   } else {
  //     return this.swapCoins(transaction, userId);
  //   }
  // }

  // Buy Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // async buyCoin(usd: number, coin: number, userId: string, coinId: string): Promise<Transactions> {
  //   let createdCoinId = '';
  //   // Find usdToken and throw errro if not finding
  //   const usdCoin = await this.coinsService.getCoinByCoinId(coinId, userId); //
  //   if (!usdCoin || usdCoin.amount < usd) {
  //     //
  //     throw new BadRequestException( //
  //       'You have less USD on your balance than you indicated in the transaction', //
  //     ); //
  //   } //
  //   //  If user already have coin update this coin and create if not exist
  //   const selectedCoin = await this.coinsService.getCoinByCoinId(coinId, userId);
  //   if (selectedCoin) {
  //     const { amount, spendMoney } = selectedCoin;
  //     const newAmount = amount + coin;
  //     const newSpendMoney = spendMoney + usd;
  //     const newAvgPrice = +(newSpendMoney / newAmount);
  //     const updatedCoin = await this.coinsService.updateCoin(newAmount, newAvgPrice, newSpendMoney, selectedCoin.id);
  //     createdCoinId = updatedCoin.id;
  //   } else {
  //     const createdCoin = await this.coinsService.createCoin({ coinId, amount: coin, spendMoney: usd }, userId);
  //     createdCoinId = createdCoin.id;
  //   }

  //   // Update user's usd coin
  //   await this.prisma.coins.update({
  //     where: { id: usdCoin.id },
  //     data: {
  //       amount: usdCoin.amount - usd,
  //       spendMoney: usdCoin.spendMoney - usd,
  //     },
  //   });

  //   // Create and return transaction
  //   return this.saveTransaction({
  //     fromCount: usd,
  //     fromCoin: { connect: { id: usdCoin.id } },
  //     toCount: coin,
  //     toCoin: { connect: { id: createdCoinId } },
  //     price_per_coin: usd / coin,
  //     user: { connect: { id: userId } },
  //     purchse_price: usd,
  //     status: TransactionStatusEnum.Buy,
  //   });
  // }

  // Sell Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // async sellCoin(usd: number, coin: number, user: GetUserI, coinId: string): Promise<Transactions> {
  //   const fromCoin = await this.coinsService.getCoinByCoinId(coinId, user.id);
  //   if (!fromCoin || fromCoin.amount < coin) {
  //     throw new BadRequestException(`User don't have coin with "${coinId}" coindId or it is not enough`);
  //   }
  //   const usdCoin = await this.coinsService.getCoinByCoinId(coinId, user.id);
  //   if (!usdCoin) {
  //     await this.coinsService.createFiat(usd, user.id);
  //   } else {
  //     await this.coinsService.updateCoin(usdCoin.amount + usd, usdCoin.avgPrice, usdCoin.amount + usd, usdCoin.id);
  //   }
  //   const income = usd - fromCoin.avgPrice * coin;
  //   const newAmount = fromCoin.amount - coin;
  //   const newSpendMoney = fromCoin.spendMoney - fromCoin.avgPrice * coin;
  //   await this.coinsService.updateCoin(newAmount, fromCoin.avgPrice, newSpendMoney, fromCoin.id);
  //   await this.userService.updateUser(
  //     { fixedIncome: user.fixedIncome + (usd - fromCoin.avgPrice * coin) },
  //     this.userService.validateEmail(user.email),
  //   );
  //   return this.saveTransaction({
  //     fromCount: coin,
  //     fromCoin: { connect: { id: fromCoin.id } },
  //     toCount: usd,
  //     toCoin: { connect: { id: usdCoin.id } },
  //     price_per_coin: usd / coin,
  //     income,
  //     user: { connect: { id: user.id } },
  //     purchse_price: fromCoin.amount * fromCoin.avgPrice,
  //     status: TransactionStatusEnum.Sell,
  //   });
  // }

  // async swapCoins(transaction: CreateTransactionDto, userId: string): Promise<Transactions> {
  //   const fromCoin = await this.coinsService.getCoinByCoinId(transaction.fromId, userId);
  //   if (!fromCoin || fromCoin.amount < transaction.fromCount) {
  //     throw new BadRequestException(`User don't have coin with "${transaction.fromId}" coindId or it is not enough`);
  //   }
  //   const toCoin = await this.coinsService.getCoinByCoinId(transaction.toId, userId);
  //   let toCoinId = toCoin.id;
  //   if (!toCoin) {
  //     const spendMoney = fromCoin.amount * fromCoin.avgPrice;
  //     const createdCoin = await this.coinsService.createCoin(
  //       { coinId: transaction.toId, amount: transaction.toCount, spendMoney },
  //       userId,
  //     );
  //     toCoinId = createdCoin.id;
  //   } else {
  //     const amount = toCoin.amount + transaction.toCount;
  //     const spendMoney = toCoin.spendMoney + fromCoin.amount * fromCoin.avgPrice;
  //     const avgPrice = spendMoney / amount;
  //     await this.coinsService.updateCoin(amount, avgPrice, spendMoney, toCoin.id);
  //   }
  //   await this.coinsService.updateCoin(
  //     fromCoin.amount - transaction.fromCount,
  //     fromCoin.avgPrice,
  //     (fromCoin.amount - transaction.fromCount) * fromCoin.avgPrice,
  //     fromCoin.id,
  //   );
  //   return this.saveTransaction({
  //     fromCount: transaction.fromCount,
  //     fromCoin: { connect: { id: fromCoin.id } },
  //     toCount: transaction.toCount,
  //     toCoin: { connect: { id: toCoinId } },
  //     user: { connect: { id: userId } },
  //     purchse_price: fromCoin.amount * fromCoin.avgPrice,
  //     status: TransactionStatusEnum.Transfer,
  //   });
  // }

  // Save transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async saveTransaction(data: Prisma.TransactionsCreateInput): Promise<Transactions> {
    return this.prisma.transactions.create({ data });
  }

  // Generate Where !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  generateWhere(date: string, userId: string, coinId: string, status: TransactionStatusEnum): Prisma.UserWhereInput {
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

    whereArr.push({ userId });

    if (whereArr.length > 1) {
      return { AND: whereArr };
    }
    return whereArr[0];
  }

  // Update Coins After Delete !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateCoinsAfterDelete(fromCoin: Coins, toCoin: Coins, transaction: Transactions) {
    const fromAmount = fromCoin.amount + transaction.fromCount;
    let fromSpendMoney = fromCoin.spendMoney + transaction.purchse_price;
    const toAmount = toCoin.amount - transaction.toCount;
    let toSpendMoney = toCoin.spendMoney - transaction.purchse_price;
    const toAvgPrice = toAmount !== 0 ? toSpendMoney / toAmount : toCoin.avgPrice;
    const fromAvgPrice = fromAmount !== 0 ? fromSpendMoney / fromAmount : fromCoin.avgPrice;
    await this.coinsService.updateCoin(fromAmount, fromAvgPrice, fromSpendMoney, fromCoin.id);
    await this.coinsService.updateCoin(toAmount, toAvgPrice, toSpendMoney, toCoin.id);
  }

  // New create transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createTransaction(transaction: CreateTransactionDto, userId: string) {
    const user = await this.userService.getOneUser(userId, 'USD');
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const fromCoin = await this.coinsService.getCoinByCoinId(transaction.fromId, userId);
    let toCoin = await this.coinsService.getCoinByCoinId(transaction.toId, userId);
    if (!fromCoin || fromCoin.amount < transaction.fromCount) {
      throw new BadRequestException(`The user does not have enough ${transaction.fromId}`);
    }
    if (!toCoin && transaction.toCoinType === CoinTypeEnum.Fiat) {
      toCoin = await this.coinsService.createFiat({ code: transaction.toId, amount: 0 }, userId);
    } else if (!toCoin && transaction.toCoinType === CoinTypeEnum.Coin) {
      toCoin = await this.coinsService.createCoin({ coinId: transaction.toId, amount: 0, spendMoney: 0 }, userId);
    }
    return this.genreateTransaction(transaction, fromCoin, toCoin, user);
  }

  async genreateTransaction(
    transaction: CreateTransactionDto,
    fromCoin: Coins,
    toCoin: Coins,
    user: GetUserI,
  ): Promise<Transactions> {
    const fromType = fromCoin.type;
    const toType = toCoin.type;
    const spendMoney = transaction.fromCount * fromCoin.avgPrice;
    const fromAmount = fromCoin.amount - transaction.fromCount;
    const toAmount = toCoin.amount + transaction.toCount;
    let fromSpendMoney = fromCoin.spendMoney - spendMoney;
    if (fromSpendMoney < 0.01) fromSpendMoney = 0;

    if (fromType === toType && fromType === CoinTypeEnum.Fiat) {
      const toFiat = await this.prisma.fiat.findUnique({ where: { code: toCoin.coinId } });
      if (!toFiat) {
        throw new BadRequestException(`Fiat with code: ${toCoin.coinId} not found`);
      }
      const purchse_price = transaction.fromCount * fromCoin.avgPrice;
      const toAvg = (toCoin.spendMoney + spendMoney) / toAmount;
      await this.coinsService.updateCoin(fromAmount, fromCoin.avgPrice, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toAvg, toCoin.spendMoney + spendMoney, toCoin.id);
      return this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        price_per_coin: purchse_price / transaction.toCount,
        toCoin: { connect: { id: toCoin.id } },
        user: { connect: { id: user.id } },
        purchse_price,
        status: TransactionStatusEnum.Transfer,
      });
    }

    if (fromType === toType && fromType === CoinTypeEnum.Coin) {
      const fromAvg = fromAmount === 0 ? 0 : fromCoin.avgPrice;
      const toAvg = (toCoin.spendMoney + spendMoney) / toAmount;
      await this.coinsService.updateCoin(fromAmount, fromAvg, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toAvg, toCoin.spendMoney + spendMoney, toCoin.id);
      return this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        toCoin: { connect: { id: toCoin.id } },
        user: { connect: { id: user.id } },
        purchse_price: transaction.fromCount * fromCoin.avgPrice,
        status: TransactionStatusEnum.Transfer,
      });
    }

    if (fromType === CoinTypeEnum.Coin && toType === CoinTypeEnum.Fiat) {
      const fiat = await this.prisma.fiat.findUnique({ where: { code: toCoin.coinId } });
      if (!fiat) {
        throw new BadRequestException(`Fiat with code: ${toCoin.coinId} not found`);
      }
      const fromAvg = fromAmount === 0 ? 0 : fromCoin.avgPrice;
      const income = transaction.toCount * toCoin.avgPrice - spendMoney;
      await this.userService.updateUser({ fixedIncome: user.fixedIncome + income }, user.email);
      await this.coinsService.updateCoin(fromAmount, fromAvg, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toCoin.avgPrice, toAmount * toCoin.avgPrice, toCoin.id);
      return this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        toCoin: { connect: { id: toCoin.id } },
        price_per_coin: (transaction.toCount * toCoin.avgPrice) / transaction.fromCount,
        income,
        user: { connect: { id: user.id } },
        purchse_price: transaction.fromCount * fromCoin.avgPrice,
        status: TransactionStatusEnum.Sell,
      });
    }

    if (fromType === CoinTypeEnum.Fiat && toType === CoinTypeEnum.Coin) {
      const fiat = await this.prisma.fiat.findUnique({ where: { code: fromCoin.coinId } });
      if (!fiat) {
        throw new BadRequestException(`Fiat with code: ${toCoin.coinId} not found`);
      }
      const toAvg = (toCoin.spendMoney + spendMoney) / toAmount;
      await this.coinsService.updateCoin(fromAmount, fromCoin.avgPrice, fromSpendMoney, fromCoin.id);
      await this.coinsService.updateCoin(toAmount, toAvg, toCoin.spendMoney + spendMoney, toCoin.id);
      return this.saveTransaction({
        fromCount: transaction.fromCount,
        fromCoin: { connect: { id: fromCoin.id } },
        toCount: transaction.toCount,
        toCoin: { connect: { id: toCoin.id } },
        price_per_coin: (transaction.fromCount * fromCoin.avgPrice) / transaction.toCount,
        user: { connect: { id: user.id } },
        purchse_price: transaction.fromCount * fromCoin.avgPrice,
        status: TransactionStatusEnum.Buy,
      });
    }
  }
}
