import Link from "next/link";
import type { Company } from "@/lib/notion/schema";
import { isMuted, isStale } from "@/lib/notion/schema";
import { Portrait } from "@/lib/portrait";

const thesisShort: Record<string, string> = {
  "Governed Agentic Ops": "GAO",
  "Vertical SoR AI": "VSRAI",
  Both: "BOTH",
};

export function PortraitCard({ company, now }: { company: Company; now: Date }) {
  const muted = isMuted(company);
  const stale = isStale(company, now);

  return (
    <Link
      href={`/portraits/${company.slug}`}
      className="portrait-card"
      style={{
        borderRight: "1px solid var(--color-ink)",
        borderBottom: "1px solid var(--color-ink)",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--color-warm-white)",
        position: "relative",
        aspectRatio: "1 / 1",
        textDecoration: "none",
        color: "var(--color-ink)",
        opacity: muted ? 0.62 : 1,
        overflow: "hidden",
      }}
    >
      <div
        className="mono"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "var(--color-mute)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        <span>
          {thesisShort[company.thesis] ?? "—"}
          {company.hqCountry.length > 0 ? ` · ${company.hqCountry.join(" · ")}` : ""}
        </span>
        <span
          style={{
            color:
              company.priority === "P0" && !muted
                ? "var(--color-accent)"
                : "var(--color-ink)",
            fontWeight: 600,
          }}
        >
          {company.priority}
        </span>
      </div>

      <div
        className="portrait-card-art"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Portrait company={company} size={180} showLabels={false} stale={stale} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "baseline",
          minWidth: 0,
        }}
      >
        <span
          className="display portrait-card-name"
          style={{
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.1,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={company.company}
        >
          {company.company}
        </span>
        <span
          className="mono"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: muted ? "var(--color-mute)" : "var(--color-accent)",
            flexShrink: 0,
          }}
        >
          SSI {company.ssiScore}
        </span>
      </div>
    </Link>
  );
}
