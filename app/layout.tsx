import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://dekhly.app",
  ),
  title: "dekhly — Find where to watch movies & series in India",
  description:
    "Discover trending movies and series and instantly find where to stream, rent or buy them across Netflix, Prime Video, JioHotstar and more — all in one place.",
  keywords: [
    "where to watch",
    "streaming India",
    "Netflix",
    "Prime Video",
    "JioHotstar",
    "movies",
    "web series",
  ],
  openGraph: {
    siteName: "dekhly",
    type: "website",
    title: "dekhly — Find where to watch movies & series in India",
    description:
      "Find where to stream, rent or buy any movie or series across all platforms in India.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-ink text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
