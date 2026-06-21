# Aura Attire Closet

Storefront for **Aura Attire Closet** (Nash Mbula) — catalog browsing, cart, wishlist, reviews,
and order-via-WhatsApp. Installable as a PWA. Built with [Astro](https://astro.build) +
[Supabase](https://supabase.com), deployed on Cloudflare (Workers Builds, Git-integrated).

Project context, scope, and decisions live in the Brief (outside this repo, in the `/architect`
project memory) — this README only covers running, deploying, and structure.

## Stack

- **Astro** (server output) + `@astrojs/cloudflare` adapter
- **Tailwind v4** via `@tailwindcss/vite`
- **Supabase** — Postgres (products/categories/reviews/site settings), Storage (product images), Auth (admin)
- **nanostores** — cart and wishlist state
- PWA — installable, with offline-cached brand assets (`public/sw.js`, `public/manifest.webmanifest`)

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
| `npm run test` | Run the vitest suite |

## Deployment

Deployed via Cloudflare's Git-integrated Workers Builds — push to `main` and it rebuilds
automatically, no local deploy command needed.

- Bindings: `ASSETS` and `IMAGES` are auto-wired by the adapter; `SESSION` (KV namespace) must
  be created manually and bound.
- **Env vars must be set in two separate places** in the Cloudflare dashboard: the top-level
  "Variables and secrets" panel (runtime) *and* the one nested inside **Settings → Build**
  (build-time). Astro inlines `import.meta.env.PUBLIC_*` at build time, so the build-time panel
  is the one that actually matters for this code — missing it produces a silent
  `supabaseUrl is required` 500 error on every page.
- Supabase Auth → URL Configuration must allow-list the deployed domain with a wildcard
  (`https://your-domain/**`) for the password-reset redirect to work.

## Structure

```
src/
  lib/          Supabase clients, WhatsApp message builder, cart/wishlist stores,
                formatting/colour helpers, toast + confirm-dialog UI helpers
  layouts/      BaseLayout (header, footer, floating WhatsApp + install-app buttons)
  components/   Header, Footer, ProductCard, CategoryTabs, WhatsAppButton, InstallAppButton
  pages/
    index.astro              Home
    about.astro / contact.astro
    shop/index.astro          Category listing + search
    product/[slug].astro      Product detail — colour/size chips, quantity, add to bag
    cart.astro / wishlist.astro
    admin/                     Login (+ password reset), product CRUD, categories,
                                review moderation, site settings (hero/about copy + images, socials)
supabase/
  schema.sql    Tables, RLS, storage bucket, category + demo product seed
```

## Status

Stage 6 (Build) complete — storefront (catalog, cart, wishlist, reviews, WhatsApp ordering),
PWA install, and admin (product/category CRUD, review moderation, site settings, auth with
password reset) are all live and deployed. Heading into Stage 7 (QA).
