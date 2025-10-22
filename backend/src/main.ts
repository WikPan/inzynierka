import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';                            // ✅ DODANE
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ DODANE
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  // ✅ zmieniamy typ aplikacji na NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ konfiguracja CORS (jak było)
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ✅ udostępniamy katalog "uploads" jako statyczny (żeby można było oglądać zdjęcia)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
bootstrap();
