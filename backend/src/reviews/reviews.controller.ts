import { Controller, Get, Post, Param, Delete, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './reviews.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getAll(): Promise<Review[]> {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<Review>) {
    return this.reviewsService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
