# Build Prompt — Signal Portraits (Claude Code, latest)

> Drop this entire file into Claude Code as your opening message. Run with `claude --agent general-purpose` and enter plan mode (Shift+Tab to cycle, or `/plan`) before executing. Targets Claude Code v2.1+, Opus 4.7, Node 22+.

---

## 0 · How you should run this build (read this first)

You are building **Signal Portraits** — a Next.js 15 generative-art gallery deployed at `signal-portraits.vercel.app`. The full PRD is in `./PRD.md` and the wireframes are in `./WIREFRAMES.html`. Read both before doing anything else.

Use the modern Claude Code stack — not the API. Concretely:

- **Plan mode first.** Open in `/plan` and produce a TodoWrite plan before writing any code.
- **Skills.** Read these before building UI: `frontend-design` (built-in skill that ships with the public skill pack) and `sevda-brand-voice` (project-local under `~/.claude/skills/sevda-brand-voice/`). The voice skill governs every user-facing string. Voice register for this surface = **tight**.
- **Subagents.** Spawn parallel subagents for isolated work — explicit recipe in §3.
- **MCP servers.** Use Notion (live), Context7 (library docs), Vercel (deploy), and Chrome (visual QA). Do not write raw HTTP fetches to these services. Listed in §2.
- **Hooks.** Set up four `PostToolUse` hooks before generating files. Listed in §4.
- **Plugins.** If `awesome-claude-code-subagents` is installed, prefer its `frontend-developer`, `nextjs-developer`, and `webgl-shader-engineer` subagents; otherwise create equivalents inline.
- **Headless deploys.** Use the Vercel MCP, not `vercel` CLI directly. The MCP gives you build logs, runtime logs, and protected-URL access in one place.
- **Verify with Chrome MCP.** Once Phase 1 ships to preview, drive the Chrome MCP to take screenshots at the four breakpoints and diff against the wireframes.

If you cannot complete the build in one pass, **stop and report a TodoWrite plan with what's done, what's blocked, and what the next session should pick up**. No silent partial work.

## 1 · Hard constraints (these don't move)

1. **Two visual languages, not one.** The PRD defines a GAO portrait grammar (orbital rings + inner lattice) and a VSRAI portrait grammar (root system + SoR plate). The original brief assumed one grammar with 8 dimensions; SSI v3.0 has **two distinct rubrics with different dimensions** (canonical reference: Notion page `e29a4e77-e168-41c8-9901-fc2beee52c4e`, Methodology v5.0, verified 18 May 2026). Do not merge the rubrics into one.
2. **Style, not a color system.** Single accent: vermillion `#E63312`. Fonts: Fraunces (display), DM Sans (UI), JetBrains Mono (data). Warm-white `#FAFAF7`. No purple gradients. No card shadows. No emojis except the four functional tier markers `🔴🟠🟡⚪`. No "AI-powered" anywhere on the surface.
3. **Determinism.** `seed = sha256(slug + thesis + ssi_score)` truncated to 32 bits. Same input → same render. Tests must enforce this.
4. **Notion is the source of truth.** Do not store company data anywhere else. Cache, don't copy. Webhooks revalidate.
5. **Mute mode is non-negotiable.** When `Falsifier Check = ❌ Triggered` or `Anti-thesis Filter = Auto-pass`, the portrait renders without the accent, with the pass reason in JetBrains Mono at the foot. The portrait still exists. The methodology is honest about its no's.
6. **No login, no form, no email gate.** Public read-only.
7. **Library versions move.** Verify every library version through Context7 at build start. Do not pin from memory.

## 2 · MCP servers (verify all four connected before starting)

Run `/mcp` first to confirm. Required servers and the calls you will make:

| MCP | Why | Key calls |
|---|---|---|
| **Notion** (`mcp.notion.com/mcp`) | Live data source. | `notion-fetch` on data source `collection://6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f` for Companies; `collection://d67eb9f0-8bcf-443f-ba4f-2b528c4a6cb1` for Signals. |
| **Context7** (`mcp.context7.com/mcp`) | Versioned library docs. | `resolve-library-id` then `query-docs` for: Next.js 15, React 19, p5.js, three.js, react-three-fiber, drei, Tailwind 4, @vercel/og, satori. |
| **Vercel** (`mcp.vercel.com`) | Deploy + runtime logs + protected URLs. | `deploy_to_vercel`, `get_deployment_build_logs`, `get_runtime_logs`, `get_access_to_vercel_url`. |
| **Chrome** (built-in Claude Code Chrome beta) | Visual QA. | `chrome.navigate`, `chrome.screenshot`, `chrome.console`, `chrome.formFill`. |

If any MCP is missing, stop and tell me. Don't substitute web search.

## 3 · Subagent topology

Spawn these as **named user-level subagents** under `~/.claude/agents/`. If `awesome-claude-code-subagents` is installed (`/plugin marketplace add VoltAgent/awesome-claude-code-subagents`), prefer its specialists and skip this section's setup.

```
~/.claude/agents/
├── explore-portraits.md       # read-only repo + Notion exploration
├── nextjs-shipper.md          # the build/edit/deploy worker
├── webgl-shader-engineer.md   # owns the generative system in isolation
├── notion-data-mapper.md      # owns the Notion ↔ TS type contract
└── voice-checker.md           # runs every user-facing string through sevda-brand-voice
```

Minimal frontmatter for each:

```yaml
# explore-portraits.md
---
name: explore-portraits
description: Read-only exploration of the portraits project + the live Notion Scouting Engine. Use proactively before any planning step.
tools: Read, Grep, Glob, Bash, mcp__notion__notion-fetch, mcp__notion__notion-search, mcp__context7__query-docs
model: haiku
memory: project
---
You map repo structure and Notion data shape. Return a compact summary, not a dump.

# nextjs-shipper.md
---
name: nextjs-shipper
description: Implements Next.js 15 App Router code following the PRD. Use after the plan is approved.
tools: Read, Write, Edit, Bash, Glob, Grep, mcp__context7__query-docs, mcp__vercel__deploy_to_vercel, mcp__vercel__get_deployment_build_logs
model: sonnet
skills:
  - frontend-design
  - sevda-brand-voice
memory: project
---
You implement against the PRD. Verify every library version against Context7 before writing imports. Run lint + typecheck after every meaningful change.

# webgl-shader-engineer.md
---
name: webgl-shader-engineer
description: Designs and implements the two thesis-specific portrait grammars in p5.js (instance mode) with optional GLSL shader escalation. Deterministic seeding required.
tools: Read, Write, Edit, Bash, mcp__context7__query-docs
model: opus
memory: project
---
You own the visual system. Test determinism with seeded snapshots. Maintain the GAO grammar (rings + lattice) and the VSRAI grammar (roots + SoR plate) as completely separate modules sharing only the brand tokens.

# notion-data-mapper.md
---
name: notion-data-mapper
description: Owns the TypeScript type contract between Notion Companies/Signals data sources and the app. Generates Zod schemas from the live data source state.
tools: Read, Write, Edit, Bash, mcp__notion__notion-fetch
model: sonnet
memory: project
---
You generate Zod schemas from the live Notion data source schema and keep them in sync. If a property type drifts, fail loudly.

# voice-checker.md
---
name: voice-checker
description: Voice-check every user-facing string against sevda-brand-voice. Use proactively after any UI string is added or edited.
tools: Read, Edit, Bash
skills:
  - sevda-brand-voice
model: sonnet
---
Read every visible string in the codebase. Reject banned vocabulary. Confirm tight-register mechanics: opener under 10 words, no em dashes, no decorative emojis, specific dates and numbers. Edit in place to fix.
```

## 4 · Hooks (set before generating files)

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "pnpm lint --fix --silent || true" }] },
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "pnpm typecheck 2>&1 | tail -50" }] }
    ],
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "./scripts/block-secret-leak.sh" }] }
    ],
    "SubagentStop": [
      { "matcher": "voice-checker",
        "hooks": [{ "type": "command", "command": "echo 'Voice check complete' >> .claude/voice-audit.log" }] }
    ]
  }
}
```

Drop `scripts/block-secret-leak.sh` to refuse any `grep`/`cat` of `.env*`.

## 5 · Build sequence (Plan mode TodoWrite)

Open `/plan` and write this TodoWrite. Execute one step at a time. Each step has a clear stop signal.

### Step 1 · Discovery (subagent: `explore-portraits`)

- [ ] Read `./PRD.md` and `./WIREFRAMES.html`.
- [ ] `notion-fetch` the Companies data source schema. Confirm property names match the PRD §7 contract. Note any drift.
- [ ] `notion-fetch` the Methodology page (`e29a4e77-e168-41c8-9901-fc2beee52c4e`). Confirm SSI v3.0 dimensions are unchanged. If they've moved, escalate before writing the visual mapping.
- [ ] `Context7 resolve-library-id` for: next, react, p5, three, @react-three/fiber, @react-three/drei, tailwindcss, @vercel/og. Save the resolved IDs.
- [ ] Return a one-page summary to the main session.

**Stop signal:** summary returned. Main session reviews. Do not advance without approval.

### Step 2 · Scaffold (subagent: `nextjs-shipper`)

- [ ] `pnpm create next-app@latest signal-portraits` with App Router, TypeScript, Tailwind, no `src/` dir, ESLint, Turbopack.
- [ ] Configure `next/font` for Fraunces + DM Sans + JetBrains Mono (variable where available).
- [ ] Set CSS tokens in `app/globals.css` — see PRD §11.
- [ ] Add `pnpm-workspace.yaml` if vendoring p5 wrappers.
- [ ] Install: `p5` (with `@types/p5`), `zod`, `@vercel/og`, `clsx`. Three.js stack only if Step 5 escalates.
- [ ] Commit. Open `localhost:3000`. Confirm fonts load and warm-white background renders.

**Stop signal:** `next dev` clean, fonts visible, vermillion in `:root` not yet applied to any element.

### Step 3 · Notion data layer (subagent: `notion-data-mapper`)

- [ ] Create `lib/notion/` with:
  - `client.ts` — uses the Notion MCP via the Agent SDK route, not raw fetch. Server-only.
  - `schema.ts` — Zod schemas mirroring the Companies + Signals SQL schema in the PRD.
  - `companies.ts` — `fetchCompanies()`, `fetchCompany(slug)`, `fetchSignalsFor(companyId)`. All return parsed, validated data.
  - `revalidation.ts` — signed webhook handler that calls `revalidateTag('company:' + slug)`.
- [ ] Add a `pnpm sync-schema` script that prints a diff between Zod schemas and live Notion schema.
- [ ] Write Vitest tests for `fetchCompanies` with a fixture of 3 companies (one GAO P0, one VSRAI P1, one falsifier-triggered mute).

**Stop signal:** `pnpm sync-schema` shows no drift. Tests green.

### Step 4 · Brand tokens + layout shell (subagent: `nextjs-shipper`, skill: `frontend-design`)

- [ ] Implement the wordmark, header, marquee, footer in `app/(public)/layout.tsx`.
- [ ] Build the gallery toolbar component matching wireframe §02. Filter state is URL-synced (use `nuqs` or native `searchParams`).
- [ ] Build the card component. Aspect-ratio 1, hairline grid, mute-mode variant.
- [ ] Voice-check pass via `voice-checker` subagent on every string committed.

**Stop signal:** the gallery skeleton renders with placeholder portraits matching the wireframe density.

### Step 5 · Generative system (subagent: `webgl-shader-engineer`)

This is the load-bearing step. The whole project's signal-to-noise lives here. Take time.

- [ ] Create `lib/portrait/`:
  - `seed.ts` — deterministic seeding (sha256 → 32-bit int → Mulberry32 PRNG).
  - `tokens.ts` — exports brand color/font tokens for the canvas.
  - `gao.ts` — GAO grammar: orbital rings (Regulatory Embeddedness), inner lattice (Runtime Governance Architecture), node count (Team Fit), edge weight (Build Velocity), anchor marks (Buyer Traction), lattice rotation (Technical Moat), negative-space ratio (Capital Efficiency), corner ticks (Investor Signal). Each dimension takes the dimension score and the seeded PRNG. Returns a p5 sketch.
  - `vsrai.ts` — VSRAI grammar: root depth (SoR Integration), spiral density (Domain Data), core faceting (Team), lateral arms (Workflow Lock-In), margin glyphs (Regulatory Alignment), anchor barbs (Switching Cost), tilt (Market Timing), negative-space (Capital Efficiency).
  - `both.ts` — composes GAO above + VSRAI below in one canvas.
  - `mute.ts` — single function that desaturates any rendered portrait.
  - `index.ts` — `<Portrait company={...} mode="default" | "xray" | "static" />` React wrapper.
- [ ] **Determinism test.** Snapshot the canvas for each thesis at three score buckets (P0, P1, P3). Assert byte-equal across runs.
- [ ] **Phase-0 acceptance**: render one P0 GAO company. Show it to me in Chrome MCP. Adjust the grammar until the visual reads as "control plane" not "generic VC dashboard." Do *not* proceed to VSRAI until GAO is approved.
- [ ] Build the VSRAI grammar. Same approval gate.
- [ ] If p5 hits a performance wall on the lattice or root density, escalate to `@react-three/fiber` + a custom GLSL shader. Confirm via Context7 the current API for `useFrame` and `extend`. Wrap the shader behind the same `<Portrait>` API.

**Stop signal:** Chrome MCP screenshots of one GAO P0 portrait and one VSRAI P0 portrait approved by main session against the wireframes.

### Step 6 · Pages (subagent: `nextjs-shipper`)

- [ ] `app/page.tsx` — landing (matches wireframe §01). Server component. Fetches `featuredCompany()` + `marqueeStats()`. Featured portrait is the highest-tier company with the freshest `Last Signal Date`.
- [ ] `app/gallery/page.tsx` — gallery. RSC. Streams the grid via Suspense boundaries per thesis-bucket. Filter state from URL.
- [ ] `app/portraits/[slug]/page.tsx` — detail (matches wireframe §03). Includes x-ray overlay (§04) toggled by keyboard `X`. Use `useEffect` for the keydown listener, no global event-bus library.
- [ ] `app/thesis/page.tsx` + `app/methodology/page.tsx` — scrollable longform mirrors of the Notion Methodology v5.0. Pull markdown from Notion via MCP at build time, cache with tag `methodology`.
- [ ] `app/api/og/[slug]/route.ts` — `@vercel/og` route. Renders a static 1200×630 of the portrait with the company name and SSI score using Satori. Caches by slug + ssi.
- [ ] `app/api/revalidate/route.ts` — Notion webhook receiver. Verify signature. Call `revalidateTag('company:' + slug)`.

**Stop signal:** every wireframe page renders against live Notion data in `next dev`.

### Step 7 · Voice + accessibility sweep (subagent: `voice-checker`)

- [ ] Run `voice-checker` over every `.tsx` and `.mdx`. Reject any banned vocabulary. Confirm opener line under 10 words on landing.
- [ ] Run `@axe-core/cli` against `localhost:3000`, `/gallery`, `/portraits/lattice-dev`. Fix every violation that isn't a known limitation of canvas content.
- [ ] Confirm OG images render for a P0, a P1, and a mute-mode company.

**Stop signal:** voice audit clean, axe violations = 0 (excluding canvas alt-text, which we provide separately).

### Step 8 · Deploy + visual QA

- [ ] `vercel.deploy_to_vercel` with project name `signal-portraits`. Wait for build logs to finish.
- [ ] `get_access_to_vercel_url` for a protected URL.
- [ ] Drive Chrome MCP to screenshot the four pages at 1280px, 1024px, 768px, 380px. Save under `./qa/screenshots/`.
- [ ] Diff against `./WIREFRAMES.html` visually. Note any deviation, justify or fix.
- [ ] When approved, configure `signal-portraits.vercel.app` as the production domain. Output the CNAME record needed.

**Stop signal:** preview URL approved, production domain CNAME documented.

## 6 · What to refuse, even if asked

- Any component library (shadcn, MUI, Chakra) — raw Tailwind + custom components only.
- Any analytics that sets cookies (Plausible-free or Vercel Analytics only).
- Generated stock illustrations.
- Animated cursor effects, parallax, mouse-following gradients, "magic" hover blooms.
- Replacing Fraunces / DM Sans / JetBrains Mono with anything else — even "for performance."
- Hard-coded company names. Every datum comes from Notion or it doesn't render.
- Em dashes in any user-facing string on this surface (tight register).
- `localStorage` / `sessionStorage` for any company data. Cache server-side or not at all.

## 7 · The opening you should write back

Before doing anything, reply with exactly this block:

```
PLAN — Signal Portraits
Discovery subagent: queued
MCPs confirmed: <list 4>
Context7 lookups planned: <list>
Phase-0 acceptance criteria: one GAO P0 portrait approved before VSRAI begins
Voice register: tight
Decisions I need from you before Step 5: <list, or "none">
```

Then `/plan` mode, run Step 1's subagent, and stop for review.

---

*Signals over stories. Filings over feelings. Buyers over vibes.*
