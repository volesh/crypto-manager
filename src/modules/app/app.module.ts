import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { envConfig } from 'src/general/configs/envConfig';
import { TransactionsModule } from '../transactions/transactions.module';
import { CoinsModule } from '../coins/coins.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { TokensSchedule } from 'src/cronJobs/tokens.cronjobs';
import { WalletSchedule } from 'src/cronJobs/wallet.cronjobs';
import { CoinsService } from '../coins/coins.service';
import { WalletValuesModule } from '../wallet-values/wallet-values.module';
import { DepositsModule } from '../deposits/deposits.module';

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
export class AppModule {}
