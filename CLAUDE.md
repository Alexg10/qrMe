# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

qrMe — Nuxt 3 PWA for QR business cards. A user creates one or more cards (all fields optional), shows them full-screen ("SHOWme"), and collects other people's cards by scanning their QR. UI copy is French. Data and auth live in Supabase; there is no custom server code.

## Commands

Package manager is pnpm. Deployed on Vercel (Nuxt preset auto-detected; set the env vars below in the Vercel project).

- `pnpm dev` — dev server on http://localhost:3000
- `pnpm build` / `pnpm preview` — production build (also generates the PWA service worker `sw.js`)
- `pnpm lint` / `pnpm lint:fix` — ESLint via `@nuxt/eslint` (stylistic rules disabled)

There is no test suite. A build needs `SUPABASE_URL` / `SUPABASE_KEY` set (dummy values work for a compile check).

## Environment

`.env` at the root:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<anon public key>
BASE_URL=https://<public domain>   # optional: domain encoded in QR codes; defaults to the current origin
GA_ID=G-XXXXXXXXXX                 # optional: Google Analytics 4 measurement ID; no tracking when unset
```

Analytics: `plugins/gtag.client.ts` loads gtag.js only when `GA_ID` is set and sends a `page_view` on each client-side route change (query-only changes such as `?carte=` are ignored).

The database is created by running `supabase/schema.sql` in the Supabase SQL editor. Later changes go in `supabase/migrations/*.sql` (run by hand on an existing project) and are also folded into `schema.sql`.

## Architecture

- **Data model** (`supabase/schema.sql`): `cards` (owner, random 7-char `slug`, profile fields, `tags text[]` ≤ 5, social handles `linkedin`/`instagram`/`youtube`/`twitch` (shown on the public page and in exports, never on the card face; normalized by `socialUrl`/`socialHandle`), `color`, `layout`, `is_active`), `collection` (user ↔ someone else's card, plus `note`, `is_favorite`, `source` scan/public/return), `card_events` (scan/add/return log for stats). Active cards are publicly readable (that is what the QR exposes); everything else is owner-only via RLS. Writes that cross users go through `security definer` RPCs: `record_scan(slug)` (anon), `send_card_back(my_card, their_card)`, `my_card_stats(days)`, `my_received_returns(days)`. A trigger logs an `add`/`return` event on every collection insert; another forbids collecting your own card. Collected cards reference the live `cards` row, so owners' edits propagate.
- **Client-side Supabase only**: composables in `composables/` wrap all queries and hold shared state with `useState` — `useMyCards` (must filter `user_id` explicitly since active cards are publicly readable; caches cards in localStorage, keyed by user id, so SHOWme works offline), `useCollection`, `useCardStats`. Pages call these, not Supabase directly (except auth pages and `record_scan`).
- **Auth**: `@nuxtjs/supabase` `redirectOptions.include` protects only `/dashboard/**`; `/c/:slug` stays public. Login/signup accept `?redirect=` so the public page's "Ajouter à ma collection" returns to the card after sign-in; `/confirm` is the email-confirmation callback. Password reset: `/forgot` calls `resetPasswordForEmail` with `redirectTo: <origin>/reset`; `/reset` waits for the PKCE session from the link (same browser only) then `updateUser({ password })`.
- **Routes**: `/dashboard` = SHOWme (default screen), `/dashboard/scanner` (camera via `getUserMedia`, `BarcodeDetector` with `jsqr` fallback), `/dashboard/collection` (grid/list, search, sort, tag/favorite filters, CSV/VCF export; the detail modal is driven by `?carte=<entry id>`), `/dashboard/cards` + `/cards/new` + `/cards/[id]` (editor), `/dashboard/stats`, `/c/[slug]` (public card page, light theme).
- **Card rendering**: `components/qr/Card.vue` is the single source of truth for the card look (3 layouts: `affiche`, `mono`, `typo`; 7 colors). It is 55:85, `container-type: inline-size`, and every inner size is in `cqw` so it scales from 40px thumbnails to full screen. Two gotchas: padding in `cqw` must sit on the inner `.ci` element, not on the container itself (otherwise it resolves against the viewport); and names are kept on one line per word by shrinking the font in `fit()`. QR SVGs come from `qrSvg()` in `utils/card.ts` (`qrcode-generator`) and use `currentColor`.
- `utils/card.ts` also holds the `Card`/`CollectionEntry` types, color/layout lists, `cardUrl`, `slugFromScan`, vCard/CSV builders and `downloadFile`. Utils and composables are auto-imported.
- **Layout**: pages under `/dashboard` use `definePageMeta({ layout: "dashboard" })`; `layouts/dashboard.vue` is the yellow icon rail with CSS tooltips (desktop) that becomes a bottom tab bar under 860px.

## UI conventions

- Design tokens (ink/paper neutrals, card colors `--c-*`, fonts Archivo + IBM Plex Mono) and shared classes (`q-h1`, `q-head`, `q-pill`, `q-field`, `q-textarea`, `q-note`, `q-lbl`) are in `assets/css/main.css`. The app is dark-only; shadcn CSS variables are mapped onto the same palette.
- Component styles are scoped CSS rather than Tailwind utilities. shadcn-vue components in `components/ui/` are generated; only the toast is currently used.
- Icons: `lucide-vue-next`.
