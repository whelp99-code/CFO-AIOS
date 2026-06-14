import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);

  Logger.log(`🚀 CFO API listening on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
