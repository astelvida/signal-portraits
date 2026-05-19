import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  COMPANIES_DATA_SOURCE_ID,
  SIGNALS_DATA_SOURCE_ID,
  queryDataSource,
} from "./client";
import { mapCompany, mapSignal } from "./mappers";
import { FIXTURE_COMPANIES } from "./fixtures";
import type { Company, Signal } from "./schema";

// ---------- All companies (cached, tagged "companies") ----------

export async function fetchCompanies(): Promise<Company[]> {
  "use cache";
  cacheTag("companies");
  cacheLife({ revalidate: 3600, stale: 60, expire: 86400 });

  // Dev fallback: return fixtures when NOTION_TOKEN is missing.
  if (!process.env.NOTION_TOKEN) {
    return FIXTURE_COMPANIES;
  }

  const all: Company[] = [];
  let cursor: string | undefined = undefined;
  do {
    const page = await queryDataSource(COMPANIES_DATA_SOURCE_ID, {
      startCursor: cursor,
      pageSize: 100,
    });
    for (const row of page.results) {
      try {
        all.push(mapCompany(row));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[notion] failed to parse company ${row.id}: ${msg.slice(0, 300)}`);
      }
    }
    cursor = page.next_cursor ?? undefined;
  } while (cursor);

  return all;
}

export async function fetchCompany(slug: string): Promise<Company | null> {
  "use cache";
  cacheTag(`company:${slug}`);
  cacheTag("companies");
  cacheLife({ revalidate: 3600, stale: 60, expire: 86400 });

  const all = await fetchCompanies();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function fetchSignalsFor(companyId: string): Promise<Signal[]> {
  "use cache";
  cacheTag(`signals:${companyId}`);
  cacheLife({ revalidate: 1800 });

  if (!process.env.NOTION_TOKEN) return [];

  const page = await queryDataSource(SIGNALS_DATA_SOURCE_ID, {
    pageSize: 100,
    filter: {
      property: "Pipeline Company",
      relation: { contains: companyId },
    },
  });
  return page.results.map(mapSignal);
}

// ---------- Marquee summary ----------

export interface CompaniesSummary {
  total: number;
  gao: number;
  vsrai: number;
  both: number;
  p0: number;
  freshestSignalAgeHours: number | null;
}

export async function fetchCompaniesSummary(): Promise<CompaniesSummary> {
  "use cache";
  cacheTag("companies");
  cacheLife({ revalidate: 3600 });

  const all = await fetchCompanies();
  const total = all.length;
  const gao = all.filter((c) => c.thesis === "Governed Agentic Ops").length;
  const vsrai = all.filter((c) => c.thesis === "Vertical SoR AI").length;
  const both = all.filter((c) => c.thesis === "Both").length;
  const p0 = all.filter((c) => c.priority === "P0").length;

  const freshestSignal = all
    .map((c) => c.lastSignalDate)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime())
    .sort((a, b) => b - a)[0];

  const freshestSignalAgeHours =
    freshestSignal != null
      ? Math.max(0, Math.round((Date.now() - freshestSignal) / 3_600_000))
      : null;

  return { total, gao, vsrai, both, p0, freshestSignalAgeHours };
}

// ---------- Featured company ----------
// Highest tier (P0 > P1 > P2 > P3) with the freshest Last Signal Date.
// Mute-mode companies are not featured.

const tierRank: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

export async function featuredCompany(): Promise<Company | null> {
  "use cache";
  cacheTag("companies");
  cacheLife({ revalidate: 3600 });

  const all = await fetchCompanies();
  const eligible = all.filter(
    (c) =>
      c.falsifierCheck !== "❌ Triggered" && c.antithesisFilter !== "Auto-pass",
  );
  if (eligible.length === 0) return null;

  const sorted = [...eligible].sort((a, b) => {
    const tA = tierRank[a.priority] ?? 9;
    const tB = tierRank[b.priority] ?? 9;
    if (tA !== tB) return tA - tB;
    const dA = a.lastSignalDate ? new Date(a.lastSignalDate).getTime() : 0;
    const dB = b.lastSignalDate ? new Date(b.lastSignalDate).getTime() : 0;
    return dB - dA;
  });
  return sorted[0] ?? null;
}
