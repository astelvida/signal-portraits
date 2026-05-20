# Signal Portraits — Product Requirements Document

**Owner:** Sevda Anefi · [anefi.vc](http://anefi.vc)
**Version:** 1.0
**Status:** 🟩 Draft for build
**Last verified:** 19 May 2026
**Surface:** signal-portraits.vercel.app
**Source of truth:** Notion Scouting Engine v5.0 · Investment Thesis Pack v2.0 · SSI v3.0

---

## 1 · One-liner

A public gallery where each European AI startup in the Scouting Engine renders as a deterministic generative artwork derived from its actual SSI signals. Bloomberg terminal meets Art Blocks, in the editorial-brutalist house style of Signals Over Stories.

## 2 · The strategic bet (why this exists)

Most VC scout dashboards are spreadsheets with rounded corners. They show the same companies as everyone else, ranked the same way. The edge of the Scouting Engine is **regulation-in sourcing across two canonical theses** — Governed Agentic Ops and Vertical System-of-Record AI — scored with two distinct 100-point rubrics that resist collapse into generic "company quality."

Signal Portraits is the public-surface proof that the methodology is real. Each portrait is a one-of-one visual fingerprint of one company's signal stack — readable as art by non-VCs, readable as a SSI breakdown by partners. It is the editorial counter-move to the AI-investment dashboard category. Three downstream effects:

- **LP / partner-meeting artifact.** A portrait permalink in an outreach email outperforms a deck attachment. The interaction *is* the diligence summary.
- **Pre-consensus sourcing flywheel.** Each portrait carries an OG image. Founders who see their company rendered will reach out. We collect inbound from the right side of the funnel.
- **Methodology defensibility.** A portrait that visibly changes when a new signal lands proves the SSI is operationally live, not a backfit narrative.

## 3 · Success metrics

| Metric | Target by end of Q3 2026 | Target by end of Q4 2026 |
|---|---|---|
| Portraits live | 60+ | 120+ |
| Founder inbound from portrait permalinks | 5 / month | 15 / month |
| Partner-meeting opens (UTM-tracked) | 3 from outreach | 8 from outreach |
| Median time-to-portrait after new Companies row created | 24h via Notion webhook | < 1h via Notion webhook |
| Portrait shares (X + LinkedIn) | 50 | 200 |
| Anefi.vc referrer traffic | 8% of signal-portraits.vercel.app visits | 15% |

## 4 · Non-goals (explicit)

- Not a dealflow CRM. Notion is the system of record.
- Not a public scoreboard ranking startups. SSI score is *contextual* in the artwork, not the dominant element.
- No login, no signup, no email capture wall. Portraits are public by default.
- No editorial commentary per company on this surface. The portrait is the commentary. Substack carries the long-form.
- No real-time multi-user editing. One author. Generated, not collaborative.

## 5 · Users & jobs-to-be-done

| User | Job |
|---|---|
| Sevda (author) | Surface the next P0/P1 with a public artifact she can link in outreach. Watch a portrait evolve as signals land. |
| European AI fund partner | Skim the gallery in 90 seconds and judge whether the thesis is operationalised or theoretical. |
| Founder (subject) | See their company rendered honestly, share it, optionally request a call. |
| Founder (peer / adjacent) | Submit themselves to the engine through the inbound form. |
| Investor / LP | Open a portrait permalink from an outreach email and arrive at signal evidence, not a static deck slide. |
| Press / Substack reader | Land from a Substack essay and explore the underlying companies. |

## 6 · Information architecture

```
signal-portraits.vercel.app
├── /                       Landing — manifesto opener + featured P0 portrait + gallery teaser
├── /gallery                Filterable grid (thesis · sector · tier · catalyst)
├── /portraits/[slug]       Single portrait, x-ray toggle, share controls, signal log
├── /thesis                 The two-thesis canon, scrollable (mirrors Methodology v5.0)
├── /methodology            SSI v3.0 dual-rubric explainer with worked examples
├── /api/og/[slug]          Open Graph image generation (1200×630) per portrait
├── /api/portrait/[slug]    JSON endpoint returning the deterministic seed + signal payload
└── /api/revalidate         Webhook target for Notion changes (signed)
```

## 7 · Data contract (Notion → Portraits)

Source: Notion **Companies** data source — `collection://6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f` (live schema, fetched 19 May 2026).

**Pulled per company:**

| Field | Type | Used for |
|---|---|---|
| `Company` (title) | string | Portrait title, slug |
| `Thesis` | `["Governed Agentic Ops" \| "Vertical SoR AI" \| "Both"]` | **Selects which visual language renders** |
| `Sector` | enum (12 values: AI Governance, FinServices AI, MedTech AI, Healthcare AI, etc.) | Hue family, sector label |
| `Stage` | enum (Pre-Seed → Growth) | Scale, density |
| `HQ` | string | Caption only |
| `Headcount` | number | Particle count fallback |
| `Founded` | number | Time-axis offset |
| `Last Raise` | string | Caption only |
| `SSI Score` | 0–100 | Master luminance + contrast envelope |
| `Signal Tier` | enum (🔴 Highest Conviction · 🟠 Strong · 🟡 Emerging · ⚪ Watchlist) | Accent intensity |
| `Priority` | enum (P0 → P3) | Accent intensity (paired with Signal Tier) |
| `Discovery Source` | enum (regscan, ghscan, procscan, talentscan, eventscan, manual, grantscan, patentscan, spinoutscan) | Texture / mark grammar |
| `Falsifier Check` | enum (✅ Clean · ❌ Triggered · ⏳ Not Run) | If Triggered → portrait renders in mute mode (warm-white wash, no accent) |
| `Anti-thesis Filter` | enum (Clear · 1 Flag · Auto-pass · Not Run) | Same mute logic on Auto-pass |
| `Source confidence` | enum (High · Medium · Low) | Edge sharpness — High = crisp, Low = washed |
| `One-liner` | text | Caption strap |
| `Key Signal 30d` | text | Hover tooltip on signal node |
| `Catalyst Window (days)` | number | Inverse → animation tempo |
| `Last verified` | date | If > 90 days, portrait carries a stale-flag micro-glyph |
| `Last Scored` | date | Same |
| `Signals` (relation) | array | Each Signal becomes a discrete mark on the portrait |
| `Primary Catalyst` (relation) | URL → Catalyst timeline DB | Regulatory ring label |
| `Market Map Sub-Segment` (relation) | URL | Family grouping in gallery |

**SSI v3.0 dimension scores** are *not* yet first-class columns on the Companies DB — they live in evidence notes inside the Memo profile or in Signals. Phase 1 ships with **score + tier + thesis** as the primary visual drivers; Phase 2 adds per-dimension scores once the Companies DB has 8 dimension columns (one-time migration task in the Scouting Engine — see Issue Ledger).

## 8 · Generative system — two visual languages (style, not colors)

The brief asked for a **style** rather than a color system. The style is editorial-brutalist Signals Over Stories: warm-white #FAFAF7 background, vermillion #E63312 as the only accent, Fraunces (display), DM Sans (UI), JetBrains Mono (data). The portraits don't randomise hue — they randomise **structure**. Hue is locked. Structure is the variable. This is the inversion of Art Blocks and is what makes the gallery legible as one body of work.

Each thesis gets its own visual grammar. The brief's original 8-dimension mapping assumed a single rubric. SSI v3.0 has two rubrics with different dimensions — the visual system must reflect that, or it collapses into the generic VC-dashboard pattern the brand explicitly opposes.

### 8.1 · GAO — Governance Grid

The GAO portrait reads like a control-plane schematic. Geometric, regulatory-feeling, evidently structured.

| GAO dimension (max) | Visual element |
|---|---|
| Regulatory Embeddedness (20) | **Orbital rings** around the core. One ring per regulator/sandbox/standards body the company touches. Ring radius scales with score. |
| Runtime Governance Architecture (18) | **Inner lattice** — a square grid of policy cells. Cell density = score. High score → fine grid; low → sparse. |
| Regulatory-Technical Team Fit (15) | **Node count on the central glyph** — one node per credible institutional pedigree (ex-regulator, security lead, compliance ops). |
| Governance Build Velocity (12) | **Edge stroke weight** on the lattice. Heavier = more shipped governance features. |
| Enterprise Buyer Traction (12) | **Anchor marks** at lattice intersections — one per named regulated buyer. |
| Technical Moat (10) | **Lattice rotation angle.** 0° = wrapper; up to 45° = differentiated runtime. |
| Capital Efficiency (8) | **Negative-space ratio.** Higher score = more whitespace, more confidence. |
| Investor Signal Quality (5) | **Corner marks** — small JetBrains Mono ticks at the canvas edges, one per mission-aligned investor. |

Animation: orbital rings rotate at tempo inversely proportional to Catalyst Window. Inner lattice pulses on hover. The whole composition is on a static 12-column grid that the user can toggle visible (alignment is the point).

### 8.2 · VSRAI — Workflow Gravity

The VSRAI portrait reads like a system-of-record cross-section. Organic but structured. Roots into a core.

| VSRAI dimension (max) | Visual element |
|---|---|
| System-of-Record Integration Depth (20) | **Root depth.** Vertical threads descend into a SoR plate at the bottom. Number and length scale with score. |
| Domain Data Advantage (18) | **Spiral density** around the core node. Tight spiral = compounding data flywheel. |
| Team Domain Pedigree (15) | **Core node faceting.** One facet per native-domain founder/hire. |
| Workflow Lock-In Evidence (12) | **Lateral arms** from the core — one per integrated department/role. |
| Regulatory Alignment (12) | **Margin glyphs** keyed to the catalyst (EHDS, DORA, AMLA, MDR, IVDR). |
| Switching Cost Architecture (10) | **Anchor barbs** on the root threads — the harder to remove, the more barbs. |
| Market Timing (8) | **Asymmetric tilt** of the core. Higher score = stronger forward lean. |
| Capital Efficiency (5) | **Negative-space ratio** (same convention as GAO). |

Animation: the spiral rotates slowly. The roots pulse with each new Signal landing. The catalyst glyph is sticky at the margin.

### 8.3 · Dual-thesis (both)

A company tagged `Both` renders as a composite — the lattice and the root system share the canvas, lattice on the upper half, roots descending below. The two scores both display.

### 8.4 · Mute mode

`Falsifier Check = ❌ Triggered` or `Anti-thesis Filter = Auto-pass` → portrait renders without vermillion accent, in warm-white-on-warm-white, with the pass reason set in JetBrains Mono at the canvas foot. The portrait still exists. The methodology is honest about its no's.

### 8.5 · Determinism

Seed = `sha256(company_slug + thesis + ssi_score)`, truncated to 32 bits. Same inputs always render the same portrait. When a Signal lands and SSI score moves, the portrait visibly shifts. This is the point.

### 8.6 · Canvas

Square 1200×1200 native, exported at 4K. Background warm-white #FAFAF7 with a subtle grain (one-pixel noise at 4% opacity). The single accent is vermillion #E63312. Dark mode inverts to near-black #0E0E0E with warm cream marks #F2EDE3.

## 9 · Interaction model

| Affordance | Behaviour |
|---|---|
| Hover over a visual element | Inline label in JetBrains Mono naming the dimension and score. Snaps to the element, doesn't follow the cursor. |
| `X` key or x-ray toggle | Switches to Bloomberg-mode overlay: the artwork dims, a structured grid of {dimension, score, evidence note, source URL} renders on top in JetBrains Mono. Press again to dismiss. |
| `D` key | Dark mode toggle. |
| `S` key | Share menu — copies permalink, downloads 4K PNG, copies OG-image URL. |
| `?` key | Help overlay with key bindings. |
| Click on a Signal node | Opens the relevant Signal in the Notion Signal Log (read-only public mirror). |
| Click on the catalyst glyph | Opens the catalyst regulator page (primary source, not the Notion mirror). |
| Scroll on /gallery | Infinite scroll with skeletons. |

No mouse-following effects, no parallax. The brand is editorial, not playful.

## 10 · Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15.4+** (App Router, React 19, RSC, PPR) | RSC means the SSI data fetch lives on the server, p5/WebGL stays client. PPR for the gallery shell. |
| Rendering | **p5.js 1.11+** in instance mode, inside a client component | The brief's original choice was correct; instance mode prevents global pollution. |
| Optional escalation | **react-three-fiber + drei** if the GAO lattice needs custom GLSL | Only if p5 WEBGL hits limits. Decided in build, not committed up-front. |
| Styling | **Tailwind 4** with custom CSS variables for the brand tokens; no component library | The brief's "raw Tailwind" instruction stands. |
| Fonts | Fraunces (Google Fonts, variable) · DM Sans (Google Fonts, variable) · JetBrains Mono (Google Fonts) | All self-hosted via `next/font` for CLS. |
| OG images | **`@vercel/og`** (Satori) at the edge | One image per portrait, regenerated on Notion webhook. |
| Data | **Notion MCP** server via the official `notion://` connector inside an Agent SDK route | At build time + on webhook, the engine fetches the Companies data source by ID. |
| Cache | **Next.js Data Cache + ISR**, 1h tag-revalidated by `/api/revalidate` | Webhook fires from Notion → revalidates company tag. |
| Hosting | **Vercel**, deployed via the Vercel MCP server | Domain `signal-portraits.vercel.app` (CNAME from the apex). |
| Observability | Vercel Analytics + a `og.json` page per portrait for debugging | No third-party tracking. |
| Storage | Local-only — no DB | Notion is the system of record. |

**Library lookups during build:** every library reference above must be re-verified via the Context7 MCP at build start. Versions may have moved since 19 May 2026.

## 11 · Brand style (the "style instead of color system")

The brief asked for style, not colors. The full house style is loaded by reading the `sevda-brand-voice` skill before any UI copy is written. Voice register for this surface = **tight**. Specific consequences:

- **Typography stack:** Fraunces 600 italic for the wordmark; Fraunces 500 for editorial display; DM Sans 400/500 for UI; JetBrains Mono 400 for all data, scores, dates, file paths. Numerals tabular by default. No additional families.
- **Spacing:** baseline grid of 4px. All vertical rhythm a multiple of 4. Generous margins. No card shadows.
- **Color:** single accent — vermillion #E63312. Used on the score number, the active filter, the hover state. Everything else is on the warm-white (#FAFAF7) / dark-charcoal (#0E0E0E) duotone. No purple gradients. No glassmorphism.
- **Copy register (tight):** opener under 10 words; specific dates and numbers; em-dash policy *zero* (tight register bans them); no banned vocabulary; signature phrases used max 1 per page. Mandatory voice-check pass via `sevda-brand-voice` skill before shipping any user-facing string.
- **Imagery:** no stock. No AI illustration. Only the generative portraits and the regulator coats-of-arms used as catalyst glyphs.
- **Anti-patterns to refuse:** marketing-page hero gradients, "AI-powered" anywhere, decorative emojis (the Notion tier emojis 🔴🟠🟡⚪ are functional, not decorative — they're allowed in their specific functional role).

## 12 · Phasing

**Phase 0 — Spike (≤ 2 days).** One portrait, one company, one thesis. Static seed, no Notion. Validate the visual grammar lands. Show to a partner who's seen the brand. Adjust.

**Phase 1 — Public alpha (1 week).** Both visual languages working. Notion MCP pulling live data. Gallery with thesis/sector/tier filters. OG images. signal-portraits.vercel.app DNS live. Mute mode shipped. 30+ portraits.

**Phase 2 — Operational (2–3 weeks after Phase 1).** Notion webhook → automatic revalidation. Per-dimension SSI scores once the Companies DB migration ships. Time-lapse view per portrait (a portrait's history as new signals landed). Inbound founder form. Substack cross-link on each portrait.

**Phase 3 — Editorial layer (later).** Long-form essays at /thesis pull the matching portraits inline. Conference talk export pack (high-res prints).

## 13 · Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Visual system collapses into generic AI-dashboard chrome | Medium | The dual-thesis grammar is the antidote. Each thesis has a structurally different language. Test at Phase 0 with a Substack reader's partner and a non-VC designer. |
| Notion MCP rate-limits at gallery scale | Low | Cache aggressively. Webhook-driven revalidation. Don't poll. |
| Founders interpret a mute-mode portrait as defamation | Medium | Mute mode renders only on *Auto-pass* or *Falsifier Triggered* — both are documented kill-criteria, not editorial opinion. Pass reason cited inline. Email contact on every portrait foot. |
| EU AI Act timeline shifts make any catalyst-window animation stale | Low — already mitigated | Catalyst window is derived from the Catalyst Timeline DB, which is verified weekly. Stale > 90 days → flag glyph on the portrait. |
| WebGL on low-end mobile is poor | Medium | Render a static OG-image fallback. Portrait page detects WebGL support; falls back to the PNG with a "view interactive" link. |
| Build-without-ship pattern (recurring in the userMemories) | High | Phase 0 ships in ≤ 48h or the project is paused. No infrastructure work beyond what's needed for one portrait to render in production. |

## 14 · Open questions

- Should the catalyst glyph open the Notion catalyst page (internal) or the regulator page (external)? *Default: external. The Substack readership doesn't have Notion access.*
- Should the gallery default sort be `Last Signal Date` or `SSI Score`? *Default: Last Signal Date. Freshness beats ranking on a public surface.*
- Stale (Last verified > 90d) — show the company or hide it? *Default: show with stale glyph. Hiding implies certainty we don't have.*
- Public per-dimension scores in Phase 2 — invitation for incumbents to game? *Mitigation: the evidence note is what matters; the score alone is meaningless without the note, which we don't publish per row.*

## 15 · References (Notion source pages)

- [Scouting Engine v3.0](https://www.notion.so/32250a4090d381bbb25fce0eca952d03)
- [Methodology v5.0](https://www.notion.so/e29a4e77e16841c89901fc2beee52c4e)
- [Investment Thesis Pack v2.0](https://www.notion.so/973bfd7026b441119d88f633e641c186)
- [Companies database](https://www.notion.so/2d56104610e243f1895ccf91352db6e2) (data source `6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f`)
- [Signals database](https://www.notion.so/791979971fc54d7580a75f82229d757d) (data source `d67eb9f0-8bcf-443f-ba4f-2b528c4a6cb1`)
- [Memos database](https://www.notion.so/fee5fca40a4147c08abcb0f087199dd0) (data source `d9490769-92c1-4b4b-a10e-b41223a21659`)

---

*Signals over stories. Filings over feelings. Buyers over vibes.*
