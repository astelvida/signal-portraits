import type { Company } from "@/lib/notion/schema";
import { mulberry32, scale, randInt } from "./seed";

/**
 * SSI v3.0 dimension vectors.
 *
 * Phase-2 contract: per-dimension scores will land as first-class columns on the Companies DB
 * (one-time migration in the Scouting Engine). Until then, we synthesize an 8-vector
 * deterministically from (ssiScore, signalCount, seed) so portraits still vary meaningfully.
 *
 * The synthetic vector preserves: (a) total ≈ ssiScore, (b) per-dimension caps from the PRD,
 * (c) determinism for the same inputs.
 */

// `visualNote` explains how each dimension shows up in the portrait (PRD §8.1/§8.2).
// Read on the methodology page so a viewer can decode a portrait without the PRD.
export const GAO_DIMS = [
  {
    key: "regEmbed",
    label: "Regulatory Embeddedness",
    max: 20,
    visualNote:
      "Orbital rings around the core. One ring per regulator, sandbox, or standards body the company touches. Ring radius scales with the score.",
  },
  {
    key: "runtimeGov",
    label: "Runtime Governance Architecture",
    max: 18,
    visualNote:
      "The inner policy lattice. A high score draws a fine grid of cells; a low score draws a sparse one.",
  },
  {
    key: "teamFit",
    label: "Regulatory-Technical Team Fit",
    max: 15,
    visualNote:
      "Node count on the central glyph. One node per credible institutional pedigree: ex-regulator, security lead, compliance ops.",
  },
  {
    key: "buildVelocity",
    label: "Governance Build Velocity",
    max: 12,
    visualNote:
      "Lattice stroke weight. Heavier lines mean more governance features actually shipped.",
  },
  {
    key: "buyerTraction",
    label: "Enterprise Buyer Traction",
    max: 12,
    visualNote:
      "Vermillion anchor marks at lattice intersections. One anchor per named regulated buyer.",
  },
  {
    key: "technicalMoat",
    label: "Technical Moat",
    max: 10,
    visualNote:
      "Lattice rotation angle. Zero degrees reads as a wrapper; up to 45 degrees reads as a differentiated runtime.",
  },
  {
    key: "capitalEff",
    label: "Capital Efficiency",
    max: 8,
    visualNote:
      "Negative-space ratio. A higher score leaves more whitespace around the structure, which reads as confidence.",
  },
  {
    key: "investorSignal",
    label: "Investor Signal Quality",
    max: 5,
    visualNote:
      "Corner ticks at the canvas edges. One tick per mission-aligned investor on the cap table.",
  },
] as const;
export type GAODimKey = (typeof GAO_DIMS)[number]["key"];
export type GAOVector = Record<GAODimKey, number>;

export const VSRAI_DIMS = [
  {
    key: "sorIntegration",
    label: "System-of-Record Integration Depth",
    max: 20,
    visualNote:
      "Root threads descending into a system-of-record plate at the canvas foot. More integration means more roots, reaching deeper.",
  },
  {
    key: "domainData",
    label: "Domain Data Advantage",
    max: 18,
    visualNote:
      "Spiral density around the core. A tight spiral reads as a compounding proprietary-data flywheel.",
  },
  {
    key: "teamPedigree",
    label: "Team Domain Pedigree",
    max: 15,
    visualNote:
      "Core node faceting. One facet per founder or hire native to the regulated domain.",
  },
  {
    key: "workflowLockIn",
    label: "Workflow Lock-In Evidence",
    max: 12,
    visualNote:
      "Lateral arms reaching out from the core. One arm per integrated department or role.",
  },
  {
    key: "regAlignment",
    label: "Regulatory Alignment",
    max: 12,
    visualNote:
      "Margin glyphs keyed to the catalyst regulation: EHDS, DORA, AMLA, MDR, or IVDR.",
  },
  {
    key: "switchingCost",
    label: "Switching Cost Architecture",
    max: 10,
    visualNote:
      "Anchor barbs on the root threads. The harder the company is to rip out, the more barbs.",
  },
  {
    key: "marketTiming",
    label: "Market Timing",
    max: 8,
    visualNote:
      "Asymmetric tilt of the core. A higher score leans the structure further forward.",
  },
  {
    key: "capitalEff",
    label: "Capital Efficiency",
    max: 5,
    visualNote:
      "Negative-space ratio, the same convention as the GAO grammar.",
  },
] as const;
export type VSRAIDimKey = (typeof VSRAI_DIMS)[number]["key"];
export type VSRAIVector = Record<VSRAIDimKey, number>;

/**
 * Synthesize a GAO 8-vector from the company's top-line SSI score + a deterministic seed.
 *
 * Strategy:
 * 1. Each dimension gets a base value = (ssiScore / 100) * maxDim.
 * 2. We perturb each by ±20% using the PRNG, keeping the rounded total close to ssiScore.
 * 3. Hard-clamp to [0, max].
 */
export function synthGAOVector(company: Pick<Company, "ssiScore" | "signals">, seed: number): GAOVector {
  const rng = mulberry32(seed);
  const t = Math.max(0, Math.min(1, company.ssiScore / 100));
  const signalLift = Math.min(0.15, company.signals.length * 0.015);
  const out: Partial<GAOVector> = {};
  for (const { key, max } of GAO_DIMS) {
    const base = (t + signalLift) * max;
    const jitter = (rng() - 0.5) * 0.4 * max;
    const value = Math.max(0, Math.min(max, Math.round(base + jitter)));
    out[key] = value;
  }
  return out as GAOVector;
}

export function synthVSRAIVector(company: Pick<Company, "ssiScore" | "signals">, seed: number): VSRAIVector {
  const rng = mulberry32(seed ^ 0xa5a5a5a5);
  const t = Math.max(0, Math.min(1, company.ssiScore / 100));
  const signalLift = Math.min(0.15, company.signals.length * 0.015);
  const out: Partial<VSRAIVector> = {};
  for (const { key, max } of VSRAI_DIMS) {
    const base = (t + signalLift) * max;
    const jitter = (rng() - 0.5) * 0.4 * max;
    const value = Math.max(0, Math.min(max, Math.round(base + jitter)));
    out[key] = value;
  }
  return out as VSRAIVector;
}

/** Helper for visual mapping: map dimension score linearly into output range. */
export function dimScale(value: number, max: number, outMin: number, outMax: number): number {
  return scale(value, max, outMin, outMax);
}

/** Convenience: integer count for ring/anchor counts, with min 0. */
export function dimCount(rng: () => number, value: number, max: number, outMin: number, outMax: number): number {
  const t = Math.max(0, Math.min(1, value / max));
  const target = outMin + t * (outMax - outMin);
  const jitter = (rng() - 0.5) * 0.5;
  return Math.max(outMin, Math.round(target + jitter));
}

export { randInt };
