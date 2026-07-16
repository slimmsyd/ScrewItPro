import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import MotionProvider from "@/components/providers/MotionProvider";
import LocaleProvider from "@/components/providers/LocaleProvider";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

/** Display face from ~/Desktop/miguer-sans (Jolicia Type) */
const miguer = localFont({
  src: [
    {
      path: "../fonts/MiguerSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-miguer",
  display: "swap",
  fallback: ["Instrument Sans", "system-ui", "sans-serif"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const title = "ScrewIt Pros - Furniture Assembly Without the Hassle";
const description =
  "We pick up your furniture, professionally assemble it at our workshop, and deliver it fully built and ready to use. If You Don't Want to Do It, ScrewIt!";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | ScrewIt Pros",
  },
  description,
  applicationName: "ScrewIt Pros",
  authors: [{ name: "ScrewIt Pros LLC" }],
  creator: "ScrewIt Pros",
  keywords: [
    "furniture assembly",
    "Houston",
    "white glove delivery",
    "IKEA assembly",
    "ScrewIt Pros",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon", type: "image/png", sizes: "180x180" },
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_US"],
    url: siteUrl,
    siteName: "ScrewIt Pros",
    title,
    description,
    // Explicit logo share card (src/app/opengraph-image.tsx - brand mark, not people photo)
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ScrewIt Pros logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrument.variable} ${miguer.variable}`}>
      <body className="antialiased">
        <LocaleProvider>
          <MotionProvider>{children}</MotionProvider>
        </LocaleProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
