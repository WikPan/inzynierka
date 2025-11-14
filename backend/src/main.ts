import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';   // ✅ DODANE
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  // 🔹 Tworzymy aplikację jako Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🔹 Włączamy CORS (żeby frontend mógł łączyć się z backendem)
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 🔹 Walidacja DTO — wymaga class-validator i class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // ❌ odrzuca pola, które nie są w DTO
      forbidNonWhitelisted: true,   // ❌ rzuca błąd, jeśli przyjdzie nieznane pole
      transform: true,              // ✅ automatycznie konwertuje typy (np. string → number)
    }),
  );

  // 🔹 Udostępnianie katalogu "uploads" jako statyczny (np. dla zdjęć)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3000);
  console.log('🚀 Backend działa na http://localhost:3000');
}
bootstrap();
