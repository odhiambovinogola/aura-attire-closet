-- Aura Attire Closet — Stage 6 schema (run in the Supabase SQL editor)
-- Single-admin model (Nash); create her user under Authentication -> Users.

create extension if not exists pgcrypto;

-- Categories (Shoes is a normal row here — built like every other category)
create table categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- Products. Colours/sizes are simple lists (matches the admin's structured fields).
create table products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  category_id uuid not null references categories(id),
  price_kes   integer not null check (price_kes >= 0),  -- whole shillings
  description text,                                     -- nullable: content gap, filled later
  colours     text[] not null default '{}',
  sizes       text[] not null default '{}',
  is_published boolean not null default true,
  is_featured  boolean not null default false,          -- drives Home "featured/new-in"
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Gallery images (stored in Storage; this table holds the references)
create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt         text,
  is_primary  boolean not null default false,           -- the card/thumbnail image
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Reviews. Moderated: only approved reviews show publicly.
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  author_name text not null,
  rating      int  not null check (rating between 1 and 5),
  body        text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

create index on products(category_id);
create index on product_images(product_id);
create index on reviews(product_id);

-- Row Level Security
alter table categories     enable row level security;
alter table products       enable row level security;
alter table product_images enable row level security;
alter table reviews        enable row level security;

-- Public read
create policy "read categories"        on categories     for select to anon, authenticated using (true);
create policy "read published products" on products       for select to anon, authenticated using (is_published);
create policy "read product images"    on product_images for select to anon, authenticated using (true);
create policy "read approved reviews"  on reviews        for select to anon, authenticated using (is_approved);

-- Public can submit a review, but only as unapproved
create policy "submit review" on reviews for insert to anon, authenticated with check (is_approved = false);

-- Admin (any logged-in user = Nash) manages everything
create policy "manage categories" on categories     for all to authenticated using (true) with check (true);
create policy "manage products"   on products       for all to authenticated using (true) with check (true);
create policy "manage images"     on product_images for all to authenticated using (true) with check (true);
create policy "manage reviews"    on reviews        for all to authenticated using (true) with check (true);

-- Storage bucket for product photos (public read)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');

-- Seed categories (full set incl. Shoes)
insert into categories (name, slug, sort_order) values
  ('Elegant Dresses', 'elegant-dresses', 1),
  ('Two-Piece Sets',  'two-piece-sets',  2),
  ('Jumpsuits',       'jumpsuits',       3),
  ('Sweater Tops',    'sweater-tops',    4),
  ('Jort Pants',      'jort-pants',      5),
  ('Bags',            'bags',            6),
  ('Shoes',           'shoes',           7);

-- Demo-cut seed: 4 real products from Nash's WhatsApp catalogue (Elegant Dresses).
-- Descriptions and sizes left blank on purpose — real content gap, filled at Build per the Brief.
insert into products (name, slug, category_id, price_kes, colours, sort_order) values
  ('Elegant Dress', 'elegant-dress',
    (select id from categories where slug = 'elegant-dresses'),
    2000, array['Pink', 'White', 'Black', 'Red', 'Yellow'], 1),
  ('Bodycon Dress', 'bodycon-dress',
    (select id from categories where slug = 'elegant-dresses'),
    1300, array['Black', 'White', 'Pink', 'Red', 'Brown'], 2),
  ('Backless Long Dress', 'backless-long-dress',
    (select id from categories where slug = 'elegant-dresses'),
    1600, array['Black', 'White', 'Brown'], 3),
  ('Halter Ruffle Maxi Dress', 'halter-ruffle-maxi-dress',
    (select id from categories where slug = 'elegant-dresses'),
    2500, array['Yellow', 'Purple', 'White', 'Pink'], 4);
