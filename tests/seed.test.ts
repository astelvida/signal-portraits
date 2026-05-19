import { describe, it, expect } from "vitest";
import { makeSeed, mulberry32 } from "@/lib/portrait/seed";

describe("makeSeed", () => {
  it("is deterministic across runs", () => {
    const a = makeSeed("acme-governance", "Governed Agentic Ops", 87);
    const b = makeSeed("acme-governance", "Governed Agentic Ops", 87);
    expect(a).toBe(b);
  });

  it("changes when SSI score moves by 1", () => {
    const a = makeSeed("acme-governance", "Governed Agentic Ops", 87);
    const b = makeSeed("acme-governance", "Governed Agentic Ops", 88);
    expect(a).not.toBe(b);
  });

  it("changes when thesis changes", () => {
    const a = makeSeed("acme-governance", "Governed Agentic Ops", 87);
    const b = makeSeed("acme-governance", "Vertical SoR AI", 87);
    expect(a).not.toBe(b);
  });

  it("returns an unsigned 32-bit int", () => {
    const seed = makeSeed("x", "Both", 50);
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("mulberry32", () => {
  it("is deterministic for same seed", () => {
    const r1 = mulberry32(123);
    const r2 = mulberry32(123);
    const a = [r1(), r1(), r1(), r1()];
    const b = [r2(), r2(), r2(), r2()];
    expect(a).toEqual(b);
  });

  it("produces different sequences for different seeds", () => {
    const r1 = mulberry32(1);
    const r2 = mulberry32(2);
    expect(r1()).not.toBe(r2());
  });

  it("returns values in [0, 1)", () => {
    const r = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
