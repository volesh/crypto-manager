import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { envConfig } from './general/configs/envConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(envConfig.port);
}
bootstrap();
