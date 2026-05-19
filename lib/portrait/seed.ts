import { createHash } from "node:crypto";

/**
 * Deterministic 32-bit seed for a Signal Portrait.
 * Same (slug, thesis, ssi) always produces the same portrait.
 * When SSI score moves, the seed moves, so the portrait visibly shifts.
 */
export function makeSeed(slug: string, thesis: string, ssi: number): number {
  const hash = createHash("sha256")
    .update(`${slug}|${thesis}|${ssi}`)
    .digest();
  return hash.readUInt32BE(0);
}

/**
 * Mulberry32 PRNG. Tiny, deterministic, fast.
 * Returns a function that yields uniform [0, 1) floats.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Choose an element from an array deterministically. */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

/** Map a score in [0, maxScore] linearly into [outMin, outMax]. */
export function scale(score: number, maxScore: number, outMin: number, outMax: number): number {
  const t = Math.max(0, Math.min(1, score / maxScore));
  return outMin + t * (outMax - outMin);
}
