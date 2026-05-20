import { cacheLife, cacheTag } from "next/cache";
import { GAO_DIMS, VSRAI_DIMS } from "@/lib/portrait/dimensions";

async function fetchMethodology() {
  "use cache";
  cacheTag("methodology");
  cacheLife({ revalidate: 86400 });
  // Phase 1: render from static rubric data already encoded in lib/portrait/dimensions.ts.
  // Phase 2: pull the live Methodology v5.0 markdown from Notion page e29a4e77-e168-41c8-9901-fc2beee52c4e.
  return {
    version: "SSI v3.0",
    lastVerified: "19 May 2026",
    gao: GAO_DIMS,
    vsrai: VSRAI_DIMS,
  };
}

export default async function MethodologyPage() {
  const m = await fetchMethodology();

  return (
    <article style={{ maxWidth: 840, padding: "32px 8px 0" }}>
      <header style={{ marginBottom: 48 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Methodology · {m.version} · verified {m.lastVerified}
        </div>
        <h1 className="display" style={{ fontSize: 56, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1, marginBottom: 16 }}>
          Score the thesis, not the company.
        </h1>
        <p className="display" style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.4, color: "var(--color-ink-soft)" }}>
          Two rubrics. Two grammars. One hundred points each. The portrait is the readout.
        </p>
      </header>

      <Block
        kicker="Thesis I"
        title="Governed Agentic Ops"
        body="The deployment gateway for enterprise AI. Runtime governance, observability, evaluation, audit evidence, human oversight, policy enforcement. Eight dimensions. The visual language is geometric: orbital rings around an inner policy lattice."
        dims={m.gao}
      />

      <Block
        kicker="Thesis II"
        title="Vertical System-of-Record AI"
        body="Workflow gravity beats model novelty. AI that becomes, extends, or controls the regulated workflow's system of record. Eight dimensions. The visual language is organic: a faceted core, lateral arms, and root threads that descend into a system-of-record plate."
        dims={m.vsrai}
      />

      <section style={{ marginTop: 64 }}>
        <h2 className="display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.015em", marginBottom: 16 }}>
          How a portrait moves.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-ink-soft)" }}>
          The seed is <code className="mono">sha256(slug + thesis + ssi_score)</code>, truncated to 32 bits. Same inputs always render the same portrait. When a new signal lands and the SSI score moves by even one point, the seed moves, the structure moves, and the portrait visibly shifts. This is the proof the methodology is operationally live.
        </p>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 className="display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.015em", marginBottom: 16 }}>
          When a portrait is muted.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-ink-soft)" }}>
          A portrait renders in mute mode when the Falsifier Check returns <code className="mono">❌ Triggered</code> or the Anti-thesis Filter returns <code className="mono">Auto-pass</code>. The vermillion is replaced with warm-grey, the pass reason appears in JetBrains Mono at the canvas foot. The portrait still exists. The methodology is honest about its no&rsquo;s.
        </p>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 className="display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.015em", marginBottom: 16 }}>
          How does this stay live?
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-ink-soft)" }}>
          The Companies database in Notion is the only source of truth. When a row changes, Notion fires a signed webhook at <code className="mono">/api/revalidate</code>. The route verifies the signature against a shared secret, then marks the cached pages stale. The next page load refetches, the SSI score moves, the seed shifts, and the portrait visibly redraws.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-ink-soft)", marginTop: 12 }}>
          Edit a row in Notion. The portrait moves. The data tells the story.
        </p>
      </section>
    </article>
  );
}

function Block({
  kicker,
  title,
  body,
  dims,
}: {
  kicker: string;
  title: string;
  body: string;
  dims: ReadonlyArray<{ label: string; max: number; visualNote: string }>;
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--color-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        {kicker}
      </div>
      <h2 className="display" style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.05, marginBottom: 16 }}>
        {title}
      </h2>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--color-ink-soft)", marginBottom: 24 }}>{body}</p>
      <div
        className="mono dim-table"
        style={{ borderTop: "1px solid var(--color-ink)", fontSize: 12 }}
      >
        {dims.map((d) => (
          <div
            key={d.label}
            className="dim-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "2px 16px",
              padding: "12px 0",
              borderBottom: "1px solid var(--color-warm-cream)",
            }}
          >
            <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>{d.label}</span>
            <span style={{ textAlign: "right", color: "var(--color-mute)" }}>max {d.max}</span>
            <span
              className="dim-note"
              style={{
                gridColumn: "1 / -1",
                color: "var(--color-mute)",
                lineHeight: 1.5,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              {d.visualNote}
            </span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "2px solid var(--color-ink)",
          }}
        >
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
            {dims.reduce((sum, d) => sum + d.max, 0)}
          </span>
        </div>
      </div>
    </section>
  );
}
