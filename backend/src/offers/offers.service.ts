import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { OfferImage } from './offer-image.entity';

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
      relations: ['images'],
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

    // Jeśli użytkownik nie podał współrzędnych — spróbuj pobrać z OpenStreetMap
    if ((!latitude || !longitude) && data.localisation) {
      try {
        const query = encodeURIComponent(data.localisation);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pl&q=${query}`,
          {
            headers: { 'User-Agent': 'InzynierkaApp/1.0 (kontakt@example.com)' },
          },
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
    });

    return this.offersRepo.save(offer);
  }

  // 🔹 Wszystkie oferty
  findAll() {
    return this.offersRepo.find({
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

  
}
