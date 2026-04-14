-- ============================================================
-- Hyerd — Supabase Schema
-- Run this entire file in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  bio         TEXT,
  city        TEXT,
  phone       TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"  ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update_own"     ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. LISTING TYPES  (top-level categories)
-- ─────────────────────────────────────────
CREATE TABLE public.listing_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT NOT NULL UNIQUE,
  label               TEXT NOT NULL,
  description         TEXT,
  icon                TEXT,
  sort_order          INT NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  monthly_fee_cents   INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_types_select_public" ON public.listing_types FOR SELECT USING (TRUE);
-- INSERT/UPDATE/DELETE only via service role key (NestJS) — no authenticated user policy needed

-- ─────────────────────────────────────────
-- 3. CATEGORIES  (subcategories per type)
-- ─────────────────────────────────────────
CREATE TABLE public.categories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type_id  UUID NOT NULL REFERENCES public.listing_types(id) ON DELETE CASCADE,
  slug             TEXT NOT NULL,
  label            TEXT NOT NULL,
  sort_order       INT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_type_id, slug)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public" ON public.categories FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────
-- 4. LISTINGS  (unified ads table)
-- ─────────────────────────────────────────
CREATE TABLE public.listings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_type_id      UUID NOT NULL REFERENCES public.listing_types(id),
  category_id          UUID REFERENCES public.categories(id),
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  contact_email        TEXT NOT NULL,
  contact_phone        TEXT NOT NULL,
  city                 TEXT NOT NULL,
  listing_price        NUMERIC(12, 2),
  listing_price_label  TEXT,
  status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'pending', 'expired', 'suspended')),
  metadata             JSONB NOT NULL DEFAULT '{}',
  images               TEXT[] NOT NULL DEFAULT '{}',
  tags                 TEXT[] NOT NULL DEFAULT '{}',
  view_count           INT NOT NULL DEFAULT 0,
  expires_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_listings_listing_type_id ON public.listings (listing_type_id);
CREATE INDEX idx_listings_category_id     ON public.listings (category_id);
CREATE INDEX idx_listings_user_id         ON public.listings (user_id);
CREATE INDEX idx_listings_status          ON public.listings (status);
CREATE INDEX idx_listings_city            ON public.listings (city);
CREATE INDEX idx_listings_created_at      ON public.listings (created_at DESC);
CREATE INDEX idx_listings_metadata        ON public.listings USING GIN (metadata);
CREATE INDEX idx_listings_tags            ON public.listings USING GIN (tags);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public can see active listings
CREATE POLICY "listings_select_active"
  ON public.listings FOR SELECT
  USING (status = 'active');

-- Owners can see all their own listings regardless of status
CREATE POLICY "listings_select_own"
  ON public.listings FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own listings
CREATE POLICY "listings_insert_own"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update their own listings
CREATE POLICY "listings_update_own"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Owners can delete their own listings
CREATE POLICY "listings_delete_own"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on any update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- SEED DATA
-- ============================================================

-- Listing Types
INSERT INTO public.listing_types (slug, label, description, icon, sort_order, monthly_fee_cents) VALUES
  ('businesses', 'Businesses',  'Local Armenian businesses and services',        'bi-shop',           1, 1999),
  ('jobs',        'Jobs',        'Job listings and employment opportunities',     'bi-briefcase',      2,  999),
  ('housing',     'Housing',     'Apartments, houses, and rooms for rent or sale','bi-house',         3,  999),
  ('cars',        'Cars',        'Cars and vehicles for sale',                    'bi-car-front',      4,  799),
  ('events',      'Events',      'Community events, gatherings, and activities',  'bi-calendar-event', 5,  499),
  ('marketplace', 'Marketplace', 'Buy and sell anything in the community',        'bi-bag',            6,  499);

-- Categories (using CTE to resolve slugs → IDs cleanly)
WITH lt AS (
  SELECT id, slug FROM public.listing_types
)
INSERT INTO public.categories (listing_type_id, slug, label, sort_order)
SELECT lt.id, c.slug, c.label, c.sort_order
FROM lt
JOIN (VALUES
  -- Businesses
  ('businesses', 'restaurant',   'Restaurant & Food',    1),
  ('businesses', 'legal',        'Legal Services',       2),
  ('businesses', 'auto',         'Auto Services',        3),
  ('businesses', 'medical',      'Medical & Health',     4),
  ('businesses', 'beauty',       'Beauty & Wellness',    5),
  ('businesses', 'tech',         'Technology',           6),
  ('businesses', 'education',    'Education',            7),
  ('businesses', 'financial',    'Financial Services',   8),
  -- Jobs
  ('jobs', 'technology',     'Technology',       1),
  ('jobs', 'hospitality',    'Hospitality',      2),
  ('jobs', 'legal',          'Legal',            3),
  ('jobs', 'healthcare',     'Healthcare',       4),
  ('jobs', 'beauty',         'Beauty',           5),
  ('jobs', 'automotive',     'Automotive',       6),
  ('jobs', 'education',      'Education',        7),
  ('jobs', 'other',          'Other',            8),
  -- Housing
  ('housing', 'apartment', 'Apartment', 1),
  ('housing', 'house',     'House',     2),
  ('housing', 'condo',     'Condo',     3),
  ('housing', 'room',      'Room',      4),
  -- Events
  ('events', 'cultural',   'Cultural',   1),
  ('events', 'education',  'Education',  2),
  ('events', 'business',   'Business',   3),
  ('events', 'recreation', 'Recreation', 4),
  ('events', 'charity',    'Charity',    5),
  ('events', 'social',     'Social',     6),
  -- Marketplace
  ('marketplace', 'home',        'Home & Garden',   1),
  ('marketplace', 'furniture',   'Furniture',       2),
  ('marketplace', 'electronics', 'Electronics',     3),
  ('marketplace', 'music',       'Music',           4),
  ('marketplace', 'sports',      'Sports & Fitness',5),
  ('marketplace', 'clothing',    'Clothing',        6)
  -- Cars has no subcategories initially
) AS c(listing_type_slug, slug, label, sort_order)
ON lt.slug = c.listing_type_slug;
