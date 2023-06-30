import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { TokensSchedule } from 'src/cronJobs/tokens.cronjobs';
import { WalletSchedule } from 'src/cronJobs/wallet.cronjobs';
import { envConfig } from 'src/general/configs';
import { PrismaService } from 'src/prisma.service';
import { ExchangeService } from 'src/services/coingecko/exchange.service';

import { AuthModule } from '../auth/auth.module';
import { CoinsModule } from '../coins/coins.module';
import { CoinsService } from '../coins/coins.service';
import { DepositsModule } from '../deposits/deposits.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { UserModule } from '../user/user.module';
import { WalletValuesModule } from '../wallet-values/wallet-values.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TransactionsModule,
    CoinsModule,
    WalletValuesModule,
    DepositsModule,
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: envConfig.admin_email,
          pass: envConfig.email_password,
        },
      },
    }),
  ],
  providers: [TokensSchedule, PrismaService, WalletSchedule, CoinsService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}
  async onApplicationBootstrap() {
    const fiats = await this.prisma.fiat.findMany();
    const exchange = await ExchangeService.getFiatList('USD');
    for (const fiat of fiats) {
      const price = exchange.conversion_rates[fiat.code];
      if (price) {
        await this.prisma.fiat.update({ where: { code: fiat.code }, data: { price } });
      }
    }
    console.log('Exchange rates loaded successful');
  }
}
