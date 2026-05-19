import Link from "next/link";

export default function ThesisPage() {
  return (
    <article style={{ maxWidth: 840, padding: "32px 8px 0" }}>
      <header style={{ marginBottom: 48 }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Thesis · Two-thesis canon · v2.0
        </div>
        <h1 className="display" style={{ fontSize: 56, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1, marginBottom: 16 }}>
          Compliance is becoming distribution.
        </h1>
        <p className="display" style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.4, color: "var(--color-ink-soft)" }}>
          Two structural bets in European AI. The portrait gallery is the live readout.
        </p>
      </header>

      <section style={{ marginBottom: 56 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--color-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Thesis I · Governed Agentic Ops
        </div>
        <h2 className="display" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.05, marginBottom: 16 }}>
          The deployment gateway, not the model.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--color-ink-soft)", marginBottom: 16 }}>
          Autonomous agents move from demo to production through the boring layer: policy enforcement, audit trails, observability, evaluation, human oversight, runtime governance. Europe&rsquo;s regulatory stack (EU AI Act Annex III, DORA, NIS2, AMLA) makes this the legible moat. The companies that ship the deployment gateway capture the budget that would otherwise sit waiting for the next model release.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--color-ink-soft)" }}>
          The boring layer wins. The GAO portrait reads as a control-plane schematic because that is what it is.
        </p>
      </section>

      <section style={{ marginBottom: 56 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--color-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Thesis II · Vertical System-of-Record AI
        </div>
        <h2 className="display" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.05, marginBottom: 16 }}>
          The workflow is the wedge.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--color-ink-soft)", marginBottom: 16 }}>
          Capture the workflow, capture the system of record. Capture the system of record, capture the budget line. The VSRAI bet is on AI that becomes the canonical record for a regulated workflow, owns the evidence trail, and accumulates proprietary domain data the incumbent cannot reproduce.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--color-ink-soft)" }}>
          Systems of record beat dashboards. The VSRAI portrait shows the workflow gravity literally: faceted core, lateral arms, roots descending into the system-of-record plate at the bottom of the canvas.
        </p>
      </section>

      <footer
        className="mono"
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid var(--color-ink)",
          fontSize: 13,
          color: "var(--color-ink)",
        }}
      >
        Read the rubric →{" "}
        <Link href="/methodology" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
          /methodology
        </Link>
      </footer>
    </article>
  );
}
