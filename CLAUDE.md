# Aura Attire Closet

Storefront (catalog, order-via-WhatsApp) for a clothing seller. Astro (server output) + Supabase + Tailwind v4, deployed on Cloudflare Pages.

## Commands

- `npm run dev` — local dev server at localhost:4321
- `npm run build` — production build to `./dist/`
- `npm run preview` — preview the production build locally
- `npx astro check` — type-check `.astro`/`.ts` files (run before considering a change done)
- `npm run test` — run the vitest suite (currently covers `whatsapp.ts`'s order-message builder)
- Run `supabase/schema.sql` in the Supabase SQL editor to (re)create tables/RLS/storage bucket — there are no migration files, it's the single source of truth for schema

## Caveats

- IMPORTANT: Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code — only `PUBLIC_*` env vars may be used outside server-only files (`src/lib/supabase-server.ts`).
- Runtime is Cloudflare Workers via `@astrojs/cloudflare`, not Node — don't assume Node built-ins/APIs are available; only enable `nodejs_compat` in `astro.config.mjs` if a dependency truly requires it.
- Compress/resize product images client-side before upload (WebP, target a few hundred KB). Free-tier bandwidth is shared and capped — never add a path that uploads or serves uncompressed originals.
- v1 is photos-only — don't add product video support.
- Supabase RLS is on and restrictive: anon/public can only read `is_published` products and `is_approved` reviews; all writes require an authenticated (admin) session. New tables/policies should follow this published/approved-only read pattern.
- Review inserts must default to `is_approved = false` — there is no public path to publish a review unmoderated.
- No deploy command in this repo — Cloudflare Pages deploys via its own git integration, not a local script.
- It's a installable PWA (`public/manifest.webmanifest`, `public/sw.js`). The service worker only cache-first's the static brand assets it precaches — never add page/API caching there, since prices/stock/admin data must always come fresh from Supabase.
- Never use `alert()`/`confirm()` — use `showToast()` (`src/lib/toast.ts`) and `confirmAction()` (`src/lib/dialog.ts`) so notifications match the site's design.
