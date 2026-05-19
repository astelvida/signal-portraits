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

export const GAO_DIMS = [
  { key: "regEmbed", label: "Regulatory Embeddedness", max: 20 },
  { key: "runtimeGov", label: "Runtime Governance Architecture", max: 18 },
  { key: "teamFit", label: "Regulatory-Technical Team Fit", max: 15 },
  { key: "buildVelocity", label: "Governance Build Velocity", max: 12 },
  { key: "buyerTraction", label: "Enterprise Buyer Traction", max: 12 },
  { key: "technicalMoat", label: "Technical Moat", max: 10 },
  { key: "capitalEff", label: "Capital Efficiency", max: 8 },
  { key: "investorSignal", label: "Investor Signal Quality", max: 5 },
] as const;
export type GAODimKey = (typeof GAO_DIMS)[number]["key"];
export type GAOVector = Record<GAODimKey, number>;

export const VSRAI_DIMS = [
  { key: "sorIntegration", label: "System-of-Record Integration Depth", max: 20 },
  { key: "domainData", label: "Domain Data Advantage", max: 18 },
  { key: "teamPedigree", label: "Team Domain Pedigree", max: 15 },
  { key: "workflowLockIn", label: "Workflow Lock-In Evidence", max: 12 },
  { key: "regAlignment", label: "Regulatory Alignment", max: 12 },
  { key: "switchingCost", label: "Switching Cost Architecture", max: 10 },
  { key: "marketTiming", label: "Market Timing", max: 8 },
  { key: "capitalEff", label: "Capital Efficiency", max: 5 },
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
