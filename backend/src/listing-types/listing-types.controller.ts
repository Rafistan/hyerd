import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ListingTypesService } from './listing-types.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('listing-types')
export class ListingTypesController {
  constructor(private readonly listingTypesService: ListingTypesService) {}

  @Public()
  @Get()
  findAll() {
    return this.listingTypesService.findAll();
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.listingTypesService.findBySlug(slug);
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.listingTypesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.listingTypesService.update(id, body);
  }
}
