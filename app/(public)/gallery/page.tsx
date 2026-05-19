import { Suspense } from "react";
import { connection } from "next/server";
import { fetchCompanies } from "@/lib/notion/companies";
import { GalleryToolbar } from "@/components/GalleryToolbar";
import { PortraitCard } from "@/components/PortraitCard";
import type { Company } from "@/lib/notion/schema";

interface SearchParams {
  thesis?: string;
  tier?: string;
  sector?: string;
}

function filterCompanies(all: Company[], sp: SearchParams): Company[] {
  let out = [...all];
  if (sp.thesis && sp.thesis !== "all") {
    const map: Record<string, Company["thesis"]> = {
      gao: "Governed Agentic Ops",
      vsrai: "Vertical SoR AI",
      both: "Both",
    };
    const want = map[sp.thesis];
    if (want) out = out.filter((c) => c.thesis === want);
  }
  if (sp.tier) {
    const tiers = sp.tier.split(",").map((s) => s.trim());
    if (tiers.length > 0) out = out.filter((c) => tiers.includes(c.priority));
  }
  if (sp.sector) {
    const sectors = sp.sector.split(",").map((s) => s.trim());
    if (sectors.length > 0) out = out.filter((c) => sectors.includes(c.sector));
  }
  return out;
}

function sortByLastSignal(arr: Company[]): Company[] {
  return [...arr].sort((a, b) => {
    const dA = a.lastSignalDate ? new Date(a.lastSignalDate).getTime() : 0;
    const dB = b.lastSignalDate ? new Date(b.lastSignalDate).getTime() : 0;
    return dB - dA;
  });
}

async function GalleryGrid({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  const sp = await searchParams;
  const all = await fetchCompanies();
  const filtered = sortByLastSignal(filterCompanies(all, sp));
  const now = new Date();

  if (filtered.length === 0) {
    return (
      <div
        className="mono"
        style={{
          padding: 64,
          textAlign: "center",
          color: "var(--color-mute)",
          fontSize: 13,
        }}
      >
        No portraits match these filters.
      </div>
    );
  }

  return (
    <>
      <GalleryToolbar total={filtered.length} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderLeft: "1px solid var(--color-ink)",
        }}
      >
        {filtered.map((co) => (
          <PortraitCard key={co.id} company={co} now={now} />
        ))}
      </div>
    </>
  );
}

function GallerySkeleton() {
  return (
    <div
      className="mono"
      style={{
        padding: 64,
        textAlign: "center",
        color: "var(--color-mute)",
        fontSize: 13,
      }}
    >
      Loading gallery…
    </div>
  );
}

export default function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <section style={{ border: "1px solid var(--color-ink)", borderTop: "none" }}>
      <Suspense fallback={<GallerySkeleton />}>
        <GalleryGrid searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
