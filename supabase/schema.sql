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

-- Full-catalogue seed (2026-06-19): remaining 19 products re-extracted directly from the
-- WhatsApp catalogue screenshots in catalogue-screenshots/ (not previously saved as structured
-- data anywhere). Descriptions and sizes left blank on purpose, same as the demo-cut seed.
-- Two catalogue line items ("Elegant dinner dress", "Free size dress") had no visible price in
-- the screenshots and are NOT seeded — price_kes is NOT NULL, so they need a real price from Nash
-- before they can be added. Jort Pants and Shoes have zero catalogue items (same empty-category
-- pattern already flagged for Shoes in the Brief — now also true of Jort Pants).
insert into products (name, slug, category_id, price_kes, colours, sort_order) values
  ('Ruffled High-Low Corset Dress', 'ruffled-high-low-corset-dress',
    (select id from categories where slug = 'elegant-dresses'),
    2700, array['White', 'Mint Green', 'Sage', 'Burgundy'], 5),
  ('Halter-Neck Open-Back Dress', 'halter-neck-open-back-dress',
    (select id from categories where slug = 'elegant-dresses'),
    2500, array['Pink', 'Blue', 'Brown Cheetah Print'], 6),
  ('Halter Neck Ruffle Tiered Mini Dress', 'halter-neck-ruffle-tiered-mini-dress',
    (select id from categories where slug = 'elegant-dresses'),
    1800, array['Black', 'White', 'Orange', 'Blue', 'Brown', 'Red'], 7),
  ('Ruffled Mini Dress (Zara)', 'ruffled-mini-dress-zara',
    (select id from categories where slug = 'elegant-dresses'),
    1800, array['White', 'Black', 'Blue', 'Hot Pink', 'Orange'], 8),
  ('Floral Tiered Halter Mini', 'floral-tiered-halter-mini',
    (select id from categories where slug = 'elegant-dresses'),
    1800, array['Coral Orange Floral', 'Vibrant Floral'], 9),
  ('Open-Back Flow Maxi', 'open-back-flow-maxi',
    (select id from categories where slug = 'elegant-dresses'),
    1500, array['Black', 'Pink', 'Burgundy', 'Blue'], 10),
  ('Halter Ruffle Pleated Midi Dress', 'halter-ruffle-pleated-midi-dress',
    (select id from categories where slug = 'elegant-dresses'),
    2000, array[]::text[], 11),
  ('Floral Print Dress', 'floral-print-dress',
    (select id from categories where slug = 'elegant-dresses'),
    1500, array[]::text[], 12),
  ('Women''s Corset Bodysuit', 'womens-corset-bodysuit',
    (select id from categories where slug = 'sweater-tops'),
    1600, array['Black', 'White', 'Red', 'Beige'], 1),
  ('Two-Piece Set (Classic)', 'two-piece-set-classic',
    (select id from categories where slug = 'two-piece-sets'),
    1500, array['Black', 'White', 'Red', 'Brown'], 1),
  ('Two-Piece Set (Burgundy)', 'two-piece-set-burgundy',
    (select id from categories where slug = 'two-piece-sets'),
    2000, array['Black', 'Red', 'Burgundy', 'Grey'], 2),
  ('Cropped Zip-Up Hoodie Set', 'cropped-zip-up-hoodie-set',
    (select id from categories where slug = 'two-piece-sets'),
    1800, array['Black', 'Grey', 'Green', 'Brown'], 3),
  ('Two-Piece Set (Monochrome)', 'two-piece-set-mono',
    (select id from categories where slug = 'two-piece-sets'),
    1500, array['Black', 'White'], 4),
  ('Two-Piece Suit Set', 'two-piece-suit-set',
    (select id from categories where slug = 'two-piece-sets'),
    2500, array[]::text[], 5),
  ('Jumpsuit (Black)', 'jumpsuit-black',
    (select id from categories where slug = 'jumpsuits'),
    2000, array['Black'], 1),
  ('Jumpsuit (Black & Burgundy)', 'jumpsuit-black-burgundy',
    (select id from categories where slug = 'jumpsuits'),
    2000, array['Black', 'Burgundy'], 2),
  ('Free Size Jumpsuit', 'free-size-jumpsuit',
    (select id from categories where slug = 'jumpsuits'),
    2000, array[]::text[], 3),
  ('Woven Shoulder Bag (Brown)', 'woven-shoulder-bag-brown',
    (select id from categories where slug = 'bags'),
    1400, array['Dark Brown', 'Black', 'Amber Brown', 'Olive Green'], 1),
  ('Woven Shoulder Bag (Beige)', 'woven-shoulder-bag-beige',
    (select id from categories where slug = 'bags'),
    1400, array['Black', 'Olive Green', 'Grey', 'Amber Brown'], 2);

-- Site settings (2026-06-21 addition): a single editable row backing the hero/about copy,
-- hero/about image overrides, and social links — previously hardcoded and duplicated across
-- Home/About/Contact/Footer. NOTE: this is the only new block in this file as of this addition —
-- run just this "site_settings" section against the live project (NOT the whole schema.sql,
-- which is a from-scratch bootstrap and isn't safe to re-run against an already-seeded DB).
create table site_settings (
  id              smallint primary key default 1 check (id = 1),  -- singleton row
  hero_tagline    text not null default 'One closet, endless OOTD''s.',
  hero_subcopy    text not null default 'Elegant dresses, sets, jumpsuits, bags and shoes — I personally curate every piece. Pick your colour and size, then message me directly on WhatsApp.',
  about_body      text not null default 'I''m Nash, and Aura Attire Closet is my Nairobi-based closet of elegant dresses, two-piece sets, jumpsuits, bags and shoes — curating since 2024, with customers all across Kenya, not just Nairobi.

Every piece is picked with one idea in mind: an endless wardrobe of outfits-of-the-day for the woman who wants to feel put together without overthinking it. I personally select each item, and you can chat with me directly about sizing, styling, or anything else before you order.

Aura Attire Closet started on WhatsApp and social media, and that personal, message-me-directly feel carries through here — browse the shop, pick your colour and size, and send your order straight to me.',
  instagram_url   text not null default 'https://instagram.com/aura_attire_closet',
  facebook_url    text not null default 'https://facebook.com/StyleWithnash',
  tiktok_url      text not null default '#',
  shop_address    text,                  -- nullable: no confirmed public physical address yet
  maps_url        text not null default '#', -- placeholder until Nash supplies a real Google Maps link
  hero_image_path text,  -- nullable: null = auto-pick a featured product photo, as before
  about_image_path text, -- nullable: same auto-pick fallback
  updated_at      timestamptz not null default now()
);

alter table site_settings enable row level security;
create policy "read site settings"   on site_settings for select to anon, authenticated using (true);
create policy "manage site settings" on site_settings for all    to authenticated using (true) with check (true);

insert into site_settings (id) values (1) on conflict (id) do nothing;
