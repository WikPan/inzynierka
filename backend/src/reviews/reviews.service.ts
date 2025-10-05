import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './reviews.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
  ) {}

  create(data: Partial<Review>) {
    const review = this.reviewsRepo.create(data);
    return this.reviewsRepo.save(review);
  }

  findAll() {
    return this.reviewsRepo.find({ relations: ['user', 'offer'] });
  }

  findOne(id: string) {
    return this.reviewsRepo.findOne({ where: { id }, relations: ['user', 'offer'] });
  }

  async remove(id: string) {
    await this.reviewsRepo.delete(id);
    return { deleted: true };
  }
}
