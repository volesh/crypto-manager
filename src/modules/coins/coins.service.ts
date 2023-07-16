import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Coins, Fiat, Prisma } from '@prisma/client';
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
          elem.spendMoney += coin.spendMoney;
          elem.amount += coin.amount;
          elem.avgPrice = elem.spendMoney / elem.amount;
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
    const isUserExist = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!isUserExist) {
      throw new NotFoundException(`User with id: ${userId} not found`);
    }
    const avgPrice = Math.round((coin.spendMoney / coin.amount) * 100) / 100 || 0;
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
  async calculateCryptoBalance(userId: string) {
    let balance = 0;
    let notFixedIncome = 0;
    let fiat = 0;
    const coins = await this.getUsersCoins(userId);
    if (!coins) {
      return { balance, notFixedIncome };
    }
    const listOfCoinIdPromises = coins.map(async (coin) => {
      if (coin.type !== CoinTypeEnum.Fiat) {
        return coin.coinId;
      } else {
        const { price } = await this.prisma.fiat.findUnique({ where: { code: coin.coinId } });

        fiat += coin.amount / price;
      }
    });
    const listOfCoinId = await Promise.all(listOfCoinIdPromises);
    const coinMarkets = await CoingeckoService.getCoinMarkest(listOfCoinId);
    coins.forEach((coin) => {
      const market = coinMarkets.find((item) => item.id === coin.coinId);
      if (!market || coin.type === CoinTypeEnum.Fiat) {
        return;
      }
      balance += market.current_price * coin.amount;
      notFixedIncome += market.current_price * coin.amount - coin.spendMoney;
    });
    balance = +balance;
    notFixedIncome = +notFixedIncome;
    return { balance, notFixedIncome, fiat };
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
  async createFiat(fiatDto: CreateFiatDto, userId: string, walletId): Promise<Coins> {
    const fiat = await this.prisma.fiat.findUnique({
      where: { code: fiatDto.code },
    });
    if (!fiat) {
      throw new NotFoundException(`Fiat with code: ${fiatDto.code} not found`);
    }
    return this.prisma.coins.create({
      data: {
        amount: fiatDto.amount,
        spendMoney: fiatDto.amount / fiat.price,
        type: CoinTypeEnum.Fiat,
        symbol: fiat.symbol,
        img: fiat.img,
        coinName: fiat.name,
        coinId: fiat.code,
        wallet: { connect: { id: walletId } },
        avgPrice: fiatDto ? 1 / fiat.price : 0,
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
