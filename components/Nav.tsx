"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/methodology", label: "Methodology" },
  { href: "/thesis", label: "Thesis" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="mono"
      aria-label="Primary"
      style={{
        display: "flex",
        gap: 28,
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        alignItems: "center",
      }}
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{
              color: active ? "var(--color-ink)" : "var(--color-mute)",
              fontWeight: active ? 600 : 500,
              textDecoration: "none",
            }}
          >
            {item.label}
          </Link>
        );
      })}
      <a
        href="https://anefi.vc"
        target="_blank"
        rel="noreferrer noopener"
        style={{
          color: "var(--color-mute)",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        anefi.vc <span aria-hidden>↗</span>
      </a>
    </nav>
  );
}
