import { z } from "zod";

// SSI v3.0 thesis taxonomy (Methodology page e29a4e77-e168-41c8-9901-fc2beee52c4e, verified 19 May 2026).
export const ThesisEnum = z.enum([
  "Governed Agentic Ops",
  "Vertical SoR AI",
  "Both",
]);
export type Thesis = z.infer<typeof ThesisEnum>;

// Companies DB Sector taxonomy (12 values per PRD §7).
export const SectorEnum = z.enum([
  "AI Governance",
  "FinServices AI",
  "MedTech AI",
  "Healthcare AI",
  "Insurance AI",
  "Legal AI",
  "Workflow Infra",
  "Eval Infra",
  "Defence AI",
  "Climate AI",
  "Public Sector AI",
  "Other",
]);
export type Sector = z.infer<typeof SectorEnum>;

export const StageEnum = z.enum([
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Growth",
]);
export type Stage = z.infer<typeof StageEnum>;

export const SignalTierEnum = z.enum([
  "🔴 Highest Conviction",
  "🟠 Strong",
  "🟡 Emerging",
  "⚪ Watchlist",
]);
export type SignalTier = z.infer<typeof SignalTierEnum>;

export const PriorityEnum = z.enum(["P0", "P1", "P2", "P3"]);
export type Priority = z.infer<typeof PriorityEnum>;

export const DiscoverySourceEnum = z.enum([
  "regscan",
  "ghscan",
  "procscan",
  "talentscan",
  "eventscan",
  "manual",
  "grantscan",
  "patentscan",
  "spinoutscan",
]);
export type DiscoverySource = z.infer<typeof DiscoverySourceEnum>;

export const FalsifierCheckEnum = z.enum([
  "✅ Clean",
  "❌ Triggered",
  "⏳ Not Run",
]);
export type FalsifierCheck = z.infer<typeof FalsifierCheckEnum>;

export const AntithesisFilterEnum = z.enum([
  "Clear",
  "1 Flag",
  "Auto-pass",
  "Not Run",
]);
export type AntithesisFilter = z.infer<typeof AntithesisFilterEnum>;

export const SourceConfidenceEnum = z.enum(["High", "Medium", "Low"]);
export type SourceConfidence = z.infer<typeof SourceConfidenceEnum>;

export const CompanySchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  slug: z.string().min(1),
  thesis: ThesisEnum,
  sector: SectorEnum,
  stage: StageEnum,
  hq: z.string().nullable().default(""),
  headcount: z.number().int().nullable().default(null),
  founded: z.number().int().nullable().default(null),
  lastRaise: z.string().nullable().default(""),
  ssiScore: z.number().min(0).max(100),
  signalTier: SignalTierEnum,
  priority: PriorityEnum,
  discoverySource: DiscoverySourceEnum,
  falsifierCheck: FalsifierCheckEnum,
  antithesisFilter: AntithesisFilterEnum,
  sourceConfidence: SourceConfidenceEnum,
  oneLiner: z.string().nullable().default(""),
  keySignal30d: z.string().nullable().default(""),
  catalystWindowDays: z.number().int().nullable().default(null),
  lastVerified: z.string().nullable().default(null), // ISO date
  lastScored: z.string().nullable().default(null),
  signals: z.array(z.string()).default([]),
  primaryCatalyst: z.string().nullable().default(null),
  marketMapSubSegment: z.string().nullable().default(null),
  lastSignalDate: z.string().nullable().default(null),
});
export type Company = z.infer<typeof CompanySchema>;

// Signals data source (d67eb9f0-8bcf-443f-ba4f-2b528c4a6cb1).
export const SignalSchema = z.object({
  id: z.string(),
  title: z.string(),
  signalType: z.string().nullable().default(null),
  signalStrength: z.string().nullable().default(null),
  evidenceQuality: z.string().nullable().default(null),
  sourceUrl: z.string().nullable().default(null),
  dateDetected: z.string().nullable().default(null),
  detail: z.string().nullable().default(""),
  scoreContribution: z.number().nullable().default(null),
  pipelineCompany: z.string().nullable().default(null), // companyId
});
export type Signal = z.infer<typeof SignalSchema>;

// Mute mode: portrait renders without the vermillion accent.
// Per PRD §8.4: triggers on Falsifier ❌ Triggered or Anti-thesis Auto-pass.
export function isMuted(co: Company): boolean {
  return (
    co.falsifierCheck === "❌ Triggered" ||
    co.antithesisFilter === "Auto-pass"
  );
}

// Stale flag: Last verified > 90 days ago. Renders a stale-glyph micro-mark on the portrait.
export function isStale(co: Company, now: Date = new Date()): boolean {
  if (!co.lastVerified) return true;
  const verified = new Date(co.lastVerified);
  const ageMs = now.getTime() - verified.getTime();
  return ageMs > 90 * 24 * 60 * 60 * 1000;
}

// Deterministic slug for use in URLs and portrait seeds.
// Handles common European chars (Turkish ı/ğ/ş, Romanian ă/î/ș, German ü/ö/ä, French é/è/ê, etc.)
const TRANSLIT: Record<string, string> = {
  ı: "i", İ: "i", ğ: "g", Ğ: "g", ş: "s", Ş: "s", ç: "c", Ç: "c",
  ă: "a", Ă: "a", â: "a", Â: "a", î: "i", Î: "i", ț: "t", Ț: "t",
  ä: "a", Ä: "a", ö: "o", Ö: "o", ü: "u", Ü: "u", ß: "ss",
  é: "e", è: "e", ê: "e", ë: "e", É: "e", È: "e",
  á: "a", à: "a", À: "a", ñ: "n", Ñ: "n",
};
export function slugify(s: string): string {
  const transliterated = Array.from(s)
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("");
  return transliterated
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CATALYST_KEYS = [
  "EU AI Act",
  "DORA",
  "AMLA",
  "MDR",
  "IVDR",
  "EHDS",
  "NIS2",
  "GDPR",
  "MiFID II",
  "DSA",
  "DMA",
] as const;
export type CatalystKey = (typeof CATALYST_KEYS)[number];
