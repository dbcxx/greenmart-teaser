# GreenMart Teaser — Claude Code guide

Soft-launch teaser + 3-way waitlist (farmers, sellers, buyers) for GreenMart, a Nigerian farm-to-consumer marketplace.
The full spec lives in `docs/PRD.md`. Read it before any feature work.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 (tokens in `src/app/globals.css` `@theme`)
- GSAP + ScrollTrigger, lazy-loaded inside `FieldIntro` (keep it out of the first paint)
- Zod schemas in `src/lib/waitlist.ts`, shared by client and server
- Server action `joinWaitlist` in `src/app/actions.ts`

## Commands
- `npm run dev` — local dev on :3000
- `npm run build` — must pass before any commit
- `npm run lint`

## Layout
- `src/components/FieldIntro.tsx` — the opening story: seeds → grass → crops → wordmark, then farm → GreenMart dispatch bike → partner store → your door, with captions explaining the brand and a chapter progress bar (tap to jump). Desktop (md+) is pinned (750vh), locked 1:1 to scroll, with Lenis smoothing the scroll; mobile is one 100svh screen that autoplays. The world is a 3-panel strip panned with transforms. Art lives in `src/components/story/art.tsx`.
- Smoothness rules for the intro: no inner-SVG transforms that run continuously (sway lives on the `<svg>` element so it's composited); skip hidden blades; no `scrub` delay (Lenis handles smoothing).
- `src/components/HowItWorks.tsx` — farm → app → table
- `src/components/PickPath.tsx` + `WaitlistForm.tsx` — group picker and per-group form, referral confirmation
- `src/components/Footer.tsx` — live counts (hidden until a group passes 50) + WhatsApp share
- `src/lib/store.ts` — `WaitlistStore` interface; current impl is a dev-only JSON file in `.data/`

## Rules
- Mobile first. Target: mid-range Android on 3G. First load under 1.5 MB, LCP under 2.5 s.
- Animate only `transform` and `opacity`. Grass blade count is capped on mobile (`max-md:hidden` on 3 of every 5).
- Always respect `prefers-reduced-motion` (handled via `gsap.matchMedia`). Keep the "Skip intro" link.
- Nigerian phone numbers normalise to `+234…`. Dedupe per group on phone or email.
- Copy is punchy and plain. Sentence case, no all-caps labels, no "→" on buttons.
- Palette: soil `#2e2118`, forest `#1f4d2b`, field `#2f7a3a`, sprout `#7cb342`, husk `#f3ecd9`, dawn `#f0a35e`, sky `#cfe5ee`.

## Integrations (all off until their env vars are set; see `.env.example`)
- Store: `src/lib/store.ts` picks `store-mysql.ts` when `DATABASE_URL` is set, else the dev JSON file. Schema in `db/schema.sql`, apply with `npm run db:migrate`.
- Anti-spam: Turnstile + per-IP limit (salted IP hash, 8/hour) in `src/lib/guard.ts`.
- Welcome messages: `src/lib/notify.ts` (Resend email, Termii WhatsApp behind `WHATSAPP_ENABLED=1`), sent with `after()` so signups never wait on them.
- `/admin`: `ADMIN_PASSWORD` login, filter by group/state/category, CSV export at `/admin/export`.
- SEO: `opengraph-image.tsx` (grass scene + wordmark, shares geometry with `src/lib/field.ts`), `sitemap.ts`, `robots.ts`, Organization JSON-LD in `layout.tsx`.
- Analytics: `components/Analytics.tsx` + `lib/analytics.ts`. Events: `Scene viewed` (soil, sprout, field, brand, how it works, pick your path, footer), `Path picked`, `Signup`.

## Next tasks
1. Run the MySQL store against a real database end to end (written and type-checked, not yet exercised).
2. Swap the inline wordmark for the real GreenMart logo from Figma (file `pCQR7G7rDS2PoxeMoIITxS`).
