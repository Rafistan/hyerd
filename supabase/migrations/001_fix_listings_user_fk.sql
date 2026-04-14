-- Fix: change listings.user_id FK from auth.users → public.profiles
-- This allows PostgREST to discover the relationship and join profiles data.
-- Safe because every auth.users row has a corresponding public.profiles row (via trigger).

ALTER TABLE public.listings DROP CONSTRAINT listings_user_id_fkey;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
