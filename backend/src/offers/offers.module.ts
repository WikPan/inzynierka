import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from './offer.entity';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, User])], // 👈 tu dodaliśmy User
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
