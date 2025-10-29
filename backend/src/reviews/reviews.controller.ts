import { Controller, Get, Post, Param, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './create-review.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Get('offer/:offerId')
  getForOffer(@Param('offerId') offerId: string) {
    return this.reviewsService.findByOffer(offerId);
  }

  @Get('offer/:offerId/stats')
  async getStats(@Param('offerId') offerId: string) {
    const s = await this.reviewsService.statsForOffer(offerId);
    return {
      sum: s.sum,
      avg: s.avg,
      avgRounded: s.avgRounded,
      ratingsCount: s.ratingsCount,
      reportsCount: s.reportsCount,
    };
  }
  
  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req: any, @Body() body: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post('report')
  async reportOffer(@Req() req: any, @Body() body: { offerId: string; comment?: string }) {
    // raporty = recenzje z 0 gwiazdek
    return this.reviewsService.create(req.user.id, {
      offerId: body.offerId,
      stars: 0,
      comment: body.comment ?? 'Zgłoszenie oferty przez użytkownika',
    });
  }

}
