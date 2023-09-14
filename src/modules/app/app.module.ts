import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';

import { TokensSchedule } from '../../cronJobs/tokens.cronjobs';
import { WalletSchedule } from '../../cronJobs/wallet.cronjobs';
import { envConfig } from '../../general/configs';
import { TokensHelper } from '../../general/helpers';
import { PrismaService } from '../../prisma.service';
// import { ExchangeService } from '../../services/coingecko/exchange.service';
import { AuthModule } from '../auth/auth.module';
import { CoinsModule } from '../coins/coins.module';
import { CoinsService } from '../coins/coins.service';
import { WalletValuesModule } from '../daily-volume/daily-volume.module';
import { DepositsModule } from '../deposits/deposits.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { WalletsModule } from '../wallets/wallets.module';
import { WalletsService } from '../wallets/wallets.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TransactionsModule,
    CoinsModule,
    WalletValuesModule,
    DepositsModule,
    WalletsModule,
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
  providers: [PrismaService, CoinsService, WalletsService, UserService, TokensHelper, JwtService, TokensSchedule, WalletSchedule],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}
  async onApplicationBootstrap() {
    // const fiats = await this.prisma.fiat.findMany();
    // const exchange = await ExchangeService.getFiatList('USD');
    // for (const fiat of fiats) {
    //   const price = exchange.conversion_rates[fiat.code];
    //   if (price) {
    //     await this.prisma.fiat.update({ where: { code: fiat.code }, data: { price } });
    //   }
    // }
    // eslint-disable-next-line no-console
    console.log('Exchange rates loaded successful');
  }
}
