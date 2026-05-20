import type { NextConfig } from "next";

const config: NextConfig = {
  cacheComponents: true,
  // typedRoutes disabled during build-out — routes will be wired in Task 8.
  // Re-enable once all routes exist by setting `typedRoutes: true` (top-level in Next 16).
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Sevda Anefi · signal-portraits.vercel.app · Signals over stories.
};

export default config;
