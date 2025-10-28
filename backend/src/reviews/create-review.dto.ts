import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  offerId: string;

  // 0..5; 0 = zgłoszenie
  @IsInt()
  @Min(0)
  @Max(5)
  stars: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
