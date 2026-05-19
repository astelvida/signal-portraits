import type { NextConfig } from "next";

const config: NextConfig = {
  cacheComponents: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Sevda Anefi · portraits.anefi.vc · Signals over stories.
};

export default config;
