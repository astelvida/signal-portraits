import type { Company } from "@/lib/notion/schema";
import { isMuted } from "@/lib/notion/schema";
import { GAO } from "./gao";
import { VSRAI } from "./vsrai";
import { Both } from "./both";
import { TOKENS, FONTS } from "./tokens";

/**
 * Server Component. Dispatches by thesis and applies mute mode.
 *
 * Visual output is always a deterministic SVG derived from
 * (slug, thesis, ssiScore). Same inputs → same render.
 *
 * Stale state is computed by the caller (pages compute `isStale(co, now)`
 * after fetching from Notion) and passed in.
 */
export function Portrait({
  company,
  size = 400,
  showLabels = true,
  stale = false,
}: {
  company: Company;
  size?: number;
  showLabels?: boolean;
  stale?: boolean;
}) {
  const muted = isMuted(company);

  const grammar = (() => {
    switch (company.thesis) {
      case "Governed Agentic Ops":
        return <GAO company={company} options={{ size, muted, showLabels }} />;
      case "Vertical SoR AI":
        return <VSRAI company={company} options={{ size, muted, showLabels }} />;
      case "Both":
        return <Both company={company} options={{ size, muted, showLabels }} />;
    }
  })();

  // Fixed pixel size to prevent the SVG from overflowing card containers and
  // bleeding under the bottom strap. Caller controls the box; the portrait
  // never tries to grow beyond `size`.
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        maxWidth: "100%",
        background: TOKENS.WARM_WHITE,
      }}
    >
      {grammar}

      {muted && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 12,
            textAlign: "center",
            fontFamily: FONTS.mono,
            fontSize: 9,
            letterSpacing: "0.06em",
            color: TOKENS.MUTE,
            textTransform: "uppercase",
          }}
        >
          {muteReason(company)}
        </div>
      )}

      {stale && !muted ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: TOKENS.MUTE,
            letterSpacing: "0.06em",
          }}
          title="Last verified > 90 days ago"
        >
          stale
        </div>
      ) : null}
    </div>
  );
}

function muteReason(co: Company): string {
  if (co.falsifierCheck === "❌ Triggered") return "Falsifier triggered";
  if (co.antithesisFilter === "Auto-pass") return "Anti-thesis auto-pass";
  return "";
}
