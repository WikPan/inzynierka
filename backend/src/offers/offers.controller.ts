import { Controller, Get, Post, Param, Delete, Body } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './offer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  getAll(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    const { userId, title, description, prize, category, localisation } = body;

    // 👇 Pobieramy użytkownika po ID
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    // 👇 Tworzymy ofertę z przypisanym użytkownikiem
    const offer = {
      title,
      description,
      prize,
      category,
      localisation,
      user, // pełny obiekt User
    };

    return this.offersService.create(offer);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
