-- ============================================================
-- HOMZY / FLASHROM - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- PREREQUISITE: The public.listings table must already exist
-- (created by the Expo app's initial migration).
-- Safe to re-run (uses IF NOT EXISTS and DROP POLICY IF EXISTS)
-- ============================================================

-- ============================================================
-- 0. TRIGGER FUNCTION for auto-updating updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc', now());
  return NEW;
end;
$$ language plpgsql;

-- ============================================================
-- 1. PROFILES TABLE (synced from Clerk)
-- ============================================================
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  clerk_user_id text unique not null,
  full_name text,
  email text,
  phone text,
  bio text default 'Love traveling and exploring new places.',
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Auto-update updated_at
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop policy if exists "Public read access on profiles" on public.profiles;
create policy "Public read access on profiles"
on public.profiles for select to anon using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert to anon with check (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update to anon using (true);

-- ============================================================
-- 2. BOOKINGS TABLE
-- ============================================================
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  clerk_user_id text not null,
  listing_id uuid references public.listings(id) on delete set null,
  listing_title text not null,
  listing_location text not null,
  listing_image text,
  listing_price integer not null,
  check_in_date text not null,
  check_out_date text not null,
  nights integer not null default 1,
  guests integer not null default 1,
  total_price integer not null,
  cleaning_fee integer default 2500,
  service_fee integer default 1500,
  status text not null default 'Upcoming' check (status in ('Upcoming', 'Completed', 'Cancelled')),
  guest_name text,
  guest_email text,
  guest_phone text,
  message_to_host text,
  payment_method text default 'card',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

-- Auto-update updated_at
drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.handle_updated_at();

drop policy if exists "Users can manage own bookings" on public.bookings;
create policy "Users can manage own bookings"
on public.bookings for all to authenticated 
using (clerk_user_id = (auth.jwt() ->> 'sub'))
with check (clerk_user_id = (auth.jwt() ->> 'sub'));

-- ============================================================
-- 3. FAVORITES TABLE
-- ============================================================
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  clerk_user_id text not null,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(clerk_user_id, listing_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Public access on favorites" on public.favorites;
create policy "Public access on favorites"
on public.favorites for all to anon using (true) with check (true);

-- ============================================================
-- 4. REVIEWS TABLE
-- ============================================================
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  clerk_user_id text not null,
  listing_id uuid references public.listings(id) on delete cascade,
  reviewer_name text not null,
  reviewer_avatar text,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(clerk_user_id, listing_id)
);

-- Idempotent unique index for reviews
do $$
begin
  if not exists (
    select 1 from pg_indexes where indexname = 'reviews_clerk_user_id_listing_id_key'
  ) then
    create unique index reviews_clerk_user_id_listing_id_key on public.reviews (clerk_user_id, listing_id);
  end if;
end $$;

alter table public.reviews enable row level security;

drop policy if exists "Public read access on reviews" on public.reviews;
create policy "Public read access on reviews"
on public.reviews for select to anon using (true);

drop policy if exists "Public insert on reviews" on public.reviews;
create policy "Public insert on reviews"
on public.reviews for insert to anon with check (true);

-- ============================================================
-- 5. ADD new columns to listings if not exist
-- ============================================================
alter table public.listings add column if not exists host_name text;
alter table public.listings add column if not exists host_image text default 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100';
alter table public.listings add column if not exists is_superhost boolean default false;
alter table public.listings add column if not exists max_guests integer default 4;
alter table public.listings add column if not exists amenities text[] default ARRAY['wifi', 'parking', 'kitchen', 'ac'];

-- Add unique constraint on title+location for idempotent seeding
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listings_title_location_key'
  ) then
    -- Clean up duplicates (keeping the one with the smallest UUID string)
    delete from public.listings a
    using (
      select (min(id::text))::uuid as keep_id, title, location
      from public.listings
      group by title, location
      having count(*) > 1
    ) b
    where a.title = b.title 
      and a.location = b.location 
      and a.id <> b.keep_id;

    alter table public.listings add constraint listings_title_location_key unique (title, location);
  end if;
end $$;

-- Add write policies for listings
drop policy if exists "Public insert on listings" on public.listings;
create policy "Public insert on listings"
on public.listings for insert to anon with check (true);

drop policy if exists "Public update on listings" on public.listings;
create policy "Public update on listings"
on public.listings for update to anon using (true);

drop policy if exists "Public delete on listings" on public.listings;
create policy "Public delete on listings"
on public.listings for delete to anon using (true);

-- ============================================================
-- 6. INSERT SAMPLE REVIEWS (only if none exist)
-- ============================================================
do $$
declare
  listing_ids uuid[];
  lid uuid;
  review_count integer;
begin
  select count(*) into review_count from public.reviews;
  
  if review_count = 0 then
    select array_agg(id) into listing_ids
    from (select id from public.listings order by id limit 10) as sub;
    
    if listing_ids is not null then
      foreach lid in array listing_ids[1:5]
      loop
        insert into public.reviews (clerk_user_id, listing_id, reviewer_name, reviewer_avatar, rating, comment)
        values 
          ('sample_user_1', lid, 'Ananya Sharma', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', 4.8, 'Absolutely stunning property! The views were breathtaking and the host was incredibly welcoming. Would definitely come back again.'),
          ('sample_user_2', lid, 'Raj Patel', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100', 4.5, 'Great location, clean and well-maintained. The kitchen was fully equipped. Perfect for a weekend getaway.'),
          ('sample_user_3', lid, 'Meera Krishnan', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', 5.0, 'This was hands down the best stay we''ve ever had. Everything from check-in to checkout was seamless. Highly recommend!'),
          ('sample_user_4', lid, 'Arjun Reddy', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', 4.2, 'Nice place but the WiFi was a bit slow. Location was fantastic though, and the host was very responsive.')
        on conflict (clerk_user_id, listing_id) do nothing;
      end loop;
    end if;
  end if;
end $$;

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
