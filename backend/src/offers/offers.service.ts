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
async removeFull(id: string, userId: string) {
  // 1️⃣ Pobierz ofertę wraz ze zdjęciami i użytkownikiem
  const offer = await this.offersRepo.findOne({
    where: { id },
    relations: ['images', 'user'],
  });

  if (!offer) throw new Error('Oferta nie istnieje.');
  if (offer.user.id !== userId) throw new Error('Brak uprawnień do usunięcia tej oferty.');

  // 2️⃣ Usuń wszystkie recenzje powiązane z ofertą
  const reviewRepo = this.offersRepo.manager.getRepository(Review);
  await reviewRepo.delete({ offer: { id } });

  // 3️⃣ Usuń zdjęcia z Cloudinary
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

      // 4️⃣ Usuń folder tylko jeśli mamy poprawny publicId
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

  // 5️⃣ Usuń rekordy obrazków z bazy
  const imageRepo = this.offersRepo.manager.getRepository(OfferImage);
  await imageRepo.delete({ offer: { id } });

  // 6️⃣ Usuń samą ofertę
  await this.offersRepo.delete(id);

  return { message: '✅ Oferta i wszystkie powiązane dane zostały usunięte.' };
}

}
