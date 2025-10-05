import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './messages.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
  ) {}

  create(data: Partial<Message>) {
    const msg = this.messagesRepo.create(data);
    return this.messagesRepo.save(msg);
  }

  findAll() {
    return this.messagesRepo.find({ relations: ['fromUser', 'toUser'] });
  }

  findOne(id: string) {
    return this.messagesRepo.findOne({ where: { id }, relations: ['fromUser', 'toUser'] });
  }

  async remove(id: string) {
    await this.messagesRepo.delete(id);
    return { deleted: true };
  }
}
