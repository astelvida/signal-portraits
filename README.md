# Signal Portraits

[portraits.anefi.vc](https://portraits.anefi.vc) — one portrait per European AI thesis-fit startup.

A public Next.js 16 gallery where each company in the Notion Scouting Engine renders as a deterministic generative artwork derived from its actual SSI v3.0 signals. Two distinct visual grammars (GAO + VSRAI) that never collapse into one.

## Stack

- **Next.js 16.2** (App Router, React 19, Cache Components, PPR)
- **Tailwind 4** (CSS-first `@theme` config, no component library)
- **Fraunces + DM Sans + JetBrains Mono** via `next/font`
- **Zod 4** for the Notion data contract
- **@notionhq/client** as the runtime data source
- **@vercel/og** for share images
- **Vitest** for tests
- **Vercel** for hosting; deploy via the Vercel CLI

## Scripts

```bash
pnpm dev          # next dev (Turbopack)
pnpm build        # next build
pnpm test         # vitest
pnpm typecheck    # tsc --noEmit
pnpm lint         # next lint
pnpm sync-schema  # diff Zod CompanySchema vs live Notion schema
```

## Architecture

```
app/
├── (public)/
│   ├── layout.tsx           wordmark + meta strap + main + footer mantra
│   ├── page.tsx             landing (wireframe §01)
│   ├── gallery/page.tsx     filterable grid (wireframe §02)
│   ├── portraits/[slug]/    company detail + xray + dark + share
│   ├── methodology/         SSI v3.0 dual-rubric explainer
│   └── thesis/              long-form thesis explainer
├── api/
│   ├── og/[slug]            1200×630 Satori PNG, cached by slug + ssi
│   ├── portrait/[slug]      JSON readout for debug + Phase-2 timelapse
│   └── revalidate           HMAC-verified Notion webhook → updateTag
└── layout.tsx               fonts + NuqsAdapter

lib/
├── notion/
│   ├── schema.ts            Zod contract for Company + Signal
│   ├── client.ts            @notionhq/client wrapper (server-only)
│   ├── mappers.ts           Notion property → typed Company
│   ├── companies.ts         fetchCompanies / fetchCompany / featuredCompany — all 'use cache' + cacheTag('company:slug')
│   ├── fixtures.ts          10 dev fixtures (used when NOTION_TOKEN absent)
│   ├── catalysts.ts         external regulator URL map
│   └── revalidation.ts      HMAC verify + updateTag dispatch
└── portrait/
    ├── seed.ts              sha256 + Mulberry32 PRNG
    ├── tokens.ts            brand colors and fonts for canvas
    ├── dimensions.ts        GAO + VSRAI rubrics, synthetic 8-vector synthesis
    ├── gao.tsx              GAO grammar — rings + lattice + corner ticks
    ├── vsrai.tsx            VSRAI grammar — roots + spiral + SoR plate
    ├── both.tsx             composite for thesis=Both
    └── index.tsx            <Portrait> server component dispatch + mute mode

components/
├── Wordmark.tsx             Signal Portraits.  (italic Fraunces 600 + vermillion period)
├── Marquee.tsx              live counts strap
├── GalleryToolbar.tsx       nuqs-synced filter chips
├── PortraitCard.tsx         hairline-bordered grid item
└── PortraitKeys.tsx         X / D / S / ? / Esc keyboard binds + overlays
```

## Hard constraints (don't move)

- Two grammars, never collapsed (PRD §1)
- Single accent: vermillion `#E63312` on warm-white `#FAFAF7` (PRD §11)
- Determinism: `seed = sha256(slug + thesis + ssi_score)` (PRD §8.5)
- Notion is the only source of truth (PRD §10)
- Mute mode is non-negotiable (PRD §8.4)
- No login, no form, no email gate (PRD §4)
- Voice register: **tight** (no em dashes, opener <10 words, no banned vocab)

See `docs/PRD.md` for the full product spec and `docs/WIREFRAMES.html` for the visual reference.

## Webhook

The gallery stays live through a signed Notion webhook, not polling.

When a row changes in the Companies or Signals database, Notion POSTs to
`/api/revalidate` with an HMAC header. The route verifies it against
`NOTION_WEBHOOK_SECRET`, then calls `updateTag("companies")` so the next
render refetches and the portrait redraws.

```bash
# Generate the shared secret once
openssl rand -hex 32
```

Set the same value in two places — Vercel env (`NOTION_WEBHOOK_SECRET`)
and the Notion webhook config (Settings → Connections → integration →
Webhooks). The webhook URL is `https://portraits.anefi.vc/api/revalidate`;
subscribe it to the Companies + Signals data sources.

`NOTION_WEBHOOK_SECRET` only verifies webhook signatures. It does not
authenticate to Notion — that is `NOTION_TOKEN`.

```bash
# Smoke test: a bad signature must 401
curl -s -X POST https://portraits.anefi.vc/api/revalidate \
  -H 'x-notion-signature: sha256=bad' -d '{}' -w '\n%{http_code}\n'
```

## Deploy

See `DEPLOY.md`.

---

*Filings beat vibes. Signals beat stories. Buyers beat hype.*
