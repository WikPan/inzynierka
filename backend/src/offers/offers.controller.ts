import { Controller, Get, Post, Param, Delete, Body } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './offer.entity';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  getAll(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<Offer>) {
    return this.offersService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
