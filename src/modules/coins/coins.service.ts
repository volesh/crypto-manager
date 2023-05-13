import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCoinDto } from './dto/create.coin.dto';
import { PrismaService } from 'src/prisma.service';
import { Coins, Prisma } from '@prisma/client';
import { CoingeckoService } from 'src/coingecko/coingecko.service';
import { FiatEnum } from 'src/general/enums/fiat.enam';
import { OrderEnum } from 'src/general/enums/order.enum';

@Injectable()
export class CoinsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get Coins !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getCoins(
    userId: string,
    page: number,
    perPage: number,
    orderBy: string,
    orderDirecrion: OrderEnum,
    coinId: string,
  ): Promise<PaginationResponseI<Coins>> {
    const skip = (page - 1) * perPage;
    const where = this.generateWhere(userId, coinId);
    const totalTransactions = await this.prisma.coins.count({
      where,
    });
    const totalPages = Math.ceil(totalTransactions / perPage);
    const coins = await this.prisma.coins.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { [orderBy]: orderDirecrion },
    });
    return {
      page,
      totalPages,
      perPage,
      data: coins,
    };
  }

  // Create Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createCoin(coin: CreateCoinDto, userId: string): Promise<Coins> {
    const isUserExist = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!isUserExist) {
      throw new NotFoundException(`User with id: ${userId} not found`);
    }
    const avgPrice = Math.round((coin.spendMoney / coin.amount) * 100) / 100;
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
        isFiat: false,
        img: selectedCoin.image,
        avgPrice,
        user: { connect: { id: userId } },
      },
    });
  }

  // Get Coin By Id !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getCoinByCoinId(coinId: string, userId: string): Promise<Coins> {
    return this.prisma.coins.findFirst({ where: { coinId, userId } });
  }

  // Update Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateCoin(
    amount: number,
    avgPrice: number,
    spendMoney: number,
    id: string,
  ) {
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
    const listOfCoinId = coins.map((coin) => {
      if (!coin.isFiat) {
        return coin.coinId;
      } else {
        fiat += coin.amount;
      }
    });
    const coinMarkets = await CoingeckoService.getCoinMarkest(listOfCoinId);
    coins.forEach((coin) => {
      const market = coinMarkets.find((item) => item.id === coin.coinId);
      if (!market || coin.isFiat) {
        return;
      }
      balance += market.current_price * coin.amount;
      notFixedIncome += market.current_price * coin.amount - coin.spendMoney;
    });
    balance = +balance.toFixed(3);
    notFixedIncome = +notFixedIncome.toFixed(3);
    return { balance, notFixedIncome, fiat };
  }

  // Get UserCoins !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async getUsersCoins(userId: string): Promise<Coins[]> {
    return this.prisma.coins.findMany({ where: { userId } });
  }

  // Create fiat !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async createFiat(count: number, userId: string): Promise<Coins> {
    return this.prisma.coins.create({
      data: {
        amount: count,
        spendMoney: count,
        isFiat: true,
        symbol: '$',
        img: '',
        coinName: 'USD',
        coinId: FiatEnum.Dolar,
        avgPrice: 1,
        user: { connect: { id: userId } },
      },
    });
  }

  // Generate Where !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  generateWhere(userId: string, coinId: string): Prisma.CoinsWhereInput {
    const whereArr = [];
    whereArr.push({ userId });
    if (coinId) {
      whereArr.push({ coinId });
    }
    if (whereArr.length > 1) {
      return { AND: whereArr };
    }
    return { userId };
  }
}
