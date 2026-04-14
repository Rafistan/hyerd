import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(listingTypeSlug?: string, listingTypeId?: string) {
    let query = this.supabase.client
      .from('categories')
      .select('*, listing_types(id, slug, label)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (listingTypeId) {
      query = query.eq('listing_type_id', listingTypeId);
    } else if (listingTypeSlug) {
      // Resolve slug to ID via subquery
      const { data: lt } = await this.supabase.client
        .from('listing_types')
        .select('id')
        .eq('slug', listingTypeSlug)
        .single();

      if (lt) {
        query = query.eq('listing_type_id', lt.id);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('categories')
      .select('*, listing_types(id, slug, label)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }

  async create(body: Record<string, any>) {
    const { data, error } = await this.supabase.client
      .from('categories')
      .insert(body)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, body: Record<string, any>) {
    const { data, error } = await this.supabase.client
      .from('categories')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
