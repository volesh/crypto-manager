import { Prisma, PrismaClient, Transactions, User } from '@prisma/client';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FiatEnum } from 'src/general/enums/fiat.enam';
import { UserService } from '../user/user.service';
import { CoinsService } from '../coins/coins.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly coinsService: CoinsService,
  ) {}

  async createTransaction(
    transaction: CreateTransactionDto,
    userId: string,
  ): Promise<Transactions> {
    const isUserExist = await this.userService.getFullUserInfo({ id: userId });
    if (!isUserExist) {
      throw new NotFoundException(`User with id: ${userId} not found`);
    }
    if (transaction.fromId === transaction.toId) {
      throw new BadRequestException(`fromId and toId can't be same`);
    }
    if (transaction.fromId === FiatEnum.Dolar) {
      return this.buyCoin(
        transaction.fromCount,
        transaction.toCount,
        userId,
        transaction.toId,
      );
    } else if (transaction.toId === FiatEnum.Dolar) {
      return this.sellCoin(
        transaction.toCount,
        transaction.fromCount,
        isUserExist,
        transaction.fromId,
      );
    } else {
      return this.swapCoins(transaction, userId);
    }
  }

  // Buy Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async buyCoin(
    usd: number,
    coin: number,
    userId: string,
    coinId: string,
  ): Promise<Transactions> {
    let createdCoinId = '';
    // Find usdToken and throw errro if not finding
    const usdCoin = await this.coinsService.getCoinByCoinId(
      FiatEnum.Dolar,
      userId,
    );
    if (!usdCoin || usdCoin.amount < usd) {
      throw new BadRequestException(
        'You have less USD on your balance than you indicated in the transaction',
      );
    }
    //  If user already have coin update this coin and create if not exist
    const selectedCoin = await this.coinsService.getCoinByCoinId(
      coinId,
      userId,
    );
    if (selectedCoin) {
      const { amount, spendMoney } = selectedCoin;
      const newAmount = amount + coin;
      const newSpendMoney = spendMoney + usd;
      const newAvgPrice = +(newSpendMoney / newAmount).toFixed(9);
      const updatedCoin = await this.coinsService.updateCoin(
        newAmount,
        newAvgPrice,
        newSpendMoney,
        selectedCoin.id,
      );
      createdCoinId = updatedCoin.id;
    } else {
      const createdCoin = await this.coinsService.createCoin(
        { coinId, amount: coin, spendMoney: usd },
        userId,
      );
      createdCoinId = createdCoin.id;
    }

    // Update user's usd coin
    await this.prisma.coins.update({
      where: { id: usdCoin.id },
      data: {
        amount: usdCoin.amount - usd,
        spendMoney: usdCoin.spendMoney - usd,
      },
    });

    // Create and return transaction
    return this.saveTransaction({
      fromCount: usd,
      fromCoin: { connect: { id: usdCoin.id } },
      toCount: coin,
      toCoin: { connect: { id: createdCoinId } },
      price_per_coin: usd / coin,
      user: { connect: { id: userId } },
    });
  }

  // Sell Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async sellCoin(
    usd: number,
    coin: number,
    user: User,
    coinId: string,
  ): Promise<Transactions> {
    const fromCoin = await this.coinsService.getCoinByCoinId(coinId, user.id);
    if (!fromCoin || fromCoin.amount < coin) {
      throw new BadRequestException(
        `User don't have coin with "${coinId}" coindId or it is not enough`,
      );
    }
    const usdCoin = await this.coinsService.getCoinByCoinId(
      FiatEnum.Dolar,
      user.id,
    );
    if (!usdCoin) {
      await this.coinsService.createFiat(usd, user.id);
    } else {
      await this.coinsService.updateCoin(
        usdCoin.amount + usd,
        usdCoin.avgPrice,
        usdCoin.amount + usd,
        usdCoin.id,
      );
    }
    const income = usd - fromCoin.avgPrice * coin;
    const newAmount = fromCoin.amount - coin;
    const newSpendMoney = fromCoin.spendMoney - fromCoin.avgPrice * coin;
    await this.coinsService.updateCoin(
      newAmount,
      fromCoin.avgPrice,
      newSpendMoney,
      fromCoin.id,
    );
    await this.userService.updateUser(
      { fixedIncome: user.fixedIncome + (usd - fromCoin.avgPrice * coin) },
      user.email,
    );
    return this.saveTransaction({
      fromCount: coin,
      fromCoin: { connect: { id: fromCoin.id } },
      toCount: usd,
      toCoin: { connect: { id: usdCoin.id } },
      price_per_coin: usd / coin,
      income,
      user: { connect: { id: user.id } },
    });
  }

  async swapCoins(
    transaction: CreateTransactionDto,
    userId: string,
  ): Promise<Transactions> {
    const fromCoin = await this.coinsService.getCoinByCoinId(
      transaction.fromId,
      userId,
    );
    if (!fromCoin || fromCoin.amount < transaction.fromCount) {
      throw new BadRequestException(
        `User don't have coin with "${transaction.fromId}" coindId or it is not enough`,
      );
    }
    const toCoin = await this.coinsService.getCoinByCoinId(
      transaction.toId,
      userId,
    );
    let toCoinId = toCoin.id;
    if (!toCoin) {
      const spendMoney = fromCoin.amount * fromCoin.avgPrice;
      const createdCoin = await this.coinsService.createCoin(
        { coinId: transaction.toId, amount: transaction.toCount, spendMoney },
        userId,
      );
      toCoinId = createdCoin.id;
    } else {
      const amount = toCoin.amount + transaction.toCount;
      const spendMoney =
        toCoin.spendMoney + fromCoin.amount * fromCoin.avgPrice;
      const avgPrice = spendMoney / amount;
      await this.coinsService.updateCoin(
        amount,
        avgPrice,
        spendMoney,
        toCoin.id,
      );
    }
    await this.coinsService.updateCoin(
      fromCoin.amount - transaction.fromCount,
      fromCoin.avgPrice,
      (fromCoin.amount - transaction.fromCount) * fromCoin.avgPrice,
      fromCoin.id,
    );
    return this.saveTransaction({
      fromCount: transaction.fromCount,
      fromCoin: { connect: { id: fromCoin.id } },
      toCount: transaction.toCount,
      toCoin: { connect: { id: toCoinId } },
      user: { connect: { id: userId } },
    });
  }

  async saveTransaction(
    data: Prisma.TransactionsCreateInput,
  ): Promise<Transactions> {
    return this.prisma.transactions.create({ data });
  }
}
