import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { fetchCompany, fetchSignalsFor } from "@/lib/notion/companies";
import { Portrait } from "@/lib/portrait";
import { PortraitKeys } from "@/components/PortraitKeys";
import { Marquee } from "@/components/Marquee";
import { SignalTimeline } from "@/components/SignalTimeline";
import { catalystUrl } from "@/lib/notion/catalysts";
import { CATALYST_KEYS, isStale } from "@/lib/notion/schema";
import type { CatalystKey } from "@/lib/notion/schema";

interface Params {
  slug: string;
}

async function DetailBody({ params }: { params: Promise<Params> }) {
  await connection();
  const { slug } = await params;
  const co = await fetchCompany(slug);
  if (!co) notFound();
  const signals = co ? await fetchSignalsFor(co.id) : [];
  const stale = isStale(co, new Date());

  const ogHref = `/api/og/${slug}`;

  // Heuristic catalyst key (until per-company catalyst is wired from Notion)
  const catalyst: CatalystKey =
    co.sector === "MedTech AI" || co.sector === "Healthcare AI"
      ? "EHDS"
      : co.sector === "FinServices AI" || co.sector === "Insurance AI"
        ? "DORA"
        : co.sector === "Legal AI"
          ? "GDPR"
          : "EU AI Act";

  return (
    <>
      <PortraitKeys company={co} />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          minHeight: 720,
          border: "1px solid var(--color-ink)",
        }}
      >
        <div
          style={{
            padding: 48,
            borderRight: "1px solid var(--color-ink)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            className="mono"
            style={{
              position: "absolute",
              top: 24,
              left: 32,
              right: 32,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "var(--color-mute)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span>
              <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>
                {co.thesis === "Governed Agentic Ops" ? "GAO" : co.thesis === "Vertical SoR AI" ? "VSRAI" : "BOTH"}
              </b>{" "}
              · {co.sector}
            </span>
            <span>
              SSI <b style={{ color: "var(--color-accent)" }}>{co.ssiScore}</b> · {co.priority}
            </span>
          </div>

          <div style={{ width: "80%", maxWidth: 520, aspectRatio: "1" }}>
            <Portrait company={co} size={520} showLabels stale={stale} />
          </div>

          <div
            className="mono"
            style={{
              position: "absolute",
              bottom: 20,
              left: 32,
              display: "flex",
              gap: 18,
              fontSize: 11,
              color: "var(--color-mute)",
            }}
          >
            <span>
              <kbd style={kbd}>X</kbd> xray
            </span>
            <span>
              <kbd style={kbd}>D</kbd> dark
            </span>
            <span>
              <kbd style={kbd}>S</kbd> share
            </span>
            <span>
              <kbd style={kbd}>?</kbd> help
            </span>
          </div>
        </div>

        <aside style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <header>
            <h1
              className="display"
              style={{ fontSize: 36, fontStyle: "italic", letterSpacing: "-0.015em", lineHeight: 1.05, marginBottom: 8 }}
            >
              {co.company}
            </h1>
            <p className="mono" style={{ fontSize: 11, color: "var(--color-mute)", letterSpacing: "0.04em" }}>
              {co.hq} · {co.stage} · founded {co.founded ?? "—"} · {co.headcount ?? "?"} people
            </p>
          </header>

          {co.oneLiner && (
            <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--color-ink-soft)" }}>{co.oneLiner}</p>
          )}

          {co.lastRaise && (
            <Section label="Last raise" value={co.lastRaise} />
          )}

          {co.keySignal30d && (
            <Section label="Key signal · 30d" value={co.keySignal30d} accent />
          )}

          <Section
            label="Primary catalyst"
            value={
              <a
                href={catalystUrl(catalyst)}
                target="_blank"
                rel="noreferrer noopener"
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                {catalyst} ↗
              </a>
            }
          />

          <Section label="Signal Tier" value={`${co.signalTier} · ${co.priority}`} />

          <Section
            label="Last verified"
            value={
              <>
                {co.lastVerified ?? "—"}{" "}
                {stale && <span style={{ color: "var(--color-mute)" }}>· stale</span>}
              </>
            }
          />

          <Section label="Discovery" value={co.discoverySource} />

          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--color-warm-cream)" }}>
            <Link href="/gallery" className="mono" style={{ fontSize: 11, color: "var(--color-ink)", textDecoration: "none" }}>
              ← back to gallery
            </Link>
            <span className="mono" style={{ marginLeft: 16, fontSize: 11, color: "var(--color-mute)" }}>
              <a href={ogHref} className="mono" style={{ color: "var(--color-mute)", textDecoration: "underline" }}>
                og.png
              </a>
            </span>
          </div>
        </aside>
      </section>

      <section
        style={{
          border: "1px solid var(--color-ink)",
          borderTop: "none",
          padding: "32px 40px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid var(--color-ink)",
          }}
        >
          <h2
            className="display"
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            Signal log
          </h2>
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--color-mute)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {signals.length} signal{signals.length === 1 ? "" : "s"} on file
          </span>
        </header>
        <SignalTimeline signals={signals} />
      </section>
    </>
  );
}

function Section({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className="mono"
        style={{ fontSize: 10, color: "var(--color-mute)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}
      >
        {label}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 13,
          color: accent ? "var(--color-accent)" : "var(--color-ink)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const kbd: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid var(--color-ink)",
  padding: "1px 6px",
  marginRight: 4,
  color: "var(--color-ink)",
  background: "var(--color-warm-white)",
  fontSize: 10,
};

export default function PortraitPage({ params }: { params: Promise<Params> }) {
  return (
    <>
      <Suspense fallback={null}>
        <Marquee />
      </Suspense>
      <Suspense fallback={<div className="mono" style={{ padding: 64, color: "var(--color-mute)" }}>Loading portrait…</div>}>
        <DetailBody params={params} />
      </Suspense>
    </>
  );
}

// Ensure all known catalyst keys remain usable.
export const _catalystKeys = CATALYST_KEYS;
