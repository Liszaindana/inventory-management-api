import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter());
  
  // Daftarkan interceptor secara global di sini:
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`Inventory Management API berjalan di http://localhost:${port}`);
}

void bootstrap();