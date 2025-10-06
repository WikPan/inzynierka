
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Włączenie CORS dla frontendu hostowanego na hoście
  app.enableCors({
    origin: ['http://localhost:5173'], // frontend Vite
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // jeśli używasz cookies
  });

  console.log('CORS enabled for http://localhost:5173');

  await app.listen(3000);
}
bootstrap();
