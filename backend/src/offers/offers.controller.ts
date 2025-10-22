import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Delete, 
  Body, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './offer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { AuthGuard } from 'src/auth/auth.guard';

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

    // 🔹 Oferty zalogowanego użytkownika
  @UseGuards(AuthGuard)
  @Get('my')
  async getMyOffers(@Request() req) {
    return this.offersService.findByUser(req.user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

@UseGuards(AuthGuard)
@Post()
async create(@Body() body: any, @Request() req) {
  const { title, description, prize, category, localisation, latitude, longitude } = body;

  const user = await this.userRepository.findOne({ where: { id: req.user.id } });
  if (!user) throw new Error(`User with id ${req.user.id} not found`);

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


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
