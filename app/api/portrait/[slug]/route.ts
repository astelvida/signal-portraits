import { NextResponse } from "next/server";
import { fetchCompany } from "@/lib/notion/companies";
import { makeSeed } from "@/lib/portrait/seed";
import { synthGAOVector, synthVSRAIVector } from "@/lib/portrait/dimensions";

/**
 * JSON readout of a portrait's seed + synthetic dimension vector + signal IDs.
 * Used by the debug overlay and (in Phase 2) the time-lapse view.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const co = await fetchCompany(slug);
  if (!co) return NextResponse.json({ error: "not found" }, { status: 404 });

  const seed = makeSeed(co.slug, co.thesis, co.ssiScore);
  const dims =
    co.thesis === "Governed Agentic Ops"
      ? { gao: synthGAOVector(co, seed) }
      : co.thesis === "Vertical SoR AI"
        ? { vsrai: synthVSRAIVector(co, seed) }
        : {
            gao: synthGAOVector(co, seed),
            vsrai: synthVSRAIVector(co, seed),
          };

  return NextResponse.json(
    {
      slug: co.slug,
      company: co.company,
      thesis: co.thesis,
      ssiScore: co.ssiScore,
      seed,
      signals: co.signals.length,
      dimensions: dims,
      lastVerified: co.lastVerified,
      lastSignalDate: co.lastSignalDate,
    },
    {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
