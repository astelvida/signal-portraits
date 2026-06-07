import type { Signal } from "@/lib/notion/schema";

/**
 * Chronological signal log for a single company. Renders one row per
 * Signal, newest first. Visual register matches the rest of the surface:
 * mono date, italic display-font title, mute eyebrow for type/strength.
 * Vermillion dot marks the freshest signal.
 */
export function SignalTimeline({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) {
    return (
      <div
        className="mono"
        style={{
          padding: "12px 0",
          fontSize: 11,
          color: "var(--color-mute)",
          letterSpacing: "0.02em",
        }}
      >
        No signals on file yet. Watching.
      </div>
    );
  }

  const sorted = [...signals].sort((a, b) => {
    const dA = a.dateDetected ? new Date(a.dateDetected).getTime() : 0;
    const dB = b.dateDetected ? new Date(b.dateDetected).getTime() : 0;
    return dB - dA;
  });

  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {sorted.map((s, i) => (
        <li
          key={s.id}
          style={{
            display: "grid",
            gridTemplateColumns: "16px 84px 1fr",
            gap: 12,
            padding: "10px 0",
            borderTop: i === 0 ? "none" : "1px dashed var(--color-warm-cream)",
            alignItems: "baseline",
          }}
        >
          <span
            aria-hidden
            style={{
              alignSelf: "center",
              width: 6,
              height: 6,
              background: i === 0 ? "var(--color-accent)" : "var(--color-ink)",
              marginTop: 2,
            }}
          />
          <time
            className="mono"
            dateTime={s.dateDetected ?? undefined}
            style={{
              fontSize: 11,
              color: "var(--color-mute)",
              letterSpacing: "0.02em",
            }}
          >
            {s.dateDetected ?? "—"}
          </time>
          <div style={{ minWidth: 0 }}>
            <div
              className="display"
              style={{
                fontStyle: "italic",
                fontSize: 14,
                lineHeight: 1.3,
                color: "var(--color-ink)",
                marginBottom: 4,
              }}
            >
              {s.sourceUrl ? (
                <a
                  href={s.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "0.18em" }}
                >
                  {s.title}
                </a>
              ) : (
                s.title
              )}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--color-mute)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {s.signalType && <span>{s.signalType}</span>}
              {s.signalStrength && (
                <span style={{ color: s.signalStrength === "High" ? "var(--color-accent)" : "var(--color-mute)" }}>
                  {s.signalStrength}
                </span>
              )}
              {s.evidenceQuality && <span>{s.evidenceQuality}</span>}
              {s.verified && <span style={{ color: "var(--color-ink)" }}>✓ verified</span>}
              {s.disqualifying && <span style={{ color: "var(--color-accent)" }}>disqualifying</span>}
            </div>
            {s.detail && (
              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "var(--color-ink-soft)",
                }}
              >
                {s.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
