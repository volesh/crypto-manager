import { FiatEnum } from './../../general/enums/fiat.enam';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { PrismaService } from 'src/prisma.service';
import { Coins, Deposits, Prisma, User } from '@prisma/client';
import { PaginationResponseI } from 'src/general/interfaces/pagination/pagination.response.interface';
import { DepositsEnum } from 'src/general/enums/deposits.enum';
import { OrderEnum } from 'src/general/enums/order.enum';
import { CoinsService } from '../coins/coins.service';

@Injectable()
export class DepositsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coinsService: CoinsService,
  ) {}

  // Create !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  async create(
    createDepositDto: CreateDepositDto,
    id: string,
  ): Promise<Deposits> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
    let fiat = await this.prisma.coins.findFirst({
      where: { coinId: FiatEnum.Dolar },
    });
    if (!fiat && createDepositDto.status) {
      fiat = await this.coinsService.createFiat(createDepositDto.amount, id);
    } else if (!fiat && createDepositDto.status) {
      throw new BadRequestException(
        `In your balance less then ${createDepositDto.amount}`,
      );
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
      orderBy: { amount: orderDirecrion },
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
    const isExist = await this.prisma.deposits.findUnique({ where: { id } });
    if (!isExist) {
      throw new NotFoundException('Not found');
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
    if (deposit.status === DepositsEnum.Buy) {
      const userUpdate = this.prisma.user.update({
        where: { id: user.id },
        data: { invested: user.invested + deposit.amount },
      });
      const fiatUpdate = this.coinsService.updateCoin(
        fiat.amount + deposit.amount,
        1,
        fiat.spendMoney + deposit.amount,
        fiat.id,
      );
      promisesArr.push(userUpdate);
      promisesArr.push(fiatUpdate);
    } else {
      const userUpdate = this.prisma.user.update({
        where: { id: user.id },
        data: { invested: user.invested - deposit.amount },
      });
      const fiatUpdate = this.coinsService.updateCoin(
        fiat.amount - deposit.amount,
        1,
        fiat.spendMoney - deposit.amount,
        fiat.id,
      );
      promisesArr.push(userUpdate);
      promisesArr.push(fiatUpdate);
    }
    await Promise.all(promisesArr);
  }
}
