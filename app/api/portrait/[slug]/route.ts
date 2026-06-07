import { NextResponse } from "next/server";
import { fetchCompany } from "@/lib/notion/companies";
import { makeSeed } from "@/lib/portrait/seed";
import { gaoVector, vsraiVector, hasLiveDims } from "@/lib/portrait/dimensions";

/**
 * JSON readout of a portrait's seed + dimension vector (live when scored, else
 * synthetic) + signal IDs. Used by the debug overlay and the time-lapse view.
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
      ? { gao: gaoVector(co, seed) }
      : co.thesis === "Vertical SoR AI"
        ? { vsrai: vsraiVector(co, seed) }
        : {
            gao: gaoVector(co, seed),
            vsrai: vsraiVector(co, seed),
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
      dimensionsSource: hasLiveDims(co) ? "live" : "synthetic",
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
