import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';
import { Review } from '../reviews/reviews.entity';
import { OfferImage } from './offer-image.entity';

@Entity({ name: 'offers' })
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.offers, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal')
  prize: number;

  @Column()
  category: string;

  @Column()
  localisation: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OfferImage, img => img.offer, { cascade: true })
  images: OfferImage[];

  @OneToMany(() => Review, review => review.offer)
  reviews: Review[];
}
