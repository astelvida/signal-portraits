// Brand tokens used inside the generative system.
// Keep in lock-step with app/globals.css.

export const TOKENS = {
  WARM_WHITE: "#FAFAF7",
  WARM_CREAM: "#F2EDE3",
  INK: "#0E0E0E",
  INK_SOFT: "#1F1F1F",
  MUTE: "#7A7A75",
  ACCENT: "#E63312",
} as const;

export const CANVAS = {
  // Wireframe portraits use a 400×400 SVG viewBox; we adopt the same.
  // The visual is square 1:1; consumers scale via container width.
  size: 400,
  grid: 4,
  padding: 20,
} as const;

export const FONTS = {
  display: "var(--font-fraunces), Georgia, serif",
  ui: "var(--font-dm-sans), system-ui, sans-serif",
  mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
} as const;
