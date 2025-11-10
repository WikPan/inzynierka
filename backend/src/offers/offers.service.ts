import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { OfferImage } from './offer-image.entity';
import cloudinary from 'src/cloudinary/cloudinary.provider';
import { Review } from '../reviews/reviews.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepo: Repository<Offer>,

    @InjectRepository(OfferImage)
    private imageRepo: Repository<OfferImage>,
  ) {}

  // 🔹 Zwraca ofertę z powiązanymi zdjęciami
  async findOne(id: string) {
    return this.offersRepo.findOne({
      where: { id },
      relations: ['images', 'user'],
    });
  }

  // 🔹 Zapisuje zdjęcia powiązane z ofertą
  async saveImages(images: OfferImage[]) {
    return this.imageRepo.save(images);
  }

  // 🔹 Tworzy nową ofertę (z automatycznym geokodowaniem)
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
      blocked: false, // ✅ nowe oferty zawsze aktywne
    });

    return this.offersRepo.save(offer);
  }

  // 🔹 Wszystkie oferty (tylko aktywne i od niezablokowanych użytkowników)
  findAll() {
    return this.offersRepo.find({
      where: { blocked: false }, // ✅ ukrywa zablokowane
      relations: ['images', 'user'],
      order: { id: 'DESC' },
    });
  }

  // 🔹 Usuwanie oferty
  async remove(id: string) {
    await this.offersRepo.delete(id);
    return { deleted: true };
  }

  // 🔹 Oferty konkretnego użytkownika
  async findByUser(userId: string) {
    return this.offersRepo.find({
      where: { user: { id: userId } },
      relations: ['images', 'user'],
      order: { id: 'DESC' },
    });
  }

  // 🔹 Usuwanie oferty z powiązanymi danymi
  async removeFull(id: string, userId: string) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: ['images', 'user'],
    });

    if (!offer) throw new Error('Oferta nie istnieje.');
    if (offer.user.id !== userId)
      throw new Error('Brak uprawnień do usunięcia tej oferty.');

    const reviewRepo = this.offersRepo.manager.getRepository(Review);
    await reviewRepo.delete({ offer: { id } });

    if (offer.images && offer.images.length > 0) {
      const publicIds = offer.images
        .map((img) => img.publicId)
        .filter((id): id is string => typeof id === 'string' && id.trim() !== '');

      if (publicIds.length > 0) {
        try {
          await cloudinary.api.delete_resources(publicIds);
        } catch (err: any) {
          console.warn('⚠️ Błąd podczas usuwania zdjęć z Cloudinary:', err.message);
        }

        const firstPublicId = offer.images[0]?.publicId;
        if (firstPublicId) {
          try {
            const folderPath = firstPublicId.split('/').slice(0, -1).join('/');
            await cloudinary.api.delete_folder(folderPath);
          } catch (err: any) {
            console.warn('⚠️ Błąd podczas usuwania folderu Cloudinary:', err.message);
          }
        }
      }
    }

    const imageRepo = this.offersRepo.manager.getRepository(OfferImage);
    await imageRepo.delete({ offer: { id } });
    await this.offersRepo.delete(id);

    return { message: '✅ Oferta i wszystkie powiązane dane zostały usunięte.' };
  }

  // 🔹 Wyszukiwanie ofert — tu filtrujemy zablokowane
  async searchOffers(filters: {
    title?: string;
    category?: string;
    localisation?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const query = this.offersRepo
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.images', 'images')
      .leftJoinAndSelect('offer.user', 'user')
      .where('offer.blocked = false') // ✅ nie pokazuj zablokowanych ofert
      .andWhere('user.accountType != :blocked', { blocked: 'BLOCKED' }); // ✅ nie pokazuj ofert zablokowanych użytkowników

    if (filters.title) {
      query.andWhere('LOWER(offer.title) LIKE :title', {
        title: `%${filters.title.toLowerCase()}%`,
      });
    }

    if (
      filters.category &&
      typeof filters.category === 'string' &&
      filters.category.trim() !== ''
    ) {
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

    return query.getMany();
  }

  // 🔹 Sugestie tytułów — też pomijamy zablokowane
  async suggestTitles(q: string): Promise<{ title: string }[]> {
    return this.offersRepo
      .createQueryBuilder('offer')
      .select('DISTINCT offer.title', 'title')
      .leftJoin('offer.user', 'user')
      .where('offer.blocked = false') // ✅ nie pokazuj zablokowanych
      .andWhere('user.accountType != :blocked', { blocked: 'BLOCKED' }) // ✅ ukryj oferty od zbanowanych
      .andWhere('LOWER(offer.title) LIKE :q', { q: `%${q.toLowerCase()}%` })
      .limit(5)
      .getRawMany();
  }
}
