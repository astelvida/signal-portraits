import { describe, it, expect } from "vitest";
import {
  CompanySchema,
  isMuted,
  slugify,
  type Company,
} from "@/lib/notion/schema";

const baseFixture = {
  id: "fixture-1",
  company: "Acme Governance",
  slug: "acme-governance",
  thesis: "Governed Agentic Ops" as const,
  sector: "FinServices AI" as const,
  stage: "Seed" as const,
  hq: "London, UK",
  headcount: 18,
  founded: 2024,
  lastRaise: "€7.5M seed led by Mouro Capital · Jan 2026",
  ssiScore: 87,
  signalTier: "🔴 Highest Conviction" as const,
  priority: "P0" as const,
  discoverySource: "regscan" as const,
  falsifierCheck: "✅ Clean" as const,
  antithesisFilter: "Clear" as const,
  sourceConfidence: "High" as const,
  oneLiner: "Runtime governance for autonomous workflows in regulated finance.",
  keySignal30d: "DORA-aligned audit pack shipped 4 Apr 2026.",
  catalystWindowDays: 0,
  lastVerified: "2026-05-19",
  lastScored: "2026-05-18",
  signals: ["sig-a", "sig-b", "sig-c"],
  primaryCatalyst: "cat-dora",
  marketMapSubSegment: "mm-gao-banking",
  lastSignalDate: "2026-05-19",
};

describe("CompanySchema", () => {
  it("parses a P0 GAO company", () => {
    const parsed = CompanySchema.parse(baseFixture);
    expect(parsed.company).toBe("Acme Governance");
    expect(parsed.thesis).toBe("Governed Agentic Ops");
    expect(parsed.ssiScore).toBe(87);
    expect(parsed.signals).toHaveLength(3);
  });

  it("parses a P1 VSRAI company with anti-thesis 1 Flag", () => {
    const co: Company = CompanySchema.parse({
      ...baseFixture,
      id: "fixture-2",
      company: "Lattice Dev",
      slug: "lattice-dev",
      thesis: "Vertical SoR AI",
      sector: "MedTech AI",
      ssiScore: 76,
      signalTier: "🟠 Strong",
      priority: "P1",
      falsifierCheck: "✅ Clean",
      antithesisFilter: "1 Flag",
    });
    expect(co.thesis).toBe("Vertical SoR AI");
    expect(isMuted(co)).toBe(false);
  });

  it("flags a Falsifier-Triggered company as muted", () => {
    const co = CompanySchema.parse({
      ...baseFixture,
      id: "fixture-3",
      company: "Redflag Co",
      slug: "redflag-co",
      thesis: "Vertical SoR AI",
      ssiScore: 62,
      signalTier: "🟡 Emerging",
      priority: "P2",
      falsifierCheck: "❌ Triggered",
      antithesisFilter: "Clear",
    });
    expect(isMuted(co)).toBe(true);
  });

  it("flags an Auto-pass anti-thesis company as muted", () => {
    const co = CompanySchema.parse({
      ...baseFixture,
      id: "fixture-4",
      antithesisFilter: "Auto-pass",
    });
    expect(isMuted(co)).toBe(true);
  });

  it("slugifies company names deterministically", () => {
    expect(slugify("Acme Governance")).toBe("acme-governance");
    expect(slugify("Çırağan / The Bank.AI")).toBe("ciragan-the-bank-ai");
    expect(slugify("  Trailing  Space  ")).toBe("trailing-space");
  });
});
