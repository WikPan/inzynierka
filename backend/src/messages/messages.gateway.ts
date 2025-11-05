import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // Twój frontend React
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // 🔹 logi połączeń (pomocne w debugowaniu)
  handleConnection(client: Socket) {
    console.log('🔌 Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Client disconnected:', client.id);
  }

  // 🔹 odbieranie wiadomości od klienta i wysyłanie dalej
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    body: { fromUserId: string; toUserId: string; offerId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const msg = await this.messagesService.create(body);

      // 🔥 Emitujemy wiadomość do odbiorcy (np. message:123)
      this.server.emit(`message:${body.toUserId}`, msg);

      // 🔹 Można też odesłać wiadomość z potwierdzeniem do nadawcy
      client.emit('messageSent', msg);

      return msg;
    } catch (err) {
      console.error('❌ Błąd przy wysyłaniu wiadomości:', err);
      client.emit('errorMessage', 'Nie udało się wysłać wiadomości.');
    }
  }
}
