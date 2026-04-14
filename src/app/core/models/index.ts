// ─────────────────────────────────────────
// New unified models (Supabase-backed)
// ─────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingType {
  id: string;
  slug: string;
  label: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  listing_type_id: string;
  slug: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  listing_types?: Pick<ListingType, 'id' | 'slug' | 'label'>;
}

export interface Listing {
  id: string;
  user_id: string;
  listing_type_id: string;
  category_id?: string;
  title: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  listing_price?: number;
  listing_price_label?: string;
  status: 'active' | 'pending' | 'expired' | 'suspended';
  metadata: Record<string, any>;
  images: string[];
  tags: string[];
  view_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Joined relations (present when fetched with select joins)
  listing_types?: ListingType;
  categories?: Category;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export interface CreateListingPayload {
  listing_type_id: string;
  category_id?: string;
  title: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  listing_price?: number;
  listing_price_label?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ListingsResponse {
  data: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListingQueryParams {
  user_id?: string;
  listing_type_slug?: string;
  listing_type_id?: string;
  category_id?: string;
  city?: string;
  search?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────
// Legacy models — kept for reference during migration
// ─────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: Date;
  listings?: string[];
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}
