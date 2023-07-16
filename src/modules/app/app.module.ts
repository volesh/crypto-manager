import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { TokensSchedule } from 'src/cronJobs/tokens.cronjobs';
import { WalletSchedule } from 'src/cronJobs/wallet.cronjobs';
import { envConfig } from 'src/general/configs';
import { TokensHelper } from 'src/general/helpers';
import { PrismaService } from 'src/prisma.service';

// import { ExchangeService } from 'src/services/coingecko/exchange.service';
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
// import { ExchangeService } from 'src/services/coingecko/exchange.service';

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
  providers: [TokensSchedule, PrismaService, WalletSchedule, CoinsService, WalletsService, UserService, TokensHelper, JwtService],
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
    // console.log('Exchange rates loaded successful');
  }
}
