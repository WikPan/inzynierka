import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/users.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sentMessages, { onDelete: 'CASCADE' })
  fromUser: User;

  @ManyToOne(() => User, user => user.receivedMessages, { onDelete: 'CASCADE' })
  toUser: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
