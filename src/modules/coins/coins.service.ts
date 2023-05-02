import { Injectable } from '@nestjs/common';
import { CreateCoinDto } from './dto/create.coin.dto';
import { PrismaService } from 'src/prisma.service';
import { Coins } from '@prisma/client';

@Injectable()
export class CoinsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCoin(coin: CreateCoinDto, userId: string): Promise<Coins> {
    const avgPrice = Math.round((coin.spendMoney / coin.amount) * 100) / 100;
    return this.prisma.coins.create({
      data: {
        ...coin,
        avgPrice,
        userId,
      },
    });
  }

  async getUsersCoins(userId): Promise<Coins[]> {
    return this.prisma.coins.findMany({ where: { userId } });
  }
}
