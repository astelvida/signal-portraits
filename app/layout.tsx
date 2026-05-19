import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { fraunces, dmSans, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://portraits.anefi.vc"
  ),
  title: "Signal Portraits",
  description:
    "One portrait per European AI thesis-fit startup.",
  authors: [{ name: "Sevda Anefi", url: "https://anefi.vc" }],
  creator: "Sevda Anefi",
  openGraph: {
    type: "website",
    siteName: "Signal Portraits",
    title: "Signal Portraits",
    description: "One portrait per European AI thesis-fit startup.",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@sevdaanefi",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
