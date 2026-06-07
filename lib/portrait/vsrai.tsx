import type { Company } from "@/lib/notion/schema";
import { TOKENS, CANVAS, FONTS } from "./tokens";
import { makeSeed, mulberry32, pick } from "./seed";
import { vsraiVector, dimScale, dimCount } from "./dimensions";

/**
 * VSRAI — Workflow Gravity grammar (PRD §8.2).
 *
 * Reads like a system-of-record cross-section: a faceted core node, spiral data lines,
 * lateral arms (workflow integrations) reaching outward, vertical root threads
 * descending into an SoR plate at the bottom, with anchor barbs marking
 * switching-cost depth. Margin glyphs name the catalyst.
 *
 * Structurally distinct from GAO. Must NOT read as a variant of the lattice.
 */

const CATALYST_GLYPHS: Record<string, string> = {
  EHDS: "EHDS",
  DORA: "DORA",
  AMLA: "AMLA",
  MDR: "MDR",
  IVDR: "IVDR",
  NIS2: "NIS2",
  GDPR: "GDPR",
  "EU AI Act": "AI ACT",
  "MiFID II": "MiFID2",
};

export interface VSRAIOptions {
  size?: number;
  showLabels?: boolean;
  muted?: boolean;
  catalystKey?: string;
}

export function VSRAI({ company, options = {} }: { company: Company; options?: VSRAIOptions }) {
  const size = options.size ?? CANVAS.size;
  const seed = makeSeed(company.slug, company.thesis, company.ssiScore);
  const rng = mulberry32(seed);
  const v = vsraiVector(company, seed);
  const accent = options.muted ? TOKENS.MUTE : TOKENS.ACCENT;
  const inkSoft = options.muted ? TOKENS.MUTE : TOKENS.INK;

  // Layout regions
  const padding = options.muted ? 64 : dimScale(v.capitalEff, 5, 30, 64);
  const cx = size / 2;
  // Core sits high; roots descend to the SoR plate at the bottom
  const coreY = size * 0.32;
  const platY = size - padding;
  const coreRadius = 32;

  // Dimension mappings
  const rootThreads = Math.max(2, Math.min(9, dimCount(rng, v.sorIntegration, 20, 2, 9)));
  const spiralTurns = dimScale(v.domainData, 18, 0.5, 3.5);
  const spiralPoints = Math.max(12, Math.round(dimScale(v.domainData, 18, 18, 60)));
  const coreFacets = Math.max(3, Math.min(8, dimCount(rng, v.teamPedigree, 15, 3, 8)));
  const lateralArms = Math.max(0, Math.min(8, dimCount(rng, v.workflowLockIn, 12, 0, 8)));
  const marginGlyphCount = Math.max(0, Math.min(3, dimCount(rng, v.regAlignment, 12, 0, 3)));
  const barbCount = Math.max(0, Math.min(5, dimCount(rng, v.switchingCost, 10, 0, 5)));
  const tilt = dimScale(v.marketTiming, 8, -2, 14); // degrees, forward lean

  // Catalyst glyph text. Sector was removed in SSI v3.0, so the catalyst comes
  // from the caller (detail page derives it from thesis) or defaults to AI ACT.
  const catalystText =
    (options.catalystKey && CATALYST_GLYPHS[options.catalystKey]) || "EU AI ACT";

  // Build core polygon (faceted, tilted)
  const corePts = Array.from({ length: coreFacets }, (_, i) => {
    const angle = (i / coreFacets) * Math.PI * 2 - Math.PI / 2;
    const r = coreRadius * (0.85 + 0.15 * Math.cos(angle * 2 + rng() * 0.3));
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
  const polyPath = corePts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";

  // Spiral path around the core (logarithmic-ish, deterministic)
  const spiralPathPoints: Array<[number, number]> = [];
  for (let i = 0; i < spiralPoints; i++) {
    const t = i / spiralPoints;
    const angle = t * Math.PI * 2 * spiralTurns;
    const r = coreRadius * 0.6 + t * (size * 0.18);
    spiralPathPoints.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }
  const spiralPath = spiralPathPoints
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  // Lateral arms: arms reach outward to integration endpoints
  const arms = Array.from({ length: lateralArms }, (_, i) => {
    const isLeft = i % 2 === 0;
    const yOffset = (rng() - 0.5) * 30;
    const reach = size * 0.32 + rng() * 30;
    return {
      x1: 0,
      y1: yOffset,
      x2: (isLeft ? -1 : 1) * reach,
      y2: yOffset + (rng() - 0.5) * 20,
    };
  });

  // Root threads descending to SoR plate
  const rootGap = (size * 0.6) / Math.max(1, rootThreads - 1);
  const rootStartX = cx - (rootThreads - 1) * rootGap * 0.5;
  const roots = Array.from({ length: rootThreads }, (_, i) => {
    const x = rootStartX + i * rootGap;
    const jitter = (rng() - 0.5) * 18;
    return {
      x1: cx + (x - cx) * 0.12, // converge near core
      y1: coreY + coreRadius * 0.5,
      x2: x + jitter,
      y2: platY,
    };
  });

  // Barbs along the roots (anchored to switching cost)
  const barbs: Array<{ x: number; y: number; dx: number }> = [];
  for (let i = 0; i < barbCount; i++) {
    const rootIdx = Math.floor(rng() * roots.length);
    const r = roots[rootIdx];
    if (!r) continue;
    const t = 0.3 + rng() * 0.55;
    const x = r.x1 + (r.x2 - r.x1) * t;
    const y = r.y1 + (r.y2 - r.y1) * t;
    const dx = (rng() > 0.5 ? 1 : -1) * (3 + rng() * 4);
    barbs.push({ x, y, dx });
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Portrait of ${company.company}. Vertical SoR AI thesis. SSI score ${company.ssiScore}.`}
      style={{ display: "block" }}
    >
      <title>{`${company.company} — VSRAI portrait`}</title>
      <desc>
        {`Workflow Gravity grammar. ${rootThreads} root threads into SoR plate, ${spiralTurns.toFixed(1)}-turn data spiral, ${coreFacets}-facet core tilted ${Math.round(tilt)}°, ${lateralArms} lateral arms, ${barbCount} anchor barbs. SSI ${company.ssiScore}.`}
      </desc>

      <defs>
        <filter id={`grain-v-${company.id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed % 1000} />
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.04 0" />
        </filter>
      </defs>

      {/* Margin glyphs (catalyst keys) on left and right margins */}
      {marginGlyphCount > 0 && options.showLabels !== false && (
        <g fontFamily={FONTS.mono} fontSize={9} fill={TOKENS.MUTE} letterSpacing="0.08em">
          <text x={padding * 0.6} y={size * 0.5} textAnchor="middle" transform={`rotate(-90 ${padding * 0.6} ${size * 0.5})`}>
            {catalystText}
          </text>
          {marginGlyphCount > 1 && (
            <text
              x={size - padding * 0.6}
              y={size * 0.5}
              textAnchor="middle"
              transform={`rotate(90 ${size - padding * 0.6} ${size * 0.5})`}
            >
              {catalystText}
            </text>
          )}
          {marginGlyphCount > 2 && (
            <text x={cx} y={padding * 0.6} textAnchor="middle">
              {catalystText}
            </text>
          )}
        </g>
      )}

      {/* Roots descending into the SoR plate */}
      <g stroke={inkSoft} strokeWidth={0.7} fill="none">
        {roots.map((r, i) => (
          <line key={`root-${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
        ))}
      </g>

      {/* Anchor barbs on roots */}
      <g stroke={accent} strokeWidth={1.2}>
        {barbs.map((b, i) => (
          <line key={`barb-${i}`} x1={b.x} y1={b.y} x2={b.x + b.dx} y2={b.y - 2} />
        ))}
      </g>

      {/* SoR plate at bottom — solid stroke, the literal system-of-record */}
      <g stroke={inkSoft} strokeWidth={2} fill="none">
        <line x1={padding} y1={platY} x2={size - padding} y2={platY} />
      </g>
      {/* Small tick marks above the plate showing the writeback nature */}
      <g stroke={inkSoft} strokeWidth={0.6}>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = padding + (i / 11) * (size - 2 * padding);
          return <line key={`tick-${i}`} x1={x} y1={platY - 4} x2={x} y2={platY} />;
        })}
      </g>

      {/* Core + spiral, tilted forward (positive tilt = forward lean) */}
      <g transform={`translate(${cx} ${coreY}) rotate(${tilt})`}>
        {/* Lateral arms */}
        <g stroke={inkSoft} strokeWidth={0.7}>
          {arms.map((a, i) => (
            <line key={`arm-${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
          ))}
        </g>

        {/* Data spiral around core */}
        <path d={spiralPath} fill="none" stroke={inkSoft} strokeWidth={0.5} opacity={0.65} />

        {/* Faceted core polygon */}
        <path d={polyPath} fill={TOKENS.WARM_WHITE} stroke={inkSoft} strokeWidth={1.2} />
        {/* Core accent inset (vermillion when not muted) */}
        <path
          d={polyPath}
          fill={accent}
          transform="scale(0.42)"
        />
      </g>

      {/* Grain wash */}
      <rect x="0" y="0" width={size} height={size} fill="transparent" filter={`url(#grain-v-${company.id})`} />
    </svg>
  );
}
