"use client";

import { useQueryState, parseAsStringEnum, parseAsArrayOf, parseAsString } from "nuqs";
import { useMemo } from "react";

const THESIS = ["all", "gao", "vsrai", "both"] as const;
const TIERS = ["P0", "P1", "P2", "P3"] as const;
const SECTORS = [
  "FinServices AI",
  "MedTech AI",
  "Healthcare AI",
  "Insurance AI",
  "Legal AI",
  "AI Governance",
  "Workflow Infra",
  "Eval Infra",
  "Defence AI",
] as const;

export function GalleryToolbar({ total }: { total: number }) {
  // shallow:false makes each chip click trigger a server re-fetch so the
  // grid actually filters. scroll:false keeps the grid in view. history:push
  // lets the back button walk through filter combos.
  const nuqsOpts = { shallow: false, history: "push" as const, scroll: false };
  const [thesis, setThesis] = useQueryState(
    "thesis",
    parseAsStringEnum([...THESIS]).withDefault("all").withOptions(nuqsOpts),
  );
  const [tiers, setTiers] = useQueryState(
    "tier",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions(nuqsOpts),
  );
  const [sectors, setSectors] = useQueryState(
    "sector",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions(nuqsOpts),
  );

  const toggleTier = (t: string) =>
    setTiers(tiers.includes(t) ? tiers.filter((x) => x !== t) : [...tiers, t]);
  const toggleSector = (s: string) =>
    setSectors(sectors.includes(s) ? sectors.filter((x) => x !== s) : [...sectors, s]);

  const activeFilterCount = useMemo(
    () => (thesis !== "all" ? 1 : 0) + tiers.length + sectors.length,
    [thesis, tiers, sectors],
  );

  return (
    <div
      className="mono"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 32,
        padding: "16px 32px",
        borderBottom: "1px solid var(--color-ink)",
        fontSize: 11,
      }}
    >
      <FilterGroup label="Thesis">
        {THESIS.map((t) => (
          <Chip
            key={t}
            active={thesis === t}
            onClick={() => setThesis(t)}
            label={t === "all" ? "All" : t === "gao" ? "GAO" : t === "vsrai" ? "VSRAI" : "Both"}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Tier">
        {TIERS.map((t) => (
          <Chip
            key={t}
            active={tiers.includes(t)}
            accent={t === "P0"}
            onClick={() => toggleTier(t)}
            label={t}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Sector">
        {SECTORS.map((s) => (
          <Chip
            key={s}
            active={sectors.includes(s)}
            onClick={() => toggleSector(s)}
            label={s.replace(" AI", "")}
            small
          />
        ))}
      </FilterGroup>

      <div
        style={{
          marginLeft: "auto",
          color: "var(--color-mute)",
          fontSize: 11,
        }}
      >
        Sort: <b style={{ color: "var(--color-ink)" }}>Last signal</b> ↓ ·{" "}
        <b style={{ color: "var(--color-ink)" }}>{total}</b> portraits
        {activeFilterCount > 0 && (
          <>
            {" · "}
            <button
              onClick={() => {
                setThesis("all");
                setTiers([]);
                setSectors([]);
              }}
              className="mono"
              style={{
                background: "transparent",
                border: "1px solid var(--color-ink)",
                padding: "2px 8px",
                marginLeft: 6,
                cursor: "pointer",
                fontSize: 10,
                color: "var(--color-ink)",
              }}
            >
              clear ({activeFilterCount})
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <b
        style={{
          color: "var(--color-mute)",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontSize: 10,
        }}
      >
        {label}
      </b>
      <div style={{ display: "flex", gap: 8 }}>{children}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  accent,
  onClick,
  small,
}: {
  label: string;
  active: boolean;
  accent?: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      className="chip"
      data-active={active}
      onClick={onClick}
      style={{
        padding: small ? "3px 8px" : "4px 10px",
        border: `1px solid ${accent ? "var(--color-accent)" : "var(--color-ink)"}`,
        background: active ? "var(--color-ink)" : "var(--color-warm-white)",
        color: active
          ? "var(--color-warm-white)"
          : accent
            ? "var(--color-accent)"
            : "var(--color-ink)",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: small ? 10 : 11,
        cursor: "pointer",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}
