import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(dto: QueryListingsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const status = dto.status ?? 'active';

    let listingTypeId = dto.listing_type_id;

    // Resolve slug to ID if needed
    if (dto.listing_type_slug && !listingTypeId) {
      const { data: lt } = await this.supabase.client
        .from('listing_types')
        .select('id')
        .eq('slug', dto.listing_type_slug)
        .single();
      listingTypeId = lt?.id;
    }

    let query = this.supabase.client
      .from('listings')
      .select(
        '*, listing_types(id, slug, label, icon), categories(id, slug, label), profiles(id, full_name, avatar_url)',
        { count: 'exact' },
      )
      .eq('status', status)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (dto.user_id) {
      query = query.eq('user_id', dto.user_id);
    }

    if (listingTypeId) {
      query = query.eq('listing_type_id', listingTypeId);
    }

    if (dto.category_id) {
      query = query.eq('category_id', dto.category_id);
    }

    if (dto.city) {
      query = query.ilike('city', `%${dto.city}%`);
    }

    if (dto.search) {
      query = query.or(
        `title.ilike.%${dto.search}%,description.ilike.%${dto.search}%`,
      );
    }

    if (dto.min_price !== undefined) {
      query = query.gte('listing_price', dto.min_price);
    }

    if (dto.max_price !== undefined) {
      query = query.lte('listing_price', dto.max_price);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('listings')
      .select(
        '*, listing_types(id, slug, label, icon), categories(id, slug, label), profiles(id, full_name, avatar_url)',
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Listing not found');
    }

    // Increment view count (fire-and-forget)
    this.supabase.client
      .from('listings')
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq('id', id)
      .then(() => {});

    return data;
  }

  async findMy(userId: string) {
    const { data, error } = await this.supabase.client
      .from('listings')
      .select(
        '*, listing_types(id, slug, label, icon), categories(id, slug, label)',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async create(dto: CreateListingDto, userId: string) {
    const { data, error } = await this.supabase.client
      .from('listings')
      .insert({
        ...dto,
        user_id: userId,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateListingDto, userId: string) {
    const existing = await this.verifyOwnership(id, userId);

    const { data, error } = await this.supabase.client
      .from('listings')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string, userId: string) {
    await this.verifyOwnership(id, userId);

    const { error } = await this.supabase.client
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  private async verifyOwnership(id: string, userId: string) {
    const { data, error } = await this.supabase.client
      .from('listings')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Listing not found');
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }

    return data;
  }
}
