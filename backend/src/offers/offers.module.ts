import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { OfferImage } from './offer-image.entity';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, OfferImage])],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}
