import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { envConfig } from './general/configs/envConfig';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Crypto Manager')
    .setDescription('Crypro Manager API Documentation')
    .setVersion('1.0.0')
    .addTag('crypto')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  await app.listen(envConfig.port);
}
bootstrap();
