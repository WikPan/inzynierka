import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/users.entity';
import { Offer } from '../offers/offer.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sentMessages, { onDelete: 'CASCADE' })
  fromUser: User;

  @ManyToOne(() => User, user => user.receivedMessages, { onDelete: 'CASCADE' })
  toUser: User;

  @ManyToOne(() => Offer, offer => offer.messages, { onDelete: 'CASCADE' })
  offer: Offer; // 🆕 powiązanie wiadomości z ofertą

  @Column('text')
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
