import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { OffersModule } from './offers/offers.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MessagesModule } from './messages/messages.module';
import { GeoModule } from './geo/geo.module';
import { AdminModule } from './admin/admin.module';
import { ContactController } from './contact/contact.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // dzięki temu process.env działa wszędzie
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      autoLoadEntities: true,
    }),
    UsersModule,
    OffersModule,
    ReviewsModule,
    MessagesModule,
    GeoModule,
    AdminModule,
  ],
  controllers: [ContactController], // 🔹 dodany kontroler do obsługi formularza kontaktowego
})
export class AppModule {}
