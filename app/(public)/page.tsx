import { Suspense } from "react";
import Link from "next/link";
import { featuredCompany } from "@/lib/notion/companies";
import { Marquee } from "@/components/Marquee";
import { Portrait } from "@/lib/portrait";
import { isStale } from "@/lib/notion/schema";
import { connection } from "next/server";

async function FeaturedPortrait() {
  await connection(); // mark this branch dynamic so `new Date()` is allowed
  const co = await featuredCompany();
  if (!co) {
    return (
      <div style={{ padding: 64, color: "var(--color-mute)" }} className="mono">
        No featured company yet.
      </div>
    );
  }
  const stale = isStale(co, new Date());
  return (
    <Link
      href={`/portraits/${co.slug}`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        minHeight: 560,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        className="mono"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          fontSize: 10,
          color: "var(--color-mute)",
          lineHeight: 1.7,
        }}
      >
        <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>FEATURED · {co.priority}</b>
        <br />
        {co.thesis === "Governed Agentic Ops" ? "GAO" : co.thesis === "Vertical SoR AI" ? "VSRAI" : "BOTH"} · {co.sector}
        <br />
        SSI <b style={{ color: "var(--color-accent)" }}>{co.ssiScore}</b>
      </div>
      <div style={{ width: "80%", aspectRatio: "1" }}>
        <Portrait company={co} size={520} showLabels stale={stale} />
      </div>
      <div
        className="mono"
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 10,
          color: "var(--color-mute)",
        }}
      >
        <span
          className="display"
          style={{ fontStyle: "italic", fontSize: 16, color: "var(--color-ink)" }}
        >
          {co.company}
        </span>
        <span>
          <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>SSI {co.ssiScore}</span>{" "}
          · {co.signalTier.split(" ")[0]} {co.priority}
        </span>
      </div>
    </Link>
  );
}

function FeaturedSkeleton() {
  return (
    <div
      style={{ minHeight: 560, display: "flex", alignItems: "center", justifyContent: "center" }}
      className="mono"
    >
      <span style={{ color: "var(--color-mute)", fontSize: 11 }}>Loading featured portrait…</span>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 0,
          border: "1px solid var(--color-ink)",
          marginBottom: 0,
        }}
      >
        <div
          style={{
            padding: "64px 48px 56px",
            borderRight: "1px solid var(--color-ink)",
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--color-accent)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 32,
            }}
          >
            European AI · two-thesis canon · SSI v3.0
          </div>
          <h1
            className="display"
            style={{
              fontSize: 64,
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: "-0.025em",
              marginBottom: 24,
            }}
          >
            One portrait per <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>thesis-fit</em> European AI startup.
          </h1>
          <p
            className="display"
            style={{
              fontSize: 20,
              fontWeight: 300,
              lineHeight: 1.4,
              maxWidth: "48ch",
              color: "var(--color-ink-soft)",
            }}
          >
            Each artwork is the company&rsquo;s actual signal stack rendered as structure. No fixed hue. The visual language switches between Governed Agentic Ops and Vertical System-of-Record AI. The portrait moves when a new signal lands.
          </p>
          <div
            className="mono"
            style={{
              marginTop: 48,
              fontSize: 11,
              color: "var(--color-mute)",
            }}
          >
            <b style={{ color: "var(--color-ink)", fontWeight: 500 }}>Sevda Anefi</b> ·{" "}
            <a
              href="https://anefi.vc"
              style={{ color: "var(--color-accent)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}
            >
              anefi.vc
            </a>
            <br />
            <Link
              href="/gallery"
              style={{
                display: "inline-block",
                marginTop: 16,
                padding: "8px 14px",
                border: "1px solid var(--color-ink)",
                color: "var(--color-ink)",
                textDecoration: "none",
                fontSize: 11,
              }}
            >
              Open the gallery →
            </Link>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedPortrait />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={null}>
        <Marquee />
      </Suspense>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          border: "1px solid var(--color-ink)",
          borderTop: "none",
        }}
      >
        <article style={{ padding: "48px 40px", borderRight: "1px solid var(--color-ink)" }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--color-accent)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Thesis I
          </div>
          <h2
            className="display"
            style={{
              fontSize: 34,
              fontWeight: 400,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Governed Agentic Ops
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--color-ink-soft)", maxWidth: "48ch" }}>
            The deployment gateway for enterprise AI. Runtime governance, observability, evaluation, audit evidence, human oversight, policy enforcement. The companies that make autonomous workflows legal to run in regulated Europe.
          </p>
        </article>
        <article style={{ padding: "48px 40px" }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--color-accent)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Thesis II
          </div>
          <h2
            className="display"
            style={{
              fontSize: 34,
              fontWeight: 400,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Vertical System-of-Record AI
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--color-ink-soft)", maxWidth: "48ch" }}>
            Workflow gravity beats model novelty. AI that becomes, extends, or controls the regulated workflow&rsquo;s system of record. Writes back, owns the evidence, accumulates proprietary domain data.
          </p>
        </article>
      </section>
    </>
  );
}
