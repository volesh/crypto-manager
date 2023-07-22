import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coins, Fiat, Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { currencyFileds } from 'src/general/configs';
import { CoinTypeEnum, FieldsForSort, OrderEnum } from 'src/general/enums';
import { CurrencyHelper } from 'src/general/helpers';
import { PrismaService } from 'src/prisma.service';
import { CoingeckoService } from 'src/services/coingecko/coingecko.service';

import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import { CreateCoinDto } from './dto/create.coin.dto';
import { CreateFiatDto } from './dto/create.fiat.dto';

@Injectable()
export class CoinsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get Coins !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getCoins(
    userId: string,
    walletId: string,
    page: number,
    perPage: number,
    orderBy: FieldsForSort,
    orderDirection: OrderEnum,
    coinId: string,
  ): Promise<PaginationResponseI<Coins>> {
    const skip = (page - 1) * perPage;
    let coins: Coins[] = [];
    let totalPages = 0;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { currency: true } });
    if (walletId) {
      const where = this.generateWhere(walletId, null, coinId);
      const totalCoins = await this.prisma.coins.count({
        where,
      });
      totalPages = Math.ceil(totalCoins / perPage);
      coins = await this.prisma.coins.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [orderBy]: orderDirection },
      });
    } else {
      const where = this.generateWhere(null, userId, coinId);
      const uniqueCoins = await this.prisma.coins.groupBy({
        by: ['coinId'],
        where,
        _count: true,
        _sum: {
          amount: true,
          spendMoney: true,
        },
      });
      totalPages = Math.ceil(uniqueCoins.length / perPage);

      const sorted =
        orderDirection === OrderEnum.ASC
          ? [...uniqueCoins].sort((a, b) => a[orderBy] - b[orderBy])
          : [...uniqueCoins].sort((a, b) => b[orderBy] - a[orderBy]);
      const coinsIds = sorted.slice(skip, skip + perPage).map((elem) => elem.coinId);

      let arrayOfCoins = await this.prisma.coins.findMany({
        where: {
          userId,
          coinId: { in: coinsIds },
        },
      });
      arrayOfCoins =
        orderDirection === OrderEnum.ASC
          ? [...arrayOfCoins].sort((a, b) => a[orderBy] - b[orderBy])
          : [...arrayOfCoins].sort((a, b) => b[orderBy] - a[orderBy]);

      arrayOfCoins.forEach((coin) => {
        const elem = coins.find((elem) => elem.coinId === coin.coinId);

        if (elem) {
          const elemSpendMoney = new Decimal(elem.spendMoney);
          const coinSpendMoney = new Decimal(coin.spendMoney);
          const elemAmount = new Decimal(elem.amount);
          const coinAmount = new Decimal(coin.amount);

          //  elem.spendMoney += coin.spendMoney
          elem.spendMoney = Number(elemSpendMoney.plus(coinSpendMoney).valueOf());

          // elem.amount += coin.amount
          elem.amount = Number(elemAmount.plus(coinAmount).valueOf());

          // elem.avgPrice = elem.avgPrice / elem.amount
          elem.avgPrice = Number(elemSpendMoney.dividedBy(elemAmount).valueOf());
        } else {
          coin.walletId = null;
          coins.push(coin);
        }
      });
    }

    const updatedCoins = coins.map((coin) => {
      return CurrencyHelper.calculateCurrency(coin, currencyFileds.coin, user.currency);
    });
    return {
      page,
      totalPages,
      perPage,
      data: updatedCoins,
      currency: user.currency,
    };
  }

  // Create Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createCoin(coin: CreateCoinDto, userId: string, walletId: string): Promise<Coins> {
    const isWalletExist = await this.prisma.wallets.findUnique({
      where: { id: walletId },
    });
    if (!isWalletExist) {
      throw new NotFoundException(`Wallet with id: ${walletId} not found`);
    }
    const spendMoney = new Decimal(coin.spendMoney);
    const coinAmount = new Decimal(coin.amount);

    // avgPrice = coin.spendMoney / coin.amount
    const avgPrice = Number(spendMoney.dividedBy(coinAmount).valueOf()) || 0;

    const coinMarket = await CoingeckoService.getCoinMarkest([coin.coinId]);
    if (coinMarket.length === 0) {
      throw new BadRequestException(`Coin with id ${coin.coinId} not found`);
    }
    const selectedCoin = coinMarket.find((data) => data.id === coin.coinId);
    return this.prisma.coins.create({
      data: {
        ...coin,
        coinName: selectedCoin.name,
        symbol: selectedCoin.symbol,
        type: CoinTypeEnum.Coin,
        img: selectedCoin.image,
        avgPrice,
        wallet: { connect: { id: walletId } },
        user: { connect: { id: userId } },
      },
    });
  }

  // Get Coin By Id !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getCoinByCoinId(coinId: string, walletId?: string): Promise<Coins> {
    return this.prisma.coins.findFirst({ where: { coinId, walletId } });
  }

  // Update Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateCoin(amount: number, avgPrice: number, spendMoney: number, id: string) {
    return this.prisma.coins.update({
      where: { id },
      data: { amount, avgPrice, spendMoney },
    });
  }

  // Calculate Crypto balance !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async calculateCryptoBalance(userId: string): Promise<{ balance: number; notFixedIncome: number; fiat: number }> {
    let balance = new Decimal(0);
    let notFixedIncome = new Decimal(0);
    let fiat = new Decimal(0);
    const coins = await this.getUsersCoins(userId);
    if (!coins) {
      return {
        balance: Number(balance.valueOf()),
        notFixedIncome: Number(notFixedIncome.valueOf()),
        fiat: Number(fiat.valueOf()),
      };
    }
    const listOfCoinIdPromises = coins.map(async (coin) => {
      if (coin.type !== CoinTypeEnum.Fiat) {
        return coin.coinId;
      } else {
        const { price } = await this.prisma.fiat.findUnique({ where: { code: coin.coinId } });

        const priceD = new Decimal(price);
        const coinAmount = new Decimal(coin.amount);

        // fiat = coin.amount / price
        fiat = coinAmount.dividedBy(priceD);
      }
    });
    const listOfCoinId = await Promise.all(listOfCoinIdPromises);
    const coinMarkets = await CoingeckoService.getCoinMarkest(listOfCoinId);
    coins.forEach((coin) => {
      const market = coinMarkets.find((item) => item.id === coin.coinId);
      if (!market || coin.type === CoinTypeEnum.Fiat) {
        return;
      }
      const coinAmount = new Decimal(coin.amount);
      const marketPrice = new Decimal(market.current_price);
      const coinSpendMoney = new Decimal(coin.spendMoney);

      // balande += market.current_price * coin.amount
      balance = balance.plus(marketPrice.times(coinAmount));

      // notFixedIncome += market.current_price * coin.amount - coin.spendMoney
      notFixedIncome = notFixedIncome.plus(marketPrice.times(coinAmount).minus(coinSpendMoney));
    });
    return { balance: Number(balance.valueOf()), notFixedIncome: Number(notFixedIncome.valueOf()), fiat: Number(fiat.valueOf()) };
  }

  // Get Wallet Coins !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getWalletCoins(walletId: string): Promise<Coins[]> {
    return this.prisma.coins.findMany({ where: { walletId } });
  }

  // Get UserCoins !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getUsersCoins(userId: string): Promise<Coins[]> {
    return this.prisma.coins.findMany({ where: { userId } });
  }

  // Get All fiat !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getFiatList(): Promise<Fiat[]> {
    return await this.prisma.fiat.findMany();
  }

  // Create fiat !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createFiat(fiatDto: CreateFiatDto, userId: string, walletId: string): Promise<Coins> {
    const fiat = await this.prisma.fiat.findUnique({
      where: { code: fiatDto.code },
    });
    if (!fiat) {
      throw new NotFoundException(`Fiat with code: ${fiatDto.code} not found`);
    }
    // fiatDto.amount / fiat.price
    const spendMoney = Number(new Decimal(fiatDto.amount).dividedBy(new Decimal(fiat.price)).valueOf());
    return this.prisma.coins.create({
      data: {
        amount: fiatDto.amount,
        spendMoney,
        type: CoinTypeEnum.Fiat,
        symbol: fiat.symbol,
        img: fiat.img,
        coinName: fiat.name,
        coinId: fiat.code,
        wallet: { connect: { id: walletId } },
        // 1 / fiat.price
        avgPrice: fiatDto ? Number(new Decimal(1).dividedBy(new Decimal(fiat.price)).valueOf()) : 0,
        user: { connect: { id: userId } },
      },
    });
  }

  // Generate Where !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  generateWhere(walletId: string, userId: string, coinId: string): Prisma.CoinsWhereInput {
    const whereArr = [];
    if (walletId) {
      whereArr.push({ walletId });
    }
    if (coinId) {
      whereArr.push({ coinId });
    }
    if (userId) {
      whereArr.push({ userId });
    }
    if (whereArr.length > 1) {
      return { AND: whereArr };
    }
    return whereArr[0];
  }
}
