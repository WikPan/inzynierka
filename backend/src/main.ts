import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // <- konieczne dla React
  // Włącz CORS dla frontendu
  app.enableCors({
    origin: 'http://localhost:5173', // port frontendu Vite
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000); // backend na porcie 3000
}
bootstrap();
