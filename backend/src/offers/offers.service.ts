import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { OfferImage } from './offer-image.entity';
import cloudinary from 'src/cloudinary/cloudinary.provider';
import { Review } from '../reviews/reviews.entity';
import { UpdateOfferDto } from './update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepo: Repository<Offer>,

    @InjectRepository(OfferImage)
    private imageRepo: Repository<OfferImage>,
  ) {}

  // 🔹 Pobranie jednej oferty
  async findOne(id: string) {
    return this.offersRepo.findOne({
      where: { id },
      relations: ['images', 'user'],
    });
  }

  // 🔹 Zapis zdjęć
  async saveImages(images: OfferImage[]) {
    return this.imageRepo.save(images);
  }

  // 🔹 Tworzenie nowej oferty
  async create(data: Partial<Offer>) {
    let latitude = data.latitude;
    let longitude = data.longitude;

    if ((!latitude || !longitude) && data.localisation) {
      try {
        const query = encodeURIComponent(data.localisation);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pl&q=${query}`,
          { headers: { 'User-Agent': 'InzynierkaApp/1.0 (kontakt@example.com)' } },
        );
        const results = (await response.json()) as any[];
        if (Array.isArray(results) && results.length > 0) {
          latitude = parseFloat(results[0].lat);
          longitude = parseFloat(results[0].lon);
        }
      } catch (err) {
        console.error('❌ Błąd geokodowania:', err);
      }
    }

    const offer = this.offersRepo.create({
      ...data,
      latitude,
      longitude,
      blocked: false,
    });

    return this.offersRepo.save(offer);
  }

  // 🔹 Edycja oferty
  async update(id: string, userId: string, dto: UpdateOfferDto) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!offer) throw new BadRequestException('Oferta nie istnieje.');
    if (offer.user.id !== userId)
      throw new BadRequestException('Brak uprawnień do edycji tej oferty.');

    let latitude = dto.latitude ?? offer.latitude;
    let longitude = dto.longitude ?? offer.longitude;

    // Automatyczne geokodowanie przy zmianie lokalizacji
    if (dto.localisation && (dto.latitude == null || dto.longitude == null)) {
      try {
        const query = encodeURIComponent(dto.localisation);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pl&q=${query}`,
          { headers: { 'User-Agent': 'InzynierkaApp/1.0 (kontakt@example.com)' } },
        );
        const results = (await response.json()) as any[];
        if (Array.isArray(results) && results.length > 0) {
          latitude = parseFloat(results[0].lat);
          longitude = parseFloat(results[0].lon);
        }
      } catch (err) {
        console.error('❌ Błąd geokodowania:', err);
      }
    }

    Object.assign(offer, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.localisation !== undefined && { localisation: dto.localisation }),
      ...(dto.prize !== undefined && { prize: dto.prize }),
      latitude,
      longitude,
    });

    return this.offersRepo.save(offer);
  }

  // 🔹 Wszystkie aktywne oferty
  findAll() {
    return this.offersRepo.find({
      where: { blocked: false },
      relations: ['images', 'user'],
      order: { id: 'DESC' },
    });
  }

  // 🔹 Oferty użytkownika
  async findByUser(userId: string) {
    return this.offersRepo.find({
      where: { user: { id: userId } },
      relations: ['images', 'user'],
      order: { id: 'DESC' },
    });
  }

  // 🔹 Proste usuwanie
  async remove(id: string) {
    await this.offersRepo.delete(id);
    return { deleted: true };
  }

  // 🔹 Usuwanie oferty z obrazkami i recenzjami
  async removeFull(id: string, userId: string) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['images', 'user'],
    });

    if (!offer) throw new BadRequestException('Oferta nie istnieje.');
    if (offer.user.id !== userId)
      throw new BadRequestException('Brak uprawnień do usunięcia tej oferty.');

    const reviewRepo = this.offersRepo.manager.getRepository(Review);
    await reviewRepo.delete({ offer: { id } });

    // 🧹 Usuń zdjęcia z Cloudinary
    if (offer.images && offer.images.length > 0) {
      const publicIds = offer.images
        .map((img) => img.publicId)
        .filter((id): id is string => !!id);

      if (publicIds.length > 0) {
        try {
          await cloudinary.api.delete_resources(publicIds);
        } catch (err: any) {
          console.warn('⚠️ Błąd usuwania zdjęć z Cloudinary:', err.message);
        }

        const firstPublicId = offer.images[0]?.publicId;
        if (firstPublicId) {
          const folderPath = firstPublicId.split('/').slice(0, -1).join('/');
          try {
            await cloudinary.api.delete_folder(folderPath);
          } catch (err: any) {
            console.warn('⚠️ Błąd usuwania folderu:', err.message);
          }
        }
      }
    }

    const imageRepo = this.offersRepo.manager.getRepository(OfferImage);
    await imageRepo.delete({ offer: { id } });
    await this.offersRepo.delete(id);

    return { message: '✅ Oferta i dane powiązane zostały usunięte.' };
  }

  // 🔹 Wyszukiwanie ofert
  async searchOffers(filters: {
    title?: string;
    category?: string;
    localisation?: string;
    minPrice?: number;
    maxPrice?: number;
    lat?: number;
    lon?: number;
  }) {
    const query = this.offersRepo
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.images', 'images')
      .leftJoinAndSelect('offer.user', 'user')
      .where('offer.blocked = false')
      .andWhere('user.accountType != :blocked', { blocked: 'BLOCKED' });

    if (filters.title) {
      query.andWhere('LOWER(offer.title) LIKE :title', {
        title: `%${filters.title.toLowerCase()}%`,
      });
    }

    if (filters.category && filters.category.trim() !== '') {
      query.andWhere('LOWER(offer.category) LIKE :category', {
        category: `%${filters.category.toLowerCase()}%`,
      });
    }

    if (filters.localisation) {
      query.andWhere('LOWER(offer.localisation) LIKE :loc', {
        loc: `%${filters.localisation.toLowerCase()}%`,
      });
    }

    if (filters.minPrice !== undefined) {
      query.andWhere('offer.prize >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('offer.prize <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.lat && filters.lon) {
      query
        .andWhere('offer.latitude IS NOT NULL AND offer.longitude IS NOT NULL')
        .addSelect(
          `(6371 * acos(
            cos(radians(:lat)) * cos(radians(offer.latitude)) *
            cos(radians(offer.longitude) - radians(:lon)) +
            sin(radians(:lat)) * sin(radians(offer.latitude))
          ))`,
          'distance',
        )
        .setParameters({ lat: filters.lat, lon: filters.lon })
        .orderBy('distance', 'ASC');
    } else {
      query.orderBy('offer.id', 'DESC');
    }

    return query.getMany();
  }

  // 🔹 Sugestie tytułów
  async suggestTitles(q: string): Promise<{ title: string }[]> {
    return this.offersRepo
      .createQueryBuilder('offer')
      .select('DISTINCT offer.title', 'title')
      .leftJoin('offer.user', 'user')
      .where('offer.blocked = false')
      .andWhere('user.accountType != :blocked', { blocked: 'BLOCKED' })
      .andWhere('LOWER(offer.title) LIKE :q', { q: `%${q.toLowerCase()}%` })
      .limit(5)
      .getRawMany();
  }
}
