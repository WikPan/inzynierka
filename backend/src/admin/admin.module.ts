import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/users.entity';
import { Offer } from '../offers/offer.entity';
import { Review } from '../reviews/reviews.entity';
import { MessagesModule } from '../messages/messages.module'; // ✅ dodaj to!

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Offer, Review]),
    MessagesModule, // ✅ tu włączasz serwis wiadomości
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
