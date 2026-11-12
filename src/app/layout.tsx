import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HideOn } from "@/components/HideOn";
import { PREFS_BOOTSTRAP_SCRIPT } from "@/lib/store";
import { SITE } from "@/config/site";

const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-latin-soft-normal.woff2", style: "normal", weight: "100 900" },
    { path: "../fonts/fraunces-latin-soft-italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const jakarta = localFont({
  src: [{ path: "../fonts/plus-jakarta-sans-latin-wght-normal.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-jakarta",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "FRAME-24 — A private autism self-exploration experience",
    template: "%s | FRAME-24",
  },
  description:
    "FRAME-24 is a free, private self-reflection experience for adults in Ireland exploring autistic traits. 24 statements, six areas, a personal report. Not a diagnostic test.",
  applicationName: "FRAME-24",
  openGraph: {
    type: "website",
    locale: "en_IE",
    siteName: "FRAME-24",
    title: "FRAME-24 — A private autism self-exploration experience",
    description:
      "24 statements, six areas of experience and a free personal report. Private by design. Not a diagnostic test.",
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4fa" },
    { media: "(prefers-color-scheme: dark)", color: "#14121c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IE"
      data-theme="light"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink">
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <HideOn paths={["/experience"]}>
          <SiteFooter />
        </HideOn>
      </body>
    </html>
  );
}
