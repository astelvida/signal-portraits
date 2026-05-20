import { fetchCompaniesSummary } from "@/lib/notion/companies";

/** Compact "Xh / Xd / Xw" suffix. Caller appends "ago". */
function formatAge(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const weeks = Math.round(days / 7);
  return `${weeks}w`;
}

/**
 * Live data strap. Renders above the hero on /, and at the top of /gallery
 * and /portraits/[slug]. The freshest chunk uses the vermillion accent so
 * the eye lands on what's most recent.
 */
export async function Marquee() {
  const s = await fetchCompaniesSummary();

  return (
    <div
      className="mono"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: 32,
        rowGap: 6,
        padding: "10px 20px",
        borderTop: "1px solid var(--color-ink)",
        borderBottom: "1px solid var(--color-ink)",
        background: "var(--color-warm-cream)",
        fontSize: 11,
        color: "var(--color-mute)",
        letterSpacing: "0.02em",
      }}
    >
      <span
        style={{
          color: "var(--color-accent)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        LIVE
      </span>
      <span aria-hidden style={{ color: "var(--color-mute)" }}>·</span>
      <span>
        <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>{s.total}</b> portraits
      </span>
      <span>
        <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>{s.gao}</b> GAO ·{" "}
        <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>{s.vsrai}</b> VSRAI ·{" "}
        <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>{s.both}</b> both
      </span>
      <span>
        <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>{s.p0}</b> P0
      </span>
      {s.untagged > 0 ? (
        <span>
          <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>{s.untagged}</b> untagged in Notion
        </span>
      ) : null}
      {s.freshestSignalAgeHours !== null ? (
        <span style={{ marginLeft: "auto" }}>
          Last signal{" "}
          <b style={{ color: "var(--color-accent)", fontWeight: 700 }}>
            {formatAge(s.freshestSignalAgeHours)} ago
          </b>
        </span>
      ) : null}
    </div>
  );
}
