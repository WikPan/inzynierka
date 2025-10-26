// src/offers/offer-image.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Offer } from './offer.entity';

@Entity({ name: 'offer_images' })
export class OfferImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Offer, (offer) => offer.images, { onDelete: 'CASCADE' })
  offer: Offer;

  @Column()
  url: string;

  // 🔹 Dodane pole na identyfikator z Cloudinary
  @Column({ nullable: true })
  publicId?: string;
}
