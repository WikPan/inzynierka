import { Controller, Get, Post, Param, Delete, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './messages.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getAll(): Promise<Message[]> {
    return this.messagesService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<Message>) {
    return this.messagesService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
