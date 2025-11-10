import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { Offer } from '../offers/offer.entity';
import { Review } from '../reviews/reviews.entity';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @InjectRepository(Offer)
    private readonly offersRepo: Repository<Offer>,

    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,

    private readonly messagesService: MessagesService,
  ) {}

  // 👥 Lista użytkowników z raportami (recenzje z 0 gwiazdek)
  async getReportedUsers() {
    const users = await this.usersRepo.find();
    const reportedUsers: any[] = [];

    for (const user of users) {
      const reportsCount = await this.reviewsRepo.count({
        where: { stars: 0, offer: { user: { id: user.id } } },
        relations: ['offer', 'offer.user'],
      });

      if (reportsCount > 0) {
        reportedUsers.push({ ...user, reportsCount });
      }
    }

    return reportedUsers;
  }

  // 📦 Lista ofert, które dostały negatywne recenzje
  async getReportedOffers() {
    const offers = await this.offersRepo.find({ relations: ['user'] });
    const reportedOffers: any[] = [];

    for (const offer of offers) {
      const reportsCount = await this.reviewsRepo.count({
        where: { stars: 0, offer: { id: offer.id } },
        relations: ['offer'],
      });

      if (reportsCount > 0) {
        reportedOffers.push({ ...offer, reportsCount });
      }
    }

    return reportedOffers;
  }

  // 🚫 Zablokuj użytkownika
  async blockUser(id: string, adminId?: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Nie znaleziono użytkownika.');

    user.accountType = 'BLOCKED';
    await this.usersRepo.save(user);

    return { message: `Użytkownik ${user.login} został zablokowany.` };
  }

  // ❌ Usuń użytkownika
  async deleteUser(id: string, adminId?: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Nie znaleziono użytkownika.');

    await this.usersRepo.delete(id);
    return { message: `Użytkownik ${user.login} został usunięty.` };
  }

  // 🚫 Zablokuj ofertę (z automatyczną wiadomością do właściciela)
  async blockOffer(id: string, adminId: string) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!offer) throw new NotFoundException('Nie znaleziono oferty.');

    offer.blocked = true; // musisz mieć pole `blocked: boolean` w encji Offer
    await this.offersRepo.save(offer);

    // ✉️ automatyczna wiadomość
    await this.messagesService.create({
      fromUserId: adminId,
      toUserId: offer.user.id,
      offerId: offer.id,
      content: `Twoja oferta "${offer.title}" została zablokowana przez administratora.`,
    });

    return { message: `Oferta "${offer.title}" została zablokowana.` };
  }

  // ❌ Usuń ofertę (z automatyczną wiadomością do właściciela)
  async deleteOffer(id: string, adminId: string) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!offer) throw new NotFoundException('Nie znaleziono oferty.');

    // ✉️ automatyczna wiadomość
    await this.messagesService.create({
      fromUserId: adminId,
      toUserId: offer.user.id,
      offerId: offer.id,
      content: `Twoja oferta "${offer.title}" została usunięta przez administratora.`,
    });

    await this.offersRepo.delete(id);
    return { message: `Oferta "${offer.title}" została usunięta.` };
  }
}
