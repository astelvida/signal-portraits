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
  if (prop.type === "multi_select") {
    const arr = prop.multi_select as Array<{ name: string }>;
    return arr.length > 0 ? arr[0].name : null;
  }
  return null;
}

function readMultiSelect(prop: NotionProp | undefined): string[] {
  if (!prop) return [];
  if (prop.type === "multi_select") {
    const arr = prop.multi_select as Array<{ name: string }>;
    return arr.map((x) => x.name);
  }
  if (prop.type === "select") {
    const v = prop.select as { name: string } | null;
    return v ? [v.name] : [];
  }
  return [];
}

/** Normalize labels like "P2 — This Month" → "P2", "🔴 Highest Conviction — top tier" → "🔴 Highest Conviction". */
function trimRichLabel(s: string | null): string | null {
  if (!s) return s;
  // Split on em dash or double-hyphen and take the head
  const head = s.split(/\s+[—–-]{1,2}\s+/)[0]?.trim() ?? s.trim();
  return head;
}

function readNumber(prop: NotionProp | undefined): number | null {
  if (!prop || prop.type !== "number") return null;
  const v = prop.number as number | null;
  return v;
}

/** Read a formula property that resolves to a number (the SSI v3.0 score columns). */
function readFormulaNumber(prop: NotionProp | undefined): number | null {
  if (!prop || prop.type !== "formula") return null;
  const f = prop.formula as { type?: string; number?: number | null } | undefined;
  return typeof f?.number === "number" ? f.number : null;
}

function readCheckbox(prop: NotionProp | undefined): boolean {
  if (!prop || prop.type !== "checkbox") return false;
  return Boolean(prop.checkbox);
}

/** First strictly-positive number in the list, else null. Used so a score formula
 * that resolves to 0 (unscored) doesn't mask a populated fallback. */
function firstPositive(vals: Array<number | null>): number | null {
  for (const v of vals) if (typeof v === "number" && v > 0) return v;
  return null;
}

function readDate(prop: NotionProp | undefined): string | null {
  if (!prop) return null;
  if (prop.type === "date") {
    const v = prop.date as { start: string } | null;
    return v?.start ?? null;
  }
  // "Last Signal Date" became a rollup in SSI v3.0; unwrap a date-typed rollup.
  if (prop.type === "rollup") {
    const r = prop.rollup as { type?: string; date?: { start: string } | null } | undefined;
    if (r?.type === "date") return r.date?.start ?? null;
  }
  return null;
}

// SSI v3.0 per-dimension columns, in GAO_DIMS / VSRAI_DIMS order.
const GAO_DIM_PROPS = [
  "G1 · Regulatory Embeddedness",
  "G2 · Runtime Governance",
  "G3 · Team Fit",
  "G4 · Velocity",
  "G5 · Buyer Traction",
  "G6 · Technical Moat",
  "G7 · Capital Efficiency",
  "G8 · Investor Signal",
] as const;
const VSRAI_DIM_PROPS = [
  "V1 · SoR Integration Depth",
  "V2 · Domain Data Advantage",
  "V3 · Team Domain Pedigree",
  "V4 · Workflow Lock-In",
  "V5 · Regulatory Alignment",
  "V6 · Switching Cost",
  "V7 · Market Timing",
  "V8 · Capital Efficiency",
] as const;

/** Read an 8-dimension vector; returns null unless every dimension is populated. */
function readDimVector(
  p: Record<string, NotionProp>,
  names: readonly string[],
): number[] | null {
  const vals = names.map((n) => readNumber(p[n]));
  return vals.every((v) => v !== null) ? (vals as number[]) : null;
}

function readRelation(prop: NotionProp | undefined): string[] {
  if (!prop || prop.type !== "relation") return [];
  const r = prop.relation as Array<{ id: string }>;
  return r.map((x) => x.id);
}

/**
 * Map a Notion company row to our typed Company shape, or return `null`
 * when the row has no Thesis tag. Callers (fetchCompanies) filter nulls
 * out of the gallery and surface the count separately. Padding the gallery
 * with mis-tagged GAO would misrepresent coverage.
 */
export function mapCompany(raw: {
  id: string;
  properties: Record<string, unknown>;
}): Company | null {
  const p = raw.properties as Record<string, NotionProp>;
  const name = readString(p["Company"]);
  const slug = slugify(name);
  const relSignals = readRelation(p["Signals"]);
  const relCatalyst = readRelation(p["Primary Catalyst"]);
  const relMM = readRelation(p["Market Map Sub-Segment"]);

  // Thesis is now the "Active Thesis" single select (GAO | VSRAI). ThesisEnum
  // normalizes those labels to the full names. No thesis → omit the row.
  const thesisValue = trimRichLabel(readSelect(p["Active Thesis"]));
  if (!thesisValue) return null;
  const isGAO = thesisValue === "GAO" || thesisValue === "Governed Agentic Ops";

  // SSI Score is gone; the headline score is a formula. Prefer the adjusted
  // active score, then the active score, then the thesis-specific score, then
  // the raw adjusted SSI. firstPositive() skips formulas that resolve to 0 for
  // unscored rows. All resolve to 0 today, so unscored companies get ssi 0.
  const ssi =
    firstPositive([
      readFormulaNumber(p["Adjusted Active Score"]),
      readFormulaNumber(p["Active Score"]),
      isGAO ? readFormulaNumber(p["GAO Score"]) : readFormulaNumber(p["VSRAI Score"]),
      readFormulaNumber(p["Adjusted SSI"]),
    ]) ?? 0;

  return CompanySchema.parse({
    id: raw.id,
    company: name,
    slug,
    thesis: thesisValue,
    hqCountry: readMultiSelect(p["HQ Country"]),
    stage: trimRichLabel(readSelect(p["Stage"])) ?? "Seed",
    headcount: readNumber(p["Headcount"]),
    founded: readNumber(p["Founded"]),
    lastRaise: readString(p["Last Raise"]),
    ssiScore: ssi,
    signalTier: trimRichLabel(readSelect(p["Signal Tier"])) ?? "⚪ Watchlist",
    priority: trimRichLabel(readSelect(p["Priority"])) ?? "P3",
    discoverySource: trimRichLabel(readSelect(p["Discovery Source"])) ?? "manual",
    falsifierCheck: trimRichLabel(readSelect(p["Falsifier Check"])) ?? "⏳ Not Run",
    antithesisFilter: trimRichLabel(readSelect(p["Anti-thesis Filter"])) ?? "Not Run",
    status: trimRichLabel(readSelect(p["Status"])),
    oneLiner: readString(p["One-liner"]),
    keySignal30d: readString(p["Key Signal 30d"]),
    catalystWindowDays: readNumber(p["Catalyst Window (days)"]),
    lastVerified: readDate(p["Last verified"]),
    lastScored: readDate(p["Last Scored"]),
    signals: relSignals,
    primaryCatalyst: relCatalyst[0] ?? null,
    marketMapSubSegment: relMM[0] ?? null,
    lastSignalDate: readDate(p["Last Signal Date"]),
    gaoDims: readDimVector(p, GAO_DIM_PROPS),
    vsraiDims: readDimVector(p, VSRAI_DIM_PROPS),
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
    signalDate: readDate(p["Signal Date"]),
    detail: readString(p["Detail"]),
    verified: readCheckbox(p["Verified"]),
    disqualifying: readCheckbox(p["Disqualifying"]),
    pipelineCompany: rel[0] ?? null,
  });
}
