import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';

import { PrismaService } from '../prisma.service';

@Injectable()
export class TokensSchedule {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async removeExpiredTokens() {
    const monthAgo = moment().subtract(1, 'month').toISOString();

    await this.prisma.tokens.deleteMany({
      where: { createdAt: { lte: monthAgo } },
    });

    console.log('Expired tones deleted');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async removeOldActionTokens() {
    const dayAgo = moment().subtract(1, 'day').toISOString();
    await this.prisma.actionTokens.deleteMany({
      where: { createdAt: { lte: dayAgo } },
    });
    console.log('Action tokens deleted');
  }
}
