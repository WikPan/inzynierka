import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Offer } from '../offers/offer.entity';
import { Review } from '../reviews/reviews.entity';
import { Message } from '../messages/messages.entity';

export type AccountType = 'admin' | 'user';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'USER' })
  accountType: 'USER' | 'ADMIN' | 'BLOCKED';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Offer, offer => offer.user)
  offers: Offer[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Message, msg => msg.fromUser)
  sentMessages: Message[];

  @OneToMany(() => Message, msg => msg.toUser)
  receivedMessages: Message[];

  // 🔑 metoda do sprawdzania hasła
  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}
