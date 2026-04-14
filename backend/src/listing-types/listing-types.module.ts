import { Module } from '@nestjs/common';
import { ListingTypesController } from './listing-types.controller';
import { ListingTypesService } from './listing-types.service';

@Module({
  controllers: [ListingTypesController],
  providers: [ListingTypesService],
})
export class ListingTypesModule {}
