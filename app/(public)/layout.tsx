import type { ReactNode } from "react";
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
          <Nav />
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--color-mute)",
              textAlign: "right",
              lineHeight: 1.4,
            }}
          >
            <b style={{ color: "var(--color-ink)", fontWeight: 600 }}>portraits.anefi.vc</b>
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
        <span>
          <a
            href="https://anefi.vc"
            style={{ color: "var(--color-accent)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}
          >
            anefi.vc
          </a>
        </span>
      </footer>
    </div>
  );
}
