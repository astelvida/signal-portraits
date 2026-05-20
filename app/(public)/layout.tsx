import type { ReactNode } from "react";
import { Suspense } from "react";
import { Wordmark } from "@/components/Wordmark";
import { Nav } from "@/components/Nav";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px 96px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 32,
          paddingBottom: 16,
          borderBottom: "2px solid var(--color-ink)",
          marginBottom: 32,
        }}
      >
        <Wordmark />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <Suspense fallback={<NavFallback />}>
            <Nav />
          </Suspense>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--color-mute)",
              textAlign: "right",
              lineHeight: 1.4,
            }}
          >
            <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>signal-portraits.vercel.app</b>
            {" · Sevda Anefi"}
          </div>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer
        className="mono"
        style={{
          marginTop: 96,
          paddingTop: 24,
          borderTop: "1px solid var(--color-ink)",
          fontSize: 11,
          color: "var(--color-mute)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Filings beat vibes. Signals beat stories. Buyers beat hype.</span>
        <span>signal-portraits.vercel.app</span>
      </footer>
    </div>
  );
}

// Static placeholder reserving the nav row's height to avoid layout shift
// while the client component hydrates with pathname-aware styling.
function NavFallback() {
  return (
    <div
      className="mono"
      aria-hidden
      style={{
        height: 16,
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--color-mute)",
      }}
    >
      Gallery · Methodology · Thesis
    </div>
  );
}
