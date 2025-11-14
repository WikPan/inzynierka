import { IsOptional, IsString, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  localisation?: string;

  @IsOptional()
  @IsNumber()
  prize?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  blocked?: boolean;
}
