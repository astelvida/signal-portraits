import { z } from "zod";

// SSI v3.0 thesis taxonomy (Methodology page e29a4e77-e168-41c8-9901-fc2beee52c4e, verified 19 May 2026).
// Accept common label variants from the real DB. Unknown → defaults to GAO so the portrait still renders.
const THESIS_NORMALIZE: Record<string, "Governed Agentic Ops" | "Vertical SoR AI" | "Both"> = {
  "Governed Agentic Ops": "Governed Agentic Ops",
  "GAO": "Governed Agentic Ops",
  "Vertical SoR AI": "Vertical SoR AI",
  "Vertical System-of-Record AI": "Vertical SoR AI",
  "VSRAI": "Vertical SoR AI",
  "Both": "Both",
};
export const ThesisEnum = z
  .union([
    z.enum(["Governed Agentic Ops", "Vertical SoR AI", "Both"]),
    z.string().transform((s) => THESIS_NORMALIZE[s] ?? "Governed Agentic Ops"),
  ]);
export type Thesis = "Governed Agentic Ops" | "Vertical SoR AI" | "Both";

// Companies DB Sector taxonomy. PRD §7 listed 12 values; the real DB evolves.
// We keep the constant array as a TS-side hint for the UI filter chips but
// the schema accepts any string so new Notion values never break parsing.
export const KNOWN_SECTORS = [
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
] as const;
export type Sector = string;

export const KNOWN_STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Growth",
] as const;
export type Stage = string;

export const KNOWN_SIGNAL_TIERS = [
  "🔴 Highest Conviction",
  "🟠 Strong",
  "🟡 Emerging",
  "⚪ Watchlist",
] as const;
export type SignalTier = string;

// Priority MUST stay strict — we dispatch on this for tier-rank ordering
// and the gallery P0 chip styling. Unknown values fall through to P3.
export const PriorityEnum = z.enum(["P0", "P1", "P2", "P3"]).catch("P3");
export type Priority = z.infer<typeof PriorityEnum>;

export const KNOWN_DISCOVERY_SOURCES = [
  "regscan",
  "ghscan",
  "procscan",
  "talentscan",
  "eventscan",
  "manual",
  "grantscan",
  "patentscan",
  "spinoutscan",
] as const;
export type DiscoverySource = string;

// Falsifier — strict-ish: dispatch on "❌ Triggered" for mute. Unknown → Not Run.
export const FalsifierCheckEnum = z
  .enum(["✅ Clean", "❌ Triggered", "⏳ Not Run"])
  .catch("⏳ Not Run");
export type FalsifierCheck = z.infer<typeof FalsifierCheckEnum>;

// Anti-thesis — strict-ish: dispatch on "Auto-pass" for mute. Unknown → Not Run.
export const AntithesisFilterEnum = z
  .enum(["Clear", "1 Flag", "Auto-pass", "Not Run"])
  .catch("Not Run");
export type AntithesisFilter = z.infer<typeof AntithesisFilterEnum>;

export type SourceConfidence = string;

export const CompanySchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  slug: z.string().min(1),
  thesis: ThesisEnum,
  sector: z.string().default("Other"),
  stage: z.string().default("Seed"),
  hq: z.string().nullable().default(""),
  headcount: z.number().int().nullable().default(null),
  founded: z.number().int().nullable().default(null),
  lastRaise: z.string().nullable().default(""),
  ssiScore: z.number().min(0).max(100),
  signalTier: z.string().default("⚪ Watchlist"),
  priority: PriorityEnum,
  discoverySource: z.string().default("manual"),
  falsifierCheck: FalsifierCheckEnum,
  antithesisFilter: AntithesisFilterEnum,
  sourceConfidence: z.string().default("Medium"),
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

// Stale flag: explicitly verified more than 90 days ago. Absent verification → not stale
// (we never claimed to have checked). Renders a stale-glyph micro-mark on the portrait.
// Caller MUST pass `now` explicitly. Next 16 Cache Components disallows `new Date()` defaults
// in server components without first awaiting an uncached data source.
export function isStale(co: Company, now: Date): boolean {
  if (!co.lastVerified) return false;
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
