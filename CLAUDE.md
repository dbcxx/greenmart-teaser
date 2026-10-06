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
- `src/components/FieldIntro.tsx` — pinned 400vh scroll story: seeds → grass (3 parallax layers) → crops → wordmark
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

## Next tasks (in order)
1. Replace the JSON store with MySQL (`mysql2` or Prisma), keeping the `WaitlistStore` interface. Table `waitlist_signups` per PRD.
2. Cloudflare Turnstile + IP rate limit in `joinWaitlist`.
3. Welcome email via Resend; WhatsApp via Termii or Cloud API (behind env flags).
4. `/admin` page behind a password env var: filter by group/state/category, CSV export.
5. OG image (`opengraph-image.tsx`) showing the grass scene + wordmark; sitemap + Organization schema.
6. Plausible/GA4 with scroll-depth events per scene.
7. Swap the inline SVG wordmark for the real GreenMart logo from Figma (file `pCQR7G7rDS2PoxeMoIITxS`).
