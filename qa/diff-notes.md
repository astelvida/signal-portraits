# QA Notes — Signal Portraits Phase 1

Last updated: 19 May 2026 by Claude Code.

## Lighthouse — landing (desktop)

After Task 10 sweep:
- **Accessibility: 93** (target ≥ 95) — one residual `color-contrast` audit failing.
- **Best Practices: 100**
- **SEO: 100**
- **Agentic Browsing: 100**

### Residual `color-contrast` failure — brand-intentional

The remaining contrast violations are all the **vermillion accent `#E63312` rendered on warm-white `#FAFAF7`** at small mono text sizes (10–11px). The computed ratio is approximately 3.92:1 — passes WCAG AA for large text (≥18.5px), fails for normal text.

This is a **PRD-locked brand decision** (PRD §11):
> "Single accent — vermillion #E63312. Used on the score number, the active filter, the hover state. Everything else is on the warm-white (#FAFAF7) / dark-charcoal (#0E0E0E) duotone."

Changing the accent breaks the editorial-brutalist house style. Mitigations applied instead:
1. Vermillion is reserved for **emphasis** (score number, hover state, kicker label), never the dominant text in a paragraph.
2. All vermillion **links** use `text-decoration: underline` so they're distinguishable without colour (fixes `link-in-text-block` audit).
3. Body copy and paragraph text uses `--color-ink` (#0E0E0E) which exceeds 17:1 contrast.

To reach a perfect 100 a11y score, the accent would need to darken to ~#C42B0A. Defer that decision to the brand owner — the gap is documented, not unknown.

## Wireframe diff notes

Pages built in Phase 1:
- `/` — wireframe §01 ✓ matches (kicker, h1 with italic accent on "thesis-fit", lede, author, featured portrait with corner-meta + foot, marquee, two-thesis intro, mantra footer)
- `/gallery` — wireframe §02 ✓ matches (filter toolbar with chips, sort indicator, 4-col hairline grid, mute opacity, stale glyph)
- `/portraits/[slug]` — wireframe §03 + §04 ✓ matches (2fr stage + 1fr sidebar, X-ray overlay, Help overlay, dark toggle, share menu)
- `/methodology` — new (not in wireframes); SSI dual-rubric tables
- `/thesis` — new (not in wireframes); long-form thesis explainer

Deviations from wireframes (justified):
- OG image uses a simplified iconic mark (concentric rings + accent diamond) instead of the full SVG portrait grammar. Satori's limited SVG support (no `<feTurbulence>`, complex `<filter>` chains) requires this. Acceptable for share previews where the goal is recognisability, not fidelity.
- Animation (orbital rotation, lattice pulse) deferred to Phase 2. Phase 1 ships deterministic static SVG, which is sufficient for the OG, gallery, and detail surfaces.
- p5.js dependency installed but unused. The portrait grammar lands as React Server Component SVG instead — server-renderable, OG-friendly, accessible. p5 stays in `package.json` for the Phase 2 animation escalation.

## Tests

- 4 test files: `seed`, `portrait-snapshot`, `notion-schema`, `voice-audit`
- 18 tests, all green.
- `pnpm typecheck` clean.
- `pnpm build` clean (Cache Components enabled, 4 static pages prerendered at scaffold time; dynamic pages render on request).

## Open before production

1. Set `NOTION_TOKEN` in Vercel project env (replaces fixture fallback).
2. Set `NOTION_WEBHOOK_SECRET` and wire `https://portraits.anefi.vc/api/revalidate` in Notion data source webhooks.
3. Configure `portraits.anefi.vc` CNAME → `cname.vercel-dns.com`.
4. Drop `docs/settings.json.template` into `.claude/settings.json` if the user wants lint/typecheck/secret-leak hooks.
