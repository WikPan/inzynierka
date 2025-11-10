// src/offers/offers.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './offer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import cloudinary from 'src/cloudinary/cloudinary.provider';
import { OfferImage } from './offer-image.entity';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 🔹 Pobranie wszystkich ofert (dla debugowania, może zostać)
  @Get()
  getAll(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  // 🔹 Wyszukiwanie ofert — tu backend sam odfiltruje zablokowane
  @Get('search')
  async searchOffers(
    @Query('title') title?: string,
    @Query('category') category?: string,
    @Query('localisation') localisation?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<Offer[]> {
    return this.offersService.searchOffers({
      title,
      category,
      localisation,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  // 🔹 Sugestie tytułów ofert
  @Get('suggest-titles')
  async suggestTitles(@Query('q') q: string) {
    if (!q || q.length < 2) return [];
    return this.offersService.suggestTitles(q);
  }

  // 🔹 Oferty zalogowanego użytkownika
  @UseGuards(AuthGuard)
  @Get('my')
  async getMyOffers(@Request() req) {
    return this.offersService.findByUser(req.user.id);
  }

  // 🔹 Pojedyncza oferta po ID
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  // 🔹 Tworzenie oferty
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: any, @Request() req) {
    const {
      title,
      description,
      prize,
      category,
      localisation,
      latitude,
      longitude,
    } = body;

    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });
    if (!user) throw new Error(`User with id ${req.user.id} not found`);

    // 🛑 Blokada — użytkownik zablokowany nie może tworzyć ofert
    if (user.accountType === 'BLOCKED') {
      throw new BadRequestException('Twoje konto jest zablokowane. Nie możesz dodawać ofert.');
    }

    const offer = {
      title,
      description,
      prize,
      category,
      localisation,
      latitude,
      longitude,
      user,
    };

    return this.offersService.create(offer);
  }

  // 🔹 Usuwanie oferty (proste)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }

  // 🔹 Upload maks. 3 zdjęć do oferty
  @UseGuards(AuthGuard)
  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('files', 3))
  async uploadOfferImages(
    @Param('id') offerId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nie przesłano żadnych plików.');
    }

    const offer = await this.offersService.findOne(offerId);
    if (!offer) throw new BadRequestException('Nie znaleziono oferty.');

    const username = req.user.username || 'unknown_user';
    const folderPath = `inzynierka/${username}/offers/${offer.title}`;

    const uploadPromises = files.map(
      (file) =>
        new Promise<OfferImage>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: folderPath },
            async (error, result) => {
              if (error || !result)
                return reject(error || new Error('Upload failed'));

              const newImage = new OfferImage();
              newImage.url = result.secure_url;
              newImage.publicId = result.public_id;
              newImage.offer = offer;

              resolve(newImage);
            },
          );
          stream.end(file.buffer);
        }),
    );

    const uploadedImages = await Promise.all(uploadPromises);
    await this.offersService.saveImages(uploadedImages);

    return {
      message: '✅ Zdjęcia zostały przesłane pomyślnie!',
      images: uploadedImages.map((img) => img.url),
    };
  }

  // 🔹 Usuwanie oferty wraz z obrazkami i recenzjami
  @UseGuards(AuthGuard)
  @Delete(':id/full')
  async removeFull(@Param('id') id: string, @Request() req) {
    return this.offersService.removeFull(id, req.user.id);
  }
}
