import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
  ) {}

  create(data: Partial<Offer>) {
    const offer = this.offersRepo.create(data);
    return this.offersRepo.save(offer);
  }

  findAll() {
    return this.offersRepo.find({ relations: ['user', 'images', 'reviews'] });
  }

  findOne(id: string) {
    return this.offersRepo.findOne({
      where: { id },
      relations: ['user', 'images', 'reviews'],
    });
  }

  async remove(id: string) {
    await this.offersRepo.delete(id);
    return { deleted: true };
  }
}
