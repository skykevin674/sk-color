import { enableProdMode } from '@angular/core';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { Logger } from '@nestjs/common';

enableProdMode();

async function bootstrap() {

  const app = await NestFactory.create(ApplicationModule);
  app.setGlobalPrefix('api');
  await app.listen(4000);
}
bootstrap();
