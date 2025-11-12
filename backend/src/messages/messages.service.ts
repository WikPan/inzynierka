import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './messages.entity';
import { Offer } from '../offers/offer.entity';
import { User } from '../users/users.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
  ) {}

  async create(data: {
    fromUserId: string;
    toUserId: string;
    offerId: string;
    content: string;
  }) {
    const fromUser = await this.usersRepo.findOne({
      where: { id: data.fromUserId },
    });
    const toUser = await this.usersRepo.findOne({
      where: { id: data.toUserId },
    });
    const offer = await this.offersRepo.findOne({
      where: { id: data.offerId },
    });

    if (!fromUser || !toUser || !offer) {
      throw new NotFoundException('Nie znaleziono użytkownika lub oferty');
    }

    const msg = this.messagesRepo.create({
      fromUser,
      toUser,
      offer,
      content: data.content,
    });

    return this.messagesRepo.save(msg);
  }

  // 📨 Wszystkie wiadomości danego użytkownika
  async findUserMessages(userId: string) {
    return this.messagesRepo.find({
      where: [
        { fromUser: { id: userId } },
        { toUser: { id: userId } },
      ],
      relations: ['fromUser', 'toUser', 'offer'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.messagesRepo.findOne({
      where: { id },
      relations: ['fromUser', 'toUser', 'offer'],
    });
  }

  // 📨 Wiadomości w obrębie oferty, tylko jeśli user uczestniczy
  async findByOfferForUser(offerId: string, userId: string) {
    const messages = await this.messagesRepo.find({
      where: { offer: { id: offerId } },
      relations: ['fromUser', 'toUser', 'offer'],
      order: { createdAt: 'ASC' },
    });

    // Sprawdzamy czy user jest częścią tej konwersacji
    const userMessages = messages.filter(
      (msg) => msg.fromUser.id === userId || msg.toUser.id === userId,
    );

    if (userMessages.length === 0 && messages.length > 0) {
      throw new ForbiddenException('Nie masz dostępu do tej rozmowy.');
    }

    return userMessages;
  }

  async remove(id: string) {
    await this.messagesRepo.delete(id);
    return { deleted: true };
  }
}
