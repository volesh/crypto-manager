import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { envConfig } from 'src/general/configs/envConfig';
import { TransactionsModule } from '../transactions/transactions.module';
import { CoinsModule } from '../coins/coins.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TransactionsModule,
    CoinsModule,
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
  providers: [],
})
export class AppModule {}
