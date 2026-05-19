import type { Company } from "@/lib/notion/schema";
import { TOKENS, CANVAS, FONTS } from "./tokens";
import { GAO } from "./gao";
import { VSRAI } from "./vsrai";

/**
 * Composite portrait for companies tagged `Both`: GAO on the upper half, VSRAI below.
 * Both grammars share the canvas. Both score readings can be exposed by the parent.
 */
export interface BothOptions {
  size?: number;
  showLabels?: boolean;
  muted?: boolean;
}

export function Both({ company, options = {} }: { company: Company; options?: BothOptions }) {
  const size = options.size ?? CANVAS.size;
  const halfSize = size / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Composite portrait of ${company.company}. Both theses. SSI score ${company.ssiScore}.`}
      style={{ display: "block" }}
    >
      <title>{`${company.company} — composite portrait (GAO + VSRAI)`}</title>

      <g transform={`translate(0 0) scale(1 0.5)`}>
        <foreignObject x="0" y="0" width={size} height={size}>
          <GAO company={company} options={{ size, muted: options.muted, showLabels: false }} />
        </foreignObject>
      </g>

      {/* Separator rule */}
      <line x1={size * 0.12} y1={halfSize} x2={size * 0.88} y2={halfSize} stroke={TOKENS.INK} strokeWidth={0.4} opacity={0.4} />

      <g transform={`translate(0 ${halfSize}) scale(1 0.5)`}>
        <foreignObject x="0" y="0" width={size} height={size}>
          <VSRAI company={company} options={{ size, muted: options.muted, showLabels: false }} />
        </foreignObject>
      </g>

      {/* Strap with thesis labels */}
      <g fontFamily={FONTS.mono} fontSize={8} fill={TOKENS.MUTE} letterSpacing="0.1em">
        <text x={12} y={14}>GAO</text>
        <text x={size - 12} y={size - 8} textAnchor="end">VSRAI</text>
      </g>
    </svg>
  );
}
