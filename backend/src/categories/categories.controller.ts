import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll(
    @Query('listing_type_slug') listingTypeSlug?: string,
    @Query('listing_type_id') listingTypeId?: string,
  ) {
    return this.categoriesService.findAll(listingTypeSlug, listingTypeId);
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.categoriesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.categoriesService.update(id, body);
  }
}
