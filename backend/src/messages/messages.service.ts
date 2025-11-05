import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(data: { fromUserId: string; toUserId: string; offerId: string; content: string }) {
    const fromUser = await this.usersRepo.findOne({ where: { id: data.fromUserId } });
    const toUser = await this.usersRepo.findOne({ where: { id: data.toUserId } });
    const offer = await this.offersRepo.findOne({ where: { id: data.offerId } });

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

  findAll() {
    return this.messagesRepo.find({
      relations: ['fromUser', 'toUser', 'offer'],
    });
  }

  findOne(id: string) {
    return this.messagesRepo.findOne({
      where: { id },
      relations: ['fromUser', 'toUser', 'offer'],
    });
  }

  async findByOffer(offerId: string) {
    return this.messagesRepo.find({
      where: { offer: { id: offerId } },
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string) {
    await this.messagesRepo.delete(id);
    return { deleted: true };
  }
}
