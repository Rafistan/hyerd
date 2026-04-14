import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ListingTypesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('listing_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabase.client
      .from('listing_types')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Listing type "${slug}" not found`);
    }

    return data;
  }

  async create(body: Record<string, any>) {
    const { data, error } = await this.supabase.client
      .from('listing_types')
      .insert(body)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, body: Record<string, any>) {
    const { data, error } = await this.supabase.client
      .from('listing_types')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
