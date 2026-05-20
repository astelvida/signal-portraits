# CLAUDE.md

Guidance for AI agents working in this repository.

## What this is

**Signal Portraits** — a public, read-only Next.js 16 gallery where each company
in the Notion Scouting Engine renders as a deterministic generative artwork
derived from its SSI v3.0 signals. Phase 1 is build-complete.

- Production: `https://signal-portraits.vercel.app`
- Vercel project: `signal-portraits` · GitHub: `astelvida/signal-portraits`
- Full spec: `docs/PRD.md` · visual reference: `docs/WIREFRAMES.html` · ship
  steps: `DEPLOY.md` · original build brief: `docs/PROMPT-CLAUDE-CODE.md`

## Commands

Package manager is **pnpm** (`pnpm@11.x`, Node ≥ 22.11).

```bash
pnpm dev          # next dev
pnpm build        # next build (Cache Components enabled)
pnpm test         # vitest run — tests in tests/**
pnpm typecheck    # tsc --noEmit
pnpm lint         # currently broken — see note below
pnpm sync-schema  # diff Zod CompanySchema vs live Notion schema
```

Run `pnpm typecheck` and `pnpm test` after any meaningful change. There is no
active Claude Code hook config — `docs/settings.json.template` is opt-in.

> `pnpm lint` is broken: the script runs `next lint`, removed in Next 16, and
> the `eslint.config.mjs` `FlatCompat` setup throws under ESLint 10. Migrating
> to a flat config that runs `eslint .` directly is unresolved tech debt — fix
> it before relying on lint.

## Architecture

```
app/
├── (public)/        layout (wordmark + nav + footer), landing, gallery,
│                    portraits/[slug], methodology, thesis
├── api/og/[slug]    1200×630 Satori PNG, cached by slug + ssi
├── api/portrait/[slug]  JSON readout for debug
├── api/revalidate   HMAC-verified Notion webhook → updateTag
└── layout.tsx       fonts + NuqsAdapter + metadata
lib/notion/          Zod schema, server-only @notionhq/client, mappers,
                     cached fetchers, fixtures, HMAC revalidation
lib/portrait/        seed (sha256 + Mulberry32), tokens, GAO + VSRAI grammars,
                     composite, <Portrait> dispatch + mute mode
components/          Wordmark, Nav, Marquee, GalleryToolbar, PortraitCard,
                     PortraitKeys, SignalTimeline
```

When `NOTION_TOKEN` is absent the app serves 10 fixture companies from
`lib/notion/fixtures.ts`. The Notion client is `server-only` — never import it
into a client component.

## Hard constraints (do not move)

- **Two visual grammars, never collapsed** — GAO (rings + lattice) and VSRAI
  (roots + SoR plate) are separate modules sharing only brand tokens.
- **Single accent** — vermillion `#E63312` on warm-white `#FAFAF7`, ink
  `#0E0E0E`. No other hues, no gradients, no card shadows. Tokens live in
  `app/globals.css` `@theme`.
- **Determinism** — `seed = sha256(slug + "|" + thesis + "|" + ssi)` →
  `readUInt32BE(0)` → Mulberry32 PRNG (`lib/portrait/seed.ts`). Same input,
  same render. `tests/portrait-snapshot.test.ts` enforces this.
- **Notion is the only source of truth** — never store company data elsewhere;
  cache server-side, revalidate via webhook. No `localStorage`/`sessionStorage`
  for company data.
- **Mute mode** — when the falsifier check triggers, the portrait renders
  desaturated with the pass reason in mono. It still renders.
- **No login, no form, no email gate.** Public read-only.
- **Fonts are fixed** — Fraunces (display), DM Sans (UI), JetBrains Mono (data),
  via `next/font`. Do not substitute.

## Conventions

- Raw Tailwind 4 (`@theme` CSS-first config) and custom components only. No
  component library (shadcn, MUI, Chakra).
- Voice register is **tight** on every user-facing string: opener under 10
  words, no em dashes, specific dates and numbers, no "AI-powered", no banned
  vocabulary. The only emoji allowed are the four tier markers `🔴🟠🟡⚪`.
- Verify library APIs against Context7 before relying on memory — Next.js 16,
  React 19, Zod 4, Tailwind 4 are recent.

## Refuse, even if asked

Component libraries; cookie-setting analytics; generated stock illustrations;
parallax / mouse-following / "magic" hover effects; replacing the three fonts;
hard-coded company names (every datum comes from Notion); em dashes in
user-facing copy; client-side storage of company data.

## Deploy

Vercel hosts production. Push to `main` (Vercel git integration) or trigger a
deploy via the Vercel MCP. See `DEPLOY.md` for env vars and the Notion webhook
verification flow.
