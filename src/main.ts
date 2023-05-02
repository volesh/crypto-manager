import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { envConfig } from './general/configs/envConfig';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(envConfig.port);
}
bootstrap();
