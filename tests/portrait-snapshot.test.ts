import { describe, it, expect } from "vitest";
import { makeSeed, mulberry32 } from "@/lib/portrait/seed";
import { synthGAOVector, synthVSRAIVector } from "@/lib/portrait/dimensions";
import type { Company } from "@/lib/notion/schema";

const fakeCompany: Pick<Company, "slug" | "thesis" | "ssiScore" | "signals"> = {
  slug: "acme-governance",
  thesis: "Governed Agentic Ops",
  ssiScore: 87,
  signals: ["s1", "s2", "s3", "s4"],
};

describe("portrait determinism", () => {
  it("same inputs → identical 64-token PRNG sequence", () => {
    const seed = makeSeed(fakeCompany.slug, fakeCompany.thesis, fakeCompany.ssiScore);
    const r = mulberry32(seed);
    const a = Array.from({ length: 64 }, () => r());
    const r2 = mulberry32(seed);
    const b = Array.from({ length: 64 }, () => r2());
    expect(a).toEqual(b);
  });

  it("GAO synthetic vector is deterministic", () => {
    const seed = makeSeed(fakeCompany.slug, fakeCompany.thesis, fakeCompany.ssiScore);
    const v1 = synthGAOVector(fakeCompany, seed);
    const v2 = synthGAOVector(fakeCompany, seed);
    expect(v1).toEqual(v2);
  });

  it("VSRAI synthetic vector is deterministic", () => {
    const seed = makeSeed(fakeCompany.slug, "Vertical SoR AI", fakeCompany.ssiScore);
    const v1 = synthVSRAIVector(fakeCompany, seed);
    const v2 = synthVSRAIVector(fakeCompany, seed);
    expect(v1).toEqual(v2);
  });

  it("GAO vector respects per-dimension caps", () => {
    const seed = makeSeed(fakeCompany.slug, fakeCompany.thesis, 99);
    const v = synthGAOVector({ ...fakeCompany, ssiScore: 99 }, seed);
    expect(v.regEmbed).toBeLessThanOrEqual(20);
    expect(v.runtimeGov).toBeLessThanOrEqual(18);
    expect(v.teamFit).toBeLessThanOrEqual(15);
    expect(v.buildVelocity).toBeLessThanOrEqual(12);
    expect(v.buyerTraction).toBeLessThanOrEqual(12);
    expect(v.technicalMoat).toBeLessThanOrEqual(10);
    expect(v.capitalEff).toBeLessThanOrEqual(8);
    expect(v.investorSignal).toBeLessThanOrEqual(5);
  });

  it("score moving by 1 changes the synthetic vector", () => {
    const seedA = makeSeed(fakeCompany.slug, fakeCompany.thesis, 87);
    const seedB = makeSeed(fakeCompany.slug, fakeCompany.thesis, 88);
    const vA = synthGAOVector({ ...fakeCompany, ssiScore: 87 }, seedA);
    const vB = synthGAOVector({ ...fakeCompany, ssiScore: 88 }, seedB);
    expect(vA).not.toEqual(vB);
  });
});
