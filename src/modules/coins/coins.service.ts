import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCoinDto } from './dto/create.coin.dto';
import { PrismaService } from 'src/prisma.service';
import { Coins } from '@prisma/client';
import { CoingeckoService } from 'src/coingecko/coingecko.service';

@Injectable()
export class CoinsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCoin(coin: CreateCoinDto, userId: string): Promise<Coins> {
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
        img: selectedCoin.image,
        avgPrice,
        user: { connect: { id: userId } },
      },
    });
  }

  async calculateCryptoBalance(userId) {
    let balance = 0;
    let notFixedIncome = 0;
    const coins = await this.getUsersCoins(userId);
    if (!coins) {
      return { balance, notFixedIncome };
    }
    const listOfCoinId = coins.map((coin) => coin.coinId);
    const coinMarkets = await CoingeckoService.getCoinMarkest(listOfCoinId);
    coins.forEach((coin) => {
      const market = coinMarkets.find((item) => item.id === coin.coinId);
      if (!market) {
        return 'No info';
      }
      balance += market.current_price * coin.amount;
      notFixedIncome += market.current_price * coin.amount - coin.spendMoney;
    });
    balance = +balance.toFixed(3);
    notFixedIncome = +notFixedIncome.toFixed(3);
    return { balance, notFixedIncome };
  }

  async getUsersCoins(userId): Promise<Coins[]> {
    return this.prisma.coins.findMany({ where: { userId } });
  }
}
