import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { PrismaService } from 'src/prisma.service';
import { Coins, Deposits, Prisma, User } from '@prisma/client';
import { PaginationResponseI } from 'src/general/interfaces/pagination/pagination.response.interface';
import { DepositsEnum } from 'src/general/enums/deposits.enum';
import { OrderEnum } from 'src/general/enums/order.enum';
import { CoinsService } from '../coins/coins.service';

@Injectable()
export class DepositsService {
  constructor(private readonly prisma: PrismaService, private readonly coinsService: CoinsService) {}

  // Create !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async create(createDepositDto: CreateDepositDto, id: string): Promise<Deposits> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
    if (!user.isInitialized) {
      throw new BadRequestException('User is not initialized');
    }
    let fiat = await this.prisma.coins.findFirst({
      where: { coinId: createDepositDto.code, userId: user.id },
    });
    if (!fiat && createDepositDto.status === DepositsEnum.Buy) {
      fiat = await this.coinsService.createFiat(createDepositDto, id);
    } else if ((!fiat || fiat.amount < createDepositDto.amount) && createDepositDto.status === DepositsEnum.Sell) {
      throw new BadRequestException(`In your balance less then ${createDepositDto.amount}`);
    }
    await this.updateData(createDepositDto, user, fiat);
    const data: Prisma.DepositsCreateInput = {
      ...createDepositDto,
      user: { connect: { id } },
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
  ): Promise<PaginationResponseI<Deposits>> {
    const where = this.generateWhere(userId, status);
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
      include: { user: true },
    });
    if (!deposit) {
      throw new NotFoundException(`Deposit with id ${id} not found`);
    }
    const fiat = await this.coinsService.getCoinByCoinId('usd', deposit.userId);
    if (!fiat) {
      throw new NotFoundException('Coin not found');
    }
    if (deposit.status === DepositsEnum.Buy) {
      if (fiat.amount < deposit.amount) {
        throw new BadRequestException(`You can't delete this deposit bacause in your balanse less then deposit amount`);
      } else {
        await this.coinsService.updateCoin(fiat.amount - deposit.amount, 1, fiat.spendMoney - deposit.amount, fiat.id);
        await this.prisma.user.update({
          where: { id: deposit.userId },
          data: { invested: deposit.user.invested - deposit.amount },
        });
      }
    } else {
      await this.coinsService.updateCoin(fiat.amount + deposit.amount, 1, fiat.spendMoney + deposit.amount, fiat.id);
      await this.prisma.user.update({
        where: { id: deposit.userId },
        data: {
          invested: deposit.user.invested + deposit.amount,
          withdraw: deposit.user.withdraw - deposit.amount,
        },
      });
    }
    return this.prisma.deposits.delete({ where: { id } });
  }

  // Generate where !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  generateWhere(userId: string, status: DepositsEnum) {
    const whereArr = [];
    whereArr.push({ userId });
    if (status) {
      whereArr.push({ status });
    }
    if (whereArr.length > 1) {
      return { AND: whereArr };
    }
    return { userId };
  }

  // Update User And Coin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async updateData(deposit: CreateDepositDto, user: User, fiat: Coins) {
    const promisesArr = [];
    const { price } = await this.prisma.fiat.findUnique({ where: { code: fiat.coinId } });
    const spendMoney = deposit.amount / price;
    if (deposit.status === DepositsEnum.Buy) {
      const userUpdate = this.prisma.user.update({
        where: { id: user.id },
        data: { invested: user.invested + spendMoney },
      });
      const avg = (fiat.spendMoney + spendMoney) / (fiat.amount + deposit.amount);
      const fiatUpdate = this.coinsService.updateCoin(fiat.amount + deposit.amount, avg, fiat.spendMoney + spendMoney, fiat.id);

      promisesArr.push(userUpdate);
      promisesArr.push(fiatUpdate);
    } else {
      const withdraw = user.withdraw + spendMoney;
      const userUpdate = this.prisma.user.update({
        where: { id: user.id },
        data: {
          withdraw,
        },
      });
      const fiatUpdate = this.coinsService.updateCoin(
        fiat.amount - deposit.amount,
        fiat.avgPrice,
        fiat.spendMoney - spendMoney,
        fiat.id,
      );
      promisesArr.push(userUpdate);
      promisesArr.push(fiatUpdate);
    }
    await Promise.all(promisesArr);
  }
}
