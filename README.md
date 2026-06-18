# Aura Attire Closet

Storefront for **Aura Attire Closet** (Nash Mbula) — catalog browsing, colour/size/quantity
selection, and order-via-WhatsApp. Built with [Astro](https://astro.build) + [Supabase](https://supabase.com),
deployed on Cloudflare Pages.

Project context, scope, and decisions live in the Brief and Stage 6 kickoff doc (outside this
repo, in the `/architect` project memory) — this README only covers running and structure.

## Stack

- **Astro** (server output) + `@astrojs/cloudflare` adapter
- **Tailwind v4** via `@tailwindcss/vite`
- **Supabase** — Postgres (products/categories/reviews), Storage (product images), Auth (admin)
- **nanostores** — cart state (added when the multi-step cart is built)

## Setup

```sh
npm install
cp .env.example .env   # fill in real values, see below
npm run dev
```

### Environment variables (`.env`)

| Key | Notes |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Safe to expose; RLS protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, never exposed to the client |
| `PUBLIC_WHATSAPP_NUMBER` | Nash's WhatsApp Business number, digits only, international format |

### Database

Run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL editor — creates
tables, RLS policies, the `product-images` storage bucket, and seeds categories + a handful of
real demo products.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Local dev server at `localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npx astro check` | Type-check `.astro`/`.ts` files |

## Structure

```
src/
  lib/          Supabase clients, WhatsApp message builder, formatting/colour helpers
  layouts/      BaseLayout (header, footer, floating WhatsApp button)
  components/   Header, Footer, ProductCard, CategoryTabs, WhatsAppButton
  pages/
    index.astro          Home (placeholder — full version not yet built)
    shop/index.astro      Category listing
    product/[slug].astro  Product detail — colour/size chips, quantity, order action
supabase/
  schema.sql    Tables, RLS, storage bucket, category + demo product seed
```

## Status

Stage 6 (Build) — demo cut complete: shop + product detail + single-item order-via-WhatsApp
are live. Full multi-step cart, reviews, and the admin (product CRUD) are still to come.
