// reviews/reviews.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './reviews.entity';
import { CreateReviewDto } from './create-review.dto';
import { Offer } from '../offers/offer.entity';
import { User } from '../users/users.entity';

type OfferStats = {
  sum: number;
  avg: number | null;
  avgRounded: number | null;
  ratingsCount: number;
  reportsCount: number;
};

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

async create(userId: string, dto: CreateReviewDto) {
  const offer = await this.offersRepo.findOne({ where: { id: dto.offerId } });
  if (!offer) throw new NotFoundException('Offer not found');

  const user = await this.usersRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

    const review = new Review();
    review.user = user;
    review.offer = offer;
    review.stars = dto.stars;
    if (dto.comment) review.comment = dto.comment.trim();
    return this.reviewsRepo.save(review);
}


  findAll() {
    return this.reviewsRepo.find({ relations: ['user', 'offer'] });
  }

  findOne(id: string) {
    return this.reviewsRepo.findOne({ where: { id }, relations: ['user', 'offer'] });
  }

  findByOffer(offerId: string) {
    return this.reviewsRepo.find({
      where: { offer: { id: offerId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Liczy wszystko "na żywo" w SQL:
   * - średnia z ocen 1–5
   * - 0 traktowane jako zgłoszenie
   * - średnia zaokrąglana do 0.5
   */
async statsForOffer(offerId: string): Promise<OfferStats> {
  const qb = this.reviewsRepo
    .createQueryBuilder('r')
    .select('COALESCE(SUM(CASE WHEN r.stars > 0 THEN r.stars ELSE 0 END), 0)', 'sum')
    .addSelect('AVG(NULLIF(CASE WHEN r.stars > 0 THEN r.stars END, NULL))', 'avg')
    .addSelect('COALESCE(COUNT(CASE WHEN r.stars > 0 THEN 1 END), 0)', 'ratingsCount')
    .addSelect('COALESCE(COUNT(CASE WHEN r.stars = 0 THEN 1 END), 0)', 'reportsCount')
    .where('r.offer = :offerId', { offerId });

  const row = await qb.getRawOne();

  const avg = row.avg ? Number(row.avg) : null;
  const avgRounded = avg === null ? null : Math.round(avg * 2) / 2;

  return {
    sum: Number(row.sum ?? 0),
    avg,
    avgRounded,
    ratingsCount: Number(row.ratingsCount ?? 0),
    reportsCount: Number(row.reportsCount ?? 0),
  };
}

  async remove(id: string) {
    await this.reviewsRepo.delete(id);
    return { deleted: true };
  }
}
