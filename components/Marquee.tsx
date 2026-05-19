import { fetchCompaniesSummary } from "@/lib/notion/companies";

export async function Marquee() {
  const s = await fetchCompaniesSummary();
  const freshness = s.freshestSignalAgeHours;
  const freshnessText =
    freshness == null
      ? "—"
      : freshness < 24
        ? `${freshness}h ago`
        : `${Math.round(freshness / 24)}d ago`;

  return (
    <div
      className="mono"
      style={{
        display: "flex",
        gap: 48,
        padding: "14px 24px",
        borderBottom: "1px solid var(--color-ink)",
        fontSize: 11,
        color: "var(--color-mute)",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span>
        <b style={{ color: "var(--color-ink)" }}>{s.total}</b> portraits
      </span>
      <span>
        <b style={{ color: "var(--color-ink)" }}>{s.gao}</b> GAO ·{" "}
        <b style={{ color: "var(--color-ink)" }}>{s.vsrai}</b> VSRAI ·{" "}
        <b style={{ color: "var(--color-ink)" }}>{s.both}</b> both
      </span>
      <span>
        <b style={{ color: "var(--color-ink)" }}>{s.p0}</b> P0
      </span>
      <span>
        Last signal landed <b style={{ color: "var(--color-ink)" }}>{freshnessText}</b>
      </span>
    </div>
  );
}
