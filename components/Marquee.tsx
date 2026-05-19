import { fetchCompaniesSummary } from "@/lib/notion/companies";

/** Compact "Xh / Xd / Xw" suffix. Caller appends "ago". */
function formatAge(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const weeks = Math.round(days / 7);
  return `${weeks}w`;
}

export async function Marquee() {
  const s = await fetchCompaniesSummary();

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
      {s.untagged > 0 ? (
        <span>
          <b style={{ color: "var(--color-ink)" }}>{s.untagged}</b> untagged in Notion
        </span>
      ) : null}
      {s.freshestSignalAgeHours !== null ? (
        <span>
          Last signal landed{" "}
          <b style={{ color: "var(--color-ink)" }}>
            {formatAge(s.freshestSignalAgeHours)} ago
          </b>
        </span>
      ) : null}
    </div>
  );
}
