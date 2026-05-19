import "server-only";
import {
  CompanySchema,
  SignalSchema,
  slugify,
  type Company,
  type Signal,
} from "./schema";

// Notion property value extractors. The Notion API returns properties in a typed shape;
// we coerce them into the flat TypeScript shape declared in schema.ts.

type NotionProp = Record<string, unknown> & { type: string };

function readString(prop: NotionProp | undefined): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return ((prop.title as Array<{ plain_text: string }>) ?? [])
        .map((t) => t.plain_text)
        .join("");
    case "rich_text":
      return ((prop.rich_text as Array<{ plain_text: string }>) ?? [])
        .map((t) => t.plain_text)
        .join("");
    case "url":
      return (prop.url as string) ?? "";
    case "email":
      return (prop.email as string) ?? "";
    case "phone_number":
      return (prop.phone_number as string) ?? "";
    default:
      return "";
  }
}

function readSelect(prop: NotionProp | undefined): string | null {
  if (!prop) return null;
  if (prop.type === "select") {
    const v = prop.select as { name: string } | null;
    return v?.name ?? null;
  }
  if (prop.type === "status") {
    const v = prop.status as { name: string } | null;
    return v?.name ?? null;
  }
  return null;
}

function readNumber(prop: NotionProp | undefined): number | null {
  if (!prop || prop.type !== "number") return null;
  const v = prop.number as number | null;
  return v;
}

function readDate(prop: NotionProp | undefined): string | null {
  if (!prop || prop.type !== "date") return null;
  const v = prop.date as { start: string } | null;
  return v?.start ?? null;
}

function readRelation(prop: NotionProp | undefined): string[] {
  if (!prop || prop.type !== "relation") return [];
  const r = prop.relation as Array<{ id: string }>;
  return r.map((x) => x.id);
}

export function mapCompany(raw: {
  id: string;
  properties: Record<string, unknown>;
}): Company {
  const p = raw.properties as Record<string, NotionProp>;
  const name = readString(p["Company"]);
  const slug = slugify(name);
  const relSignals = readRelation(p["Signals"]);
  const relCatalyst = readRelation(p["Primary Catalyst"]);
  const relMM = readRelation(p["Market Map Sub-Segment"]);

  return CompanySchema.parse({
    id: raw.id,
    company: name,
    slug,
    thesis: readSelect(p["Thesis"]) ?? "Governed Agentic Ops",
    sector: readSelect(p["Sector"]) ?? "Other",
    stage: readSelect(p["Stage"]) ?? "Seed",
    hq: readString(p["HQ"]),
    headcount: readNumber(p["Headcount"]),
    founded: readNumber(p["Founded"]),
    lastRaise: readString(p["Last Raise"]),
    ssiScore: readNumber(p["SSI Score"]) ?? 0,
    signalTier: readSelect(p["Signal Tier"]) ?? "⚪ Watchlist",
    priority: readSelect(p["Priority"]) ?? "P3",
    discoverySource: readSelect(p["Discovery Source"]) ?? "manual",
    falsifierCheck: readSelect(p["Falsifier Check"]) ?? "⏳ Not Run",
    antithesisFilter: readSelect(p["Anti-thesis Filter"]) ?? "Not Run",
    sourceConfidence: readSelect(p["Source confidence"]) ?? "Medium",
    oneLiner: readString(p["One-liner"]),
    keySignal30d: readString(p["Key Signal 30d"]),
    catalystWindowDays: readNumber(p["Catalyst Window (days)"]),
    lastVerified: readDate(p["Last verified"]),
    lastScored: readDate(p["Last Scored"]),
    signals: relSignals,
    primaryCatalyst: relCatalyst[0] ?? null,
    marketMapSubSegment: relMM[0] ?? null,
    lastSignalDate: readDate(p["Last Signal Date"]),
  });
}

export function mapSignal(raw: {
  id: string;
  properties: Record<string, unknown>;
}): Signal {
  const p = raw.properties as Record<string, NotionProp>;
  const rel = readRelation(p["Pipeline Company"]);
  return SignalSchema.parse({
    id: raw.id,
    title: readString(p["Signal"]),
    signalType: readSelect(p["Signal Type"]),
    signalStrength: readSelect(p["Signal Strength"]),
    evidenceQuality: readSelect(p["Evidence Quality"]),
    sourceUrl: readString(p["Source URL"]) || null,
    dateDetected: readDate(p["Date Detected"]),
    detail: readString(p["Detail"]),
    scoreContribution: readNumber(p["Score Contribution"]),
    pipelineCompany: rel[0] ?? null,
  });
}
