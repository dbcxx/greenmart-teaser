# GreenMart Soft Launch — Teaser & Waitlist PRD

Oct 6, 2026 · Sam. Live version: https://claude.ai/code/artifact/c5148b6b-dbd4-4133-b02b-759824120f5c

## Overview

GreenMart will soft-launch with a single animated teaser page that tells the brand story and collects a waitlist split three ways: farmers, sellers and buyers.

GreenMart is a farm-to-consumer marketplace for Nigeria. The full product (storefront, checkout, delivery tracking, seller dashboard) is designed but not live. This page builds anticipation, proves demand, and lines up early supply before launch.

The experience opens on bare soil. As the visitor scrolls, grass grows, crops rise, and the GreenMart wordmark emerges from the field. The story ends at the waitlist.

## Goals & success metrics

The page succeeds if it fills the supply side first, because a marketplace with no farmers can't launch.

| Metric | Target (first 60 days) | Why it matters |
| --- | --- | --- |
| Farmer signups | 300 | Proves supply exists |
| Seller signups | 150 | Aggregators and stores widen the catalogue |
| Buyer signups | 2,000 | Proves demand worth serving |
| Visit → signup conversion | ≥ 12% | Tests whether the story persuades |
| Signups via referral | ≥ 25% | Tests organic spread |
| Scroll-through to waitlist | ≥ 60% | Tests whether the animation holds attention |

Targets are placeholders until traffic sources are known; revise after week 2.

## Audiences

| Group | Who they are | What they want | Pitch line |
| --- | --- | --- | --- |
| Farmers | Smallholder and commercial growers producing their own goods | Buyers without middlemen, fair prices, fast payment | Sell straight from your farm. Keep more of every naira. |
| Sellers | Aggregators, market traders, stores and processors who resell produce | More customers, an online storefront, delivery handled | Open your store to buyers across the city. |
| Buyers | Households, restaurants, caterers | Fresh food, fair prices, reliable delivery | Fresh from the farm, straight to your door. |

Many farmers will arrive on mobile and may prefer WhatsApp to email. Their path must be phone-first.

## Page structure & scroll story

The page runs as 7 scenes. Scenes 1–4 are pinned and scroll-driven, and scenes 5–7 scroll normally.

1. **Soil (0–10% scroll).** Dark earth with a few seeds. A "Scroll to grow" hint pulses. Seeds drop in on load.
2. **Sprout (10–35%).** Grass blades grow from the bottom edge, staggered left to right, in 3 depth layers (back, mid, front) for parallax.
3. **Field (35–60%).** Grass sways in an idle wind loop. Crops rise between the blades: maize, tomato, pepper. Sky shifts from dawn orange to morning blue.
4. **Brand reveal (60–80%).** The GreenMart wordmark grows out of the field letter by letter. Tagline fades in: "Get food products from your favourite farm store."
5. **How it works.** 3 short beats: Farm → GreenMart app → Your table.
6. **Pick your path.** 3 large cards: I'm a farmer, I'm a seller, I'm a buyer. Tapping one opens that group's form.
7. **Footer.** Live signup counter, WhatsApp share, and a "Launching soon" note.

Visual language comes from the Figma (file `pCQR7G7rDS2PoxeMoIITxS`): GreenMart greens, the wordmark, the hand-holding-tomatoes hero imagery. Motion is organic: ease-out growth, no bounce.

## Waitlist forms

| Field | Farmer | Seller | Buyer |
| --- | --- | --- | --- |
| Full name | Required | Required | Required |
| Phone (WhatsApp) | Required | Required | Optional |
| Email | Optional | Required | Required |
| State / city | Required (state + LGA) | Required | Required (city) |
| What you grow or sell | Required (multi-select) | Required (multi-select) | — |
| Business or farm name | Optional | Required | — |
| Scale | Farm size | Store type | Buyer type |
| Currently sell online? | Yes / No | Yes / No | — |
| Referral code | From link | From link | From link |

Categories: Cereals & Grains, Legumes, Fruits & Vegetables, Meat & Poultry, Seafood, Dairy Products.

After submitting, the visitor sees their list position, referral link and a WhatsApp share button, and gets a welcome email or WhatsApp message.

- Validate Nigerian phone numbers (+234 or a leading 0, 11 digits).
- Deduplicate on phone and email per group. One person can join more than one group.
- Consent checkbox for launch updates, in line with the NDPA.

## Growth features

- **Referral queue.** Each friend who joins moves the referrer up 5 places.
- **Founding perks.** First 100 farmers: zero commission for 3 months. First 500 buyers: free delivery on first order. (Proposals; confirm before launch.)
- **Live counter.** Refreshes every 60 s; hidden until each group passes 50.
- **WhatsApp share.** Pre-filled message with referral link, plus an OG image of the grass scene.
- **Tracking.** UTM capture stored on every signup.

## Tech stack & architecture

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Animation | GSAP + ScrollTrigger, SVG grass |
| Validation | Zod, shared client/server |
| Database | MySQL (matches main app) or hosted Postgres; one `waitlist_signups` table |
| Messaging | Resend (email); WhatsApp Cloud API or Termii |
| Anti-spam | Cloudflare Turnstile + IP rate limit |
| Analytics | Plausible or GA4 + UTM capture, scroll-depth per scene |
| Hosting | Vercel |
| Admin | Password-protected `/admin` with CSV export |

Core fields: id, group, name, phone, email, state, lga_or_city, categories (JSON), scale, business_name, sells_online, referral_code, referred_by, position, utm_source, utm_campaign, consent, created_at.

## Performance, accessibility & SEO

- First load under 1.5 MB; GSAP lazy-loaded; AVIF/WebP images.
- LCP under 2.5 s on 4G; form usable within 3 s.
- About 120 blades on mobile, 300 on desktop; animate only transform and opacity.
- `prefers-reduced-motion`: show the finished scene statically. "Skip intro" jumps to the waitlist.
- Labelled inputs, visible focus, WCAG AA contrast, keyboard-reachable cards.
- Meta, OG/Twitter cards, sitemap, Organization schema.

## Milestones, scope & open questions

No launch date yet. About 3 weeks of focused work: Design (3–4 days), Build (7–8 days), Polish (3–4 days), Soft launch (2 days).

Out of scope: product listings, payments, seller dashboards, native apps, multi-language (consider Yoruba, Hausa, Pidgin in v2).

Open questions:

- [ ] Final domain?
- [ ] MySQL now, or hosted Postgres for the waitlist?
- [ ] Which founding perks can the business afford?
- [ ] WhatsApp messaging in v1, or email only?
- [ ] Which cities or states launch first?
