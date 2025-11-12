import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './messages.entity';
import { AuthGuard } from '../auth/auth.guard'; // 👈 używamy autoryzacji

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // 🔹 Wiadomości zalogowanego użytkownika
  @Get()
  async getUserMessages(@Request() req): Promise<Message[]> {
    const userId = req.user.id;
    return this.messagesService.findUserMessages(userId);
  }

  // 🔹 Wiadomości po ofercie (tylko jeśli user uczestniczy w rozmowie)
  @Get('/offer/:offerId')
  async getByOffer(@Param('offerId') offerId: string, @Request() req) {
    const userId = req.user.id;
    return this.messagesService.findByOfferForUser(offerId, userId);
  }

  // 🔹 Utworzenie nowej wiadomości
  @Post()
  create(
    @Body()
    body: {
      fromUserId: string;
      toUserId: string;
      offerId: string;
      content: string;
    },
  ) {
    return this.messagesService.create(body);
  }

  // 🔹 (opcjonalne) pobranie konkretnej wiadomości
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  // 🔹 Usunięcie wiadomości (raczej admin/debug)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
