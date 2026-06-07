import type { Company } from "@/lib/notion/schema";
import { TOKENS, CANVAS, FONTS } from "./tokens";
import { makeSeed, mulberry32, pick } from "./seed";
import { gaoVector, dimScale, dimCount, GAO_DIMS } from "./dimensions";

/**
 * GAO — Governance Grid grammar (PRD §8.1).
 *
 * Reads like a control-plane schematic: orbital rings (regulators) around an
 * inner lattice (policy cells), node-count central glyph (team), anchor marks
 * (buyers), corner ticks (investors). Vermillion is used sparingly on anchors,
 * the central glyph fill, and corner ticks.
 */

const REGULATOR_LABELS = ["EU AI ACT", "DORA", "NIS2", "CEN-CENELEC", "AMLA", "MDR", "MiFID II", "GDPR"];

export interface GAOOptions {
  size?: number;
  showLabels?: boolean;
  muted?: boolean;
}

export function GAO({ company, options = {} }: { company: Company; options?: GAOOptions }) {
  const size = options.size ?? CANVAS.size;
  const center = size / 2;
  const seed = makeSeed(company.slug, company.thesis, company.ssiScore);
  const rng = mulberry32(seed);
  const v = gaoVector(company, seed);
  const accent = options.muted ? TOKENS.MUTE : TOKENS.ACCENT;
  const inkSoft = options.muted ? TOKENS.MUTE : TOKENS.INK;

  // Dimension → visual mappings
  const ringCount = Math.max(1, Math.min(5, dimCount(rng, v.regEmbed, 20, 1, 5)));
  const latticeCells = Math.max(2, Math.min(10, dimCount(rng, v.runtimeGov, 18, 2, 10)));
  const teamNodes = Math.max(1, Math.min(6, dimCount(rng, v.teamFit, 15, 1, 6)));
  const strokeBase = dimScale(v.buildVelocity, 12, 0.4, 1.4);
  const buyerAnchors = Math.max(0, Math.min(8, dimCount(rng, v.buyerTraction, 12, 0, 8)));
  const latticeRotation = dimScale(v.technicalMoat, 10, 0, 45);
  const negSpacePad = options.muted ? 60 : dimScale(v.capitalEff, 8, 25, 60); // larger pad = more negative space
  const investorTicks = Math.max(0, Math.min(4, dimCount(rng, v.investorSignal, 5, 0, 4)));

  // Geometry math
  const maxRingRadius = (size / 2) - negSpacePad;
  const ringStep = maxRingRadius * 0.18;
  const latticeSize = maxRingRadius * 1.05; // inner lattice fills the central area inside the rings
  const latticeOrigin = center - latticeSize / 2;
  const cellStep = latticeSize / latticeCells;

  // Choose deterministic regulator label slots for the visible rings (max 4 labelled)
  const labelledRings = Math.min(ringCount, 4);
  const labels: Array<{ x: number; y: number; text: string; anchor: "start" | "end" }> = [];
  const pool = [...REGULATOR_LABELS];
  for (let i = 0; i < labelledRings; i++) {
    const text = pick(rng, pool);
    pool.splice(pool.indexOf(text), 1);
    const r = maxRingRadius - i * ringStep;
    const angleSeed = rng() * Math.PI * 2;
    const x = center + Math.cos(angleSeed) * r;
    const y = center + Math.sin(angleSeed) * r;
    labels.push({ x, y, text, anchor: x > center ? "start" : "end" });
  }

  // Anchor mark positions on lattice intersections
  const anchors: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < buyerAnchors; i++) {
    const col = Math.floor(rng() * (latticeCells - 1)) + 1;
    const row = Math.floor(rng() * (latticeCells - 1)) + 1;
    const x = latticeOrigin + col * cellStep - 2;
    const y = latticeOrigin + row * cellStep - 2;
    if (!anchors.some((a) => Math.abs(a.x - x) < 3 && Math.abs(a.y - y) < 3)) {
      anchors.push({ x, y });
    }
  }

  // Team nodes: small circles on the central glyph
  const teamCircles = Array.from({ length: teamNodes }, (_, i) => {
    const angle = (i / teamNodes) * Math.PI * 2;
    const r = 9;
    return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
  });

  // Stale flag: small triangle in the top-right margin
  const showStale = false; // wired in the wrapper

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Portrait of ${company.company}. Governed Agentic Ops thesis. SSI score ${company.ssiScore}.`}
      style={{ display: "block" }}
    >
      <title>{`${company.company} — GAO portrait`}</title>
      <desc>
        {`Governed Agentic Ops grammar. ${ringCount} orbital rings (regulators), ${latticeCells}×${latticeCells} policy lattice, ${teamNodes} team nodes, ${buyerAnchors} buyer anchors, lattice rotated ${Math.round(latticeRotation)}°. SSI ${company.ssiScore}.`}
      </desc>

      <defs>
        <filter id={`grain-${company.id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed % 1000} />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.04 0"
          />
        </filter>
      </defs>

      {/* Orbital rings */}
      <g transform={`translate(${center} ${center})`} fill="none" stroke={inkSoft} strokeWidth={strokeBase * 0.6}>
        {Array.from({ length: ringCount }).map((_, i) => (
          <circle key={`ring-${i}`} r={maxRingRadius - i * ringStep} />
        ))}
      </g>

      {/* Ring labels (regulator names) */}
      {options.showLabels !== false && (
        <g fontFamily={FONTS.mono} fontSize={6} fill={TOKENS.MUTE} letterSpacing="0.05em">
          {labels.map((l, i) => (
            <text key={`label-${i}`} x={l.x} y={l.y} textAnchor={l.anchor}>
              {l.text}
            </text>
          ))}
        </g>
      )}

      {/* Inner lattice */}
      <g
        transform={`translate(${latticeOrigin} ${latticeOrigin}) rotate(${latticeRotation} ${latticeSize / 2} ${latticeSize / 2})`}
        stroke={inkSoft}
        strokeWidth={strokeBase}
        fill="none"
      >
        {Array.from({ length: latticeCells + 1 }).map((_, i) => (
          <g key={`grid-${i}`}>
            <line x1={0} y1={i * cellStep} x2={latticeSize} y2={i * cellStep} />
            <line x1={i * cellStep} y1={0} x2={i * cellStep} y2={latticeSize} />
          </g>
        ))}
        {/* Anchor marks (buyers) — vermillion squares at lattice intersections */}
        <g fill={accent} stroke="none">
          {anchors.map((a, i) => (
            <rect key={`anchor-${i}`} x={a.x - latticeOrigin} y={a.y - latticeOrigin} width="4" height="4" />
          ))}
        </g>
      </g>

      {/* Central glyph */}
      <g transform={`translate(${center} ${center})`}>
        <polygon
          points="-13,0 0,-13 13,0 0,13"
          fill={TOKENS.WARM_WHITE}
          stroke={inkSoft}
          strokeWidth={1}
        />
        <polygon points="-6,0 0,-6 6,0 0,6" fill={accent} />
        {teamCircles.map((t, i) => (
          <circle key={`team-${i}`} cx={t.x - center} cy={t.y - center} r={1.2} fill={inkSoft} />
        ))}
      </g>

      {/* Corner ticks (investor signals) */}
      <g stroke={accent} strokeWidth={1} fill="none">
        {investorTicks > 0 && (
          <>
            <line x1={negSpacePad - 8} y1={negSpacePad - 8} x2={negSpacePad + 6} y2={negSpacePad - 8} />
            <line x1={negSpacePad - 8} y1={negSpacePad - 8} x2={negSpacePad - 8} y2={negSpacePad + 6} />
          </>
        )}
        {investorTicks > 1 && (
          <>
            <line x1={size - negSpacePad + 8} y1={negSpacePad - 8} x2={size - negSpacePad - 6} y2={negSpacePad - 8} />
            <line x1={size - negSpacePad + 8} y1={negSpacePad - 8} x2={size - negSpacePad + 8} y2={negSpacePad + 6} />
          </>
        )}
        {investorTicks > 2 && (
          <>
            <line x1={negSpacePad - 8} y1={size - negSpacePad + 8} x2={negSpacePad + 6} y2={size - negSpacePad + 8} />
            <line x1={negSpacePad - 8} y1={size - negSpacePad + 8} x2={negSpacePad - 8} y2={size - negSpacePad - 6} />
          </>
        )}
        {investorTicks > 3 && (
          <>
            <line x1={size - negSpacePad + 8} y1={size - negSpacePad + 8} x2={size - negSpacePad - 6} y2={size - negSpacePad + 8} />
            <line x1={size - negSpacePad + 8} y1={size - negSpacePad + 8} x2={size - negSpacePad + 8} y2={size - negSpacePad - 6} />
          </>
        )}
      </g>

      {/* Grain wash */}
      <rect x="0" y="0" width={size} height={size} fill="transparent" filter={`url(#grain-${company.id})`} />

      {showStale && (
        <g transform={`translate(${size - 30} 16)`} fill={TOKENS.MUTE}>
          <polygon points="0,8 7,0 14,8" />
        </g>
      )}
    </svg>
  );
}

/** Returns the SVG element synchronously without React, for use in @vercel/og. */
export function gaoElement({ company, options = {} }: { company: Company; options?: GAOOptions }) {
  return GAO({ company, options });
}

export { GAO_DIMS };
