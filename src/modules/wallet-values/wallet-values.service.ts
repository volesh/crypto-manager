import { BadRequestException, Injectable } from '@nestjs/common';
import { WalletValues } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletValuesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    fromDate: string,
    toDate: string,
  ): Promise<WalletValues[]> {
    let where: any = { userId };
    if (fromDate && toDate) {
      const from = new Date(`${fromDate}T00:00:00.000Z`);
      const to = new Date(`${toDate}T00:00:00.000Z`);
      if (isNaN(from.getDate()) || isNaN(to.getDate())) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      where = {
        AND: [{ userId }, { createdAt: { gte: from, lte: to } }],
      };
    } else if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00.000Z`);
      if (isNaN(from.getDate())) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      where = {
        AND: [{ userId }, { createdAt: { gte: from } }],
      };
    } else if (toDate) {
      const to = new Date(`${toDate}T00:00:00.000Z`);
      if (isNaN(to.getDate())) {
        throw new BadRequestException('Date should be in yyyy-mm-dd format');
      }
      where = {
        AND: [{ userId }, { createdAt: { lte: to } }],
      };
    }
    return this.prisma.walletValues.findMany({ where });
  }
}
