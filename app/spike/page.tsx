import { Portrait } from "@/lib/portrait";
import type { Company } from "@/lib/notion/schema";

// Phase-0 spike: hard-coded fixtures. Deleted in Task 8 once /portraits/[slug] ships.
// Three fixtures: P0 GAO, P1 VSRAI (placeholder until Task 6), Falsifier-triggered mute.

const fixtures: Company[] = [
  {
    id: "fx-1",
    company: "Acme Governance",
    slug: "acme-governance",
    thesis: "Governed Agentic Ops",
    sector: "FinServices AI",
    stage: "Seed",
    hq: "London, UK",
    headcount: 18,
    founded: 2024,
    lastRaise: "€7.5M seed led by Mouro Capital",
    ssiScore: 87,
    signalTier: "🔴 Highest Conviction",
    priority: "P0",
    discoverySource: "regscan",
    falsifierCheck: "✅ Clean",
    antithesisFilter: "Clear",
    sourceConfidence: "High",
    oneLiner: "Runtime governance for autonomous workflows in regulated finance.",
    keySignal30d: "DORA-aligned audit pack shipped 4 Apr 2026.",
    catalystWindowDays: 0,
    lastVerified: "2026-05-19",
    lastScored: "2026-05-18",
    signals: ["s1", "s2", "s3", "s4", "s5"],
    primaryCatalyst: "cat-dora",
    marketMapSubSegment: "mm-gao-banking",
    lastSignalDate: "2026-05-19",
  },
  {
    id: "fx-2",
    company: "Lattice Dev",
    slug: "lattice-dev",
    thesis: "Vertical SoR AI",
    sector: "MedTech AI",
    stage: "Series A",
    hq: "Munich, DE",
    headcount: 34,
    founded: 2023,
    lastRaise: "€15M Series A led by HV Capital",
    ssiScore: 76,
    signalTier: "🟠 Strong",
    priority: "P1",
    discoverySource: "ghscan",
    falsifierCheck: "✅ Clean",
    antithesisFilter: "1 Flag",
    sourceConfidence: "High",
    oneLiner: "System of record for hospital procurement decisions, EHDS-native.",
    keySignal30d: "Charité signed 12 Mar 2026.",
    catalystWindowDays: 14,
    lastVerified: "2026-05-15",
    lastScored: "2026-05-10",
    signals: ["s10", "s11", "s12"],
    primaryCatalyst: "cat-ehds",
    marketMapSubSegment: "mm-vsr-medtech",
    lastSignalDate: "2026-05-17",
  },
  {
    id: "fx-3",
    company: "Redflag Co",
    slug: "redflag-co",
    thesis: "Vertical SoR AI",
    sector: "Insurance AI",
    stage: "Pre-Seed",
    hq: "Berlin, DE",
    headcount: 6,
    founded: 2025,
    lastRaise: "€500k angel",
    ssiScore: 62,
    signalTier: "🟡 Emerging",
    priority: "P2",
    discoverySource: "manual",
    falsifierCheck: "❌ Triggered",
    antithesisFilter: "Clear",
    sourceConfidence: "Low",
    oneLiner: "Claims triage agent — falsifier triggered on synthetic-data dependency.",
    keySignal30d: "",
    catalystWindowDays: null,
    lastVerified: "2026-01-02",
    lastScored: "2026-01-02",
    signals: [],
    primaryCatalyst: null,
    marketMapSubSegment: null,
    lastSignalDate: "2026-01-02",
  },
];

export default function SpikePage() {
  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ borderBottom: "2px solid var(--color-ink)", paddingBottom: 12, marginBottom: 32 }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 600, fontStyle: "italic", letterSpacing: "-0.02em" }}>
          Signal Portraits<span style={{ color: "var(--color-accent)" }}>.</span>
        </h1>
        <p className="mono" style={{ fontSize: 11, color: "var(--color-mute)", marginTop: 8 }}>
          spike · phase 0 · three fixtures · deterministic seed
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--color-ink)" }}>
        {fixtures.map((co, i) => (
          <article
            key={co.id}
            style={{
              padding: 24,
              borderRight: i < fixtures.length - 1 ? "1px solid var(--color-ink)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              aspectRatio: "1",
            }}
          >
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--color-mute)", letterSpacing: "0.04em" }}>
              <span>{co.thesis === "Governed Agentic Ops" ? "GAO" : co.thesis === "Vertical SoR AI" ? "VSRAI" : "BOTH"} · {co.sector.toUpperCase()}</span>
              <span style={{ color: co.priority === "P0" ? "var(--color-accent)" : "var(--color-ink)", fontWeight: 600 }}>{co.priority}</span>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Portrait company={co} size={320} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="display" style={{ fontStyle: "italic", fontSize: 18 }}>{co.company}</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: co.falsifierCheck === "❌ Triggered" || co.antithesisFilter === "Auto-pass" ? "var(--color-mute)" : "var(--color-accent)" }}>
                SSI {co.ssiScore}
              </span>
            </div>
          </article>
        ))}
      </section>

      <footer className="mono" style={{ marginTop: 48, fontSize: 11, color: "var(--color-mute)" }}>
        Filings beat vibes. Signals beat stories. Buyers beat hype.
      </footer>
    </main>
  );
}
