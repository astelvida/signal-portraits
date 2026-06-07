import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  COMPANIES_DATA_SOURCE_ID,
  SIGNALS_DATA_SOURCE_ID,
  queryDataSource,
} from "./client";
import { mapCompany, mapSignal } from "./mappers";
import { FIXTURE_COMPANIES, FIXTURE_SIGNALS } from "./fixtures";
import type { Company, Signal } from "./schema";

// ---------- All companies (cached, tagged "companies") ----------

/**
 * Shared internal walk over the Companies data source. Returns both the
 * tagged companies and the count of rows omitted for having no Thesis tag.
 * Cached under the "companies" tag so `fetchCompanies` and
 * `fetchCompaniesSummary` share a single Notion round-trip.
 */
async function fetchCompaniesData(): Promise<{
  companies: Company[];
  untagged: number;
}> {
  "use cache";
  cacheTag("companies");
  cacheLife({ revalidate: 3600, stale: 60, expire: 86400 });

  const forceFixtures = process.env.PORTRAITS_FORCE_FIXTURES === "1";
  const forceLive = process.env.PORTRAITS_FORCE_LIVE === "1";

  // Serve fixtures when there's no token, or when explicitly forced.
  if (!process.env.NOTION_TOKEN || forceFixtures) {
    return { companies: FIXTURE_COMPANIES, untagged: 0 };
  }

  const all: Company[] = [];
  let untagged = 0;
  let cursor: string | undefined = undefined;
  do {
    const page = await queryDataSource(COMPANIES_DATA_SOURCE_ID, {
      startCursor: cursor,
      pageSize: 100,
    });
    for (const row of page.results) {
      try {
        const co = mapCompany(row);
        if (co === null) {
          untagged++;
          continue;
        }
        all.push(co);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[notion] failed to parse company ${row.id}: ${msg.slice(0, 300)}`);
      }
    }
    cursor = page.next_cursor ?? undefined;
  } while (cursor);

  // The SSI v3.0 columns exist live but aren't scored yet (every score is 0).
  // Rather than render a gallery of blank SSI-0 portraits, keep serving the
  // fixtures until the Scouting Engine fills scores in. Once any company is
  // scored, switch to the scored subset — the gallery then fills in
  // incrementally with no redeploy. PORTRAITS_FORCE_LIVE bypasses the gate.
  if (forceLive) return { companies: all, untagged };
  const scored = all.filter((c) => c.ssiScore > 0);
  if (scored.length === 0) return { companies: FIXTURE_COMPANIES, untagged };
  return { companies: scored, untagged };
}

export async function fetchCompanies(): Promise<Company[]> {
  const { companies } = await fetchCompaniesData();
  return companies;
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

  // Serve fixture signals when in fixtures mode (no token, forced, or a
  // fixture company id) so the detail-page timeline stays populated.
  if (
    !process.env.NOTION_TOKEN ||
    process.env.PORTRAITS_FORCE_FIXTURES === "1" ||
    companyId.startsWith("fx-")
  ) {
    return FIXTURE_SIGNALS[companyId] ?? [];
  }

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
  untagged: number;
  freshestSignalAgeHours: number | null;
}

export async function fetchCompaniesSummary(): Promise<CompaniesSummary> {
  "use cache";
  cacheTag("companies");
  cacheLife({ revalidate: 3600 });

  const { companies: all, untagged } = await fetchCompaniesData();
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

  return { total, gao, vsrai, both, p0, untagged, freshestSignalAgeHours };
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
