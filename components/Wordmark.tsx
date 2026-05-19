import Link from "next/link";

export function Wordmark({ size = 34 }: { size?: number }) {
  return (
    <Link
      href="/"
      style={{
        fontFamily: "var(--font-fraunces), serif",
        fontSize: size,
        fontWeight: 600,
        fontStyle: "italic",
        letterSpacing: "-0.02em",
        textDecoration: "none",
        color: "var(--color-ink)",
        lineHeight: 1,
      }}
    >
      Signal Portraits<span style={{ color: "var(--color-accent)" }}>.</span>
    </Link>
  );
}
