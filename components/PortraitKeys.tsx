"use client";

import { useEffect, useState, useCallback } from "react";
import type { Company } from "@/lib/notion/schema";
import { GAO_DIMS } from "@/lib/portrait/dimensions";
import { VSRAI_DIMS, synthGAOVector, synthVSRAIVector } from "@/lib/portrait/dimensions";
import { makeSeed } from "@/lib/portrait/seed";

/**
 * Keyboard controller for the portrait page.
 *  X = toggle xray overlay
 *  D = toggle dark mode
 *  S = open share menu (copy link, OG URL, download)
 *  ? = help overlay
 *  Esc = close any overlay
 */
export function PortraitKeys({ company }: { company: Company }) {
  const [xray, setXray] = useState(false);
  const [help, setHelp] = useState(false);
  const [share, setShare] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    document.cookie = `theme=${isDark ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "x":
          setXray((v) => !v);
          break;
        case "d":
          toggleDark();
          break;
        case "s":
          setShare((v) => !v);
          break;
        case "?":
          setHelp((v) => !v);
          break;
        case "escape":
          setXray(false);
          setHelp(false);
          setShare(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleDark]);

  return (
    <>
      {xray && <XRayOverlay company={company} onClose={() => setXray(false)} />}
      {help && <HelpOverlay onClose={() => setHelp(false)} />}
      {share && (
        <ShareOverlay
          company={company}
          onClose={() => setShare(false)}
          onNote={(n) => {
            setShareNote(n);
            setTimeout(() => setShareNote(null), 1800);
          }}
        />
      )}
      {shareNote && (
        <div
          className="mono"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--color-ink)",
            color: "var(--color-warm-white)",
            padding: "8px 14px",
            fontSize: 11,
            letterSpacing: "0.04em",
            zIndex: 1000,
          }}
        >
          {shareNote}
        </div>
      )}
    </>
  );
}

function dimensionRowsFor(company: Company) {
  const seed = makeSeed(company.slug, company.thesis, company.ssiScore);
  if (company.thesis === "Vertical SoR AI") {
    const v = synthVSRAIVector(company, seed);
    return VSRAI_DIMS.map((d) => ({ label: d.label, score: v[d.key], max: d.max }));
  }
  if (company.thesis === "Both") {
    const g = synthGAOVector(company, seed);
    const v = synthVSRAIVector(company, seed);
    return [
      ...GAO_DIMS.map((d) => ({ label: `GAO · ${d.label}`, score: g[d.key], max: d.max })),
      ...VSRAI_DIMS.map((d) => ({ label: `VSRAI · ${d.label}`, score: v[d.key], max: d.max })),
    ];
  }
  const g = synthGAOVector(company, seed);
  return GAO_DIMS.map((d) => ({ label: d.label, score: g[d.key], max: d.max }));
}

function XRayOverlay({ company, onClose }: { company: Company; onClose: () => void }) {
  const rows = dimensionRowsFor(company);
  return (
    <div
      role="dialog"
      aria-label="X-ray dimension grid"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(250, 250, 247, 0.95)",
        backdropFilter: "blur(2px)",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-warm-white)",
          border: "1px solid var(--color-ink)",
          padding: 32,
          maxWidth: 720,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--color-mute)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
          <span>X-RAY · {company.thesis === "Governed Agentic Ops" ? "GAO" : company.thesis === "Vertical SoR AI" ? "VSRAI" : "BOTH"} SSI v3.0</span>
          <button onClick={onClose} className="mono" style={{ background: "transparent", border: "1px solid var(--color-ink)", padding: "2px 8px", cursor: "pointer", fontSize: 10 }}>esc</button>
        </div>
        <h2 className="display" style={{ fontSize: 22, fontStyle: "italic", marginBottom: 8 }}>{company.company}</h2>
        <p className="mono" style={{ fontSize: 11, color: "var(--color-mute)", marginBottom: 24 }}>
          synthetic dimension vector · per-dimension columns land in Phase 2
        </p>
        <table className="mono" style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} style={{ borderBottom: "1px solid var(--color-warm-cream)" }}>
                <td style={{ padding: "8px 0", color: "var(--color-ink)" }}>{r.label}</td>
                <td style={{ padding: "8px 0", textAlign: "right", color: "var(--color-accent)", fontWeight: 600 }}>
                  {r.score}/{r.max}
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid var(--color-ink)" }}>
              <td style={{ padding: "8px 0", fontWeight: 600 }}>SSI Score</td>
              <td style={{ padding: "8px 0", textAlign: "right", color: "var(--color-accent)", fontWeight: 700 }}>
                {company.ssiScore}/100
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-label="Keyboard shortcuts"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(250, 250, 247, 0.95)",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mono"
        style={{
          background: "var(--color-warm-white)",
          border: "1px solid var(--color-ink)",
          padding: 32,
          fontSize: 12,
          minWidth: 280,
        }}
      >
        <div style={{ fontSize: 10, color: "var(--color-mute)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
          Keys
        </div>
        <Row k="X" v="x-ray dimension grid" />
        <Row k="D" v="dark mode" />
        <Row k="S" v="share menu" />
        <Row k="?" v="this help" />
        <Row k="esc" v="close any overlay" />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: 16, padding: "6px 0" }}>
      <kbd
        className="mono"
        style={{
          display: "inline-block",
          border: "1px solid var(--color-ink)",
          padding: "1px 8px",
          fontSize: 11,
          minWidth: 32,
          textAlign: "center",
        }}
      >
        {k}
      </kbd>
      <span style={{ color: "var(--color-ink-soft)" }}>{v}</span>
    </div>
  );
}

function ShareOverlay({
  company,
  onClose,
  onNote,
}: {
  company: Company;
  onClose: () => void;
  onNote: (s: string) => void;
}) {
  const permalink =
    typeof window !== "undefined" ? `${window.location.origin}/portraits/${company.slug}` : "";
  const ogUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/og/${company.slug}` : "";

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNote(`${label} copied`);
    } catch {
      onNote("copy failed");
    }
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-label="Share"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(250, 250, 247, 0.95)",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mono"
        style={{
          background: "var(--color-warm-white)",
          border: "1px solid var(--color-ink)",
          padding: 32,
          fontSize: 12,
          minWidth: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 10, color: "var(--color-mute)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          Share · {company.company}
        </div>
        <button onClick={() => copy(permalink, "permalink")} className="mono" style={btn}>
          copy permalink
        </button>
        <button onClick={() => copy(ogUrl, "OG image URL")} className="mono" style={btn}>
          copy OG image URL
        </button>
        <a
          href={ogUrl}
          download={`${company.slug}-og.png`}
          className="mono"
          style={{ ...btn, textDecoration: "none", textAlign: "center" }}
        >
          download OG png
        </a>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "var(--color-warm-white)",
  border: "1px solid var(--color-ink)",
  color: "var(--color-ink)",
  padding: "8px 12px",
  fontSize: 12,
  cursor: "pointer",
  textAlign: "left",
};
