import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateListingDto {
  @IsUUID()
  @IsNotEmpty()
  listing_type_id: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsEmail()
  @IsNotEmpty()
  contact_email: string;

  @IsString()
  @IsNotEmpty()
  contact_phone: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  listing_price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  listing_price_label?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
