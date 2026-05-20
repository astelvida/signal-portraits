import { ImageResponse } from "next/og";
import { fetchCompany } from "@/lib/notion/companies";
import { isMuted } from "@/lib/notion/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const co = await fetchCompany(slug);

  const muted = co ? isMuted(co) : false;
  const accent = muted ? "#7A7A75" : "#E63312";
  const ink = "#0E0E0E";
  const mute = "#7A7A75";
  const bg = "#FAFAF7";

  const thesisShort =
    co?.thesis === "Governed Agentic Ops"
      ? "GAO"
      : co?.thesis === "Vertical SoR AI"
        ? "VSRAI"
        : co?.thesis === "Both"
          ? "BOTH"
          : "";

  const metaRight = co ? `${thesisShort} · ${co.priority}` : thesisShort;
  const tagline = "Filings beat vibes. Signals beat stories. Buyers beat hype.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          padding: 64,
          display: "flex",
          flexDirection: "column",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", letterSpacing: "-0.02em", color: ink, display: "flex" }}>
            Signal Portraits<span style={{ color: accent }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 14, color: mute, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
            <span>signal-portraits.vercel.app</span>
            <span style={{ color: ink }}>{metaRight}</span>
          </div>
        </div>

        {/* Body row: mark + text */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 64 }}>
          <div
            style={{
              width: 340,
              height: 340,
              border: `2px solid ${ink}`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                border: `1px solid ${ink}`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: accent,
                  transform: "rotate(45deg)",
                  display: "flex",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.02em", color: ink, lineHeight: 1.05 }}>
              {co?.company ?? slug}
            </div>
            {co?.oneLiner ? (
              <div style={{ display: "flex", fontSize: 22, lineHeight: 1.4, color: "#1F1F1F", marginTop: 16 }}>
                {co.oneLiner}
              </div>
            ) : null}
            <div style={{ display: "flex", fontFamily: "ui-monospace, monospace", fontSize: 36, fontWeight: 700, color: accent, marginTop: 28 }}>
              SSI {co?.ssiScore ?? "—"}
            </div>
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "baseline", fontFamily: "ui-monospace, monospace", fontSize: 14, color: mute }}>
          <span>{tagline}</span>
          <span>{co?.sector ?? ""}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
