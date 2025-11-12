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

  // 👥 Lista WSZYSTKICH użytkowników (zlicza zgłoszenia)
  async getAllUsers() {
    const users = await this.usersRepo.find();
    const reported = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('offer.userId', 'userId')
      .addSelect('COUNT(*)', 'reportsCount')
      .where('review.stars = 0')
      .leftJoin('review.offer', 'offer')
      .groupBy('offer.userId')
      .getRawMany();

    const map = new Map(reported.map(r => [r.userId, Number(r.reportsCount)]));

    return users.map(u => ({
      ...u,
      reportsCount: map.get(u.id) || 0,
    }));
  }

  // 📦 Lista WSZYSTKICH ofert (zlicza zgłoszenia)
  async getAllOffers() {
    const offers = await this.offersRepo.find({ relations: ['user'] });
    const reported = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('review.offerId', 'offerId')
      .addSelect('COUNT(*)', 'reportsCount')
      .where('review.stars = 0')
      .groupBy('review.offerId')
      .getRawMany();

    const map = new Map(reported.map(r => [r.offerId, Number(r.reportsCount)]));

    return offers.map(o => ({
      ...o,
      reportsCount: map.get(o.id) || 0,
    }));
  }

  // 👥 Tylko użytkownicy ze zgłoszeniami
  async getReportedUsers() {
    const all = await this.getAllUsers();
    return all.filter(u => u.reportsCount > 0);
  }

  // 📦 Tylko oferty ze zgłoszeniami
  async getReportedOffers() {
    const all = await this.getAllOffers();
    return all.filter(o => o.reportsCount > 0);
  }

  // 🚫 Zablokuj użytkownika
  async blockUser(id: string, adminId?: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Nie znaleziono użytkownika.');

    user.accountType = 'BLOCKED';
    await this.usersRepo.save(user);
    return { message: `Użytkownik ${user.login} został zablokowany.` };
  }

  // 🔓 Odblokuj użytkownika
  async unblockUser(id: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Nie znaleziono użytkownika.');

    user.accountType = 'USER';
    await this.usersRepo.save(user);
    return { message: `Użytkownik ${user.login} został odblokowany.` };
  }

  // ❌ Usuń użytkownika
  async deleteUser(id: string, adminId?: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Nie znaleziono użytkownika.');

    await this.usersRepo.delete(id);
    return { message: `Użytkownik ${user.login} został usunięty.` };
  }

  // 🚫 Zablokuj ofertę
  async blockOffer(id: string, adminId: string) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!offer) throw new NotFoundException('Nie znaleziono oferty.');

    offer.blocked = true;
    await this.offersRepo.save(offer);

    await this.messagesService.create({
      fromUserId: adminId,
      toUserId: offer.user.id,
      offerId: offer.id,
      content: `Twoja oferta "${offer.title}" została zablokowana przez administratora.`,
    });

    return { message: `Oferta "${offer.title}" została zablokowana.` };
  }

  // 🔓 Odblokuj ofertę
  async unblockOffer(id: string, adminId: string) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!offer) throw new NotFoundException('Nie znaleziono oferty.');

    offer.blocked = false;
    await this.offersRepo.save(offer);

    await this.messagesService.create({
      fromUserId: adminId,
      toUserId: offer.user.id,
      offerId: offer.id,
      content: `Twoja oferta "${offer.title}" została odblokowana przez administratora.`,
    });

    return { message: `Oferta "${offer.title}" została odblokowana.` };
  }

  // ❌ Usuń ofertę
  async deleteOffer(id: string, adminId: string) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!offer) throw new NotFoundException('Nie znaleziono oferty.');

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
