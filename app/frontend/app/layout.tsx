import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { OneHandModeProvider } from "../lib/one-hand-mode";
import OneHandModeToggle from "../components/OneHandModeToggle";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Wave-44 Phase 9 perf HIGH #4 close-out per vercel:performance-optimizer:
// dropped SOFT + WONK axes (kept opsz which is load-bearing for the
// editorial-paddock display headers across the / + /judges hero sizes).
// Italic kept; "italic text-racing-green" / "italic text-amber" is
// load-bearing across hero subtitles, dropping it would cascade through
// 30+ component sites. Net woff2 drop: ~150-180KB across the two
// served font files.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

// Wave-38 Stream D: apex-one-black.vercel.app domain DNS confirmed pointed to Vercel
// 2026-05-23 (Stephen). Fallback updated from the prior
// apex-race.vercel.app to the canonical apex-one-black.vercel.app origin so server-
// rendered metadata (Open Graph + Twitter Card + canonical) emits
// production URLs even when NEXT_PUBLIC_SITE_URL is unset. The
// apex-race.vercel.app subdomain still resolves as a Vercel-served
// alias; the canonical metadataBase is apex-one-black.vercel.app per the wave-38
// runbook cutover.
//
// `??` only catches null/undefined; empty-string or invalid-URL env
// vars still throw inside `new URL()` at module-load time and brick
// the production build with no hint of the env-var cause; try/catch
// preserves diagnostic + falls back gracefully.
function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = "https://apex-one-black.vercel.app";
  if (!raw) return new URL(fallback);
  try {
    return new URL(raw);
  } catch {
    console.warn(
      `[metadataBase] NEXT_PUBLIC_SITE_URL='${raw}' is not a valid URL; falling back to ${fallback}.`,
    );
    return new URL(fallback);
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: "APEX | AI race engineer for adaptive racers",
    template: "%s | APEX",
  },
  description:
    "An agentic AI race engineer for adaptive, veteran, and grassroots racers, built on IBM Granite. IBM SkillsBuild May Challenge 2026.",
  authors: [{ name: "Stephen Sookra" }, { name: "Vinh Le" }],
  applicationName: "APEX",
  keywords: [
    "AI race engineer",
    "IBM Granite",
    "adaptive motorsport",
    "FIA Certificate of Adaptations",
    "Granite TimeSeries TTM",
    "PhysicsTTM",
    "IBM SkillsBuild",
    "motorsport AI",
  ],
  // Wave-39 codex AXIS 2 close-out: declare canonical + openGraph.url
  // explicitly so the resolved canonical anchors to apex-one-black.vercel.app (vs the
  // Vercel-served alias apex-race.vercel.app), preventing duplicate-
  // content signals to Google + LinkedIn Open Graph crawlers + the
  // BeMyApp judge-portal preview from picking the wrong origin. Next
  // resolves these as relative against metadataBase (= apex-one-black.vercel.app).
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "APEX | AI race engineer for adaptive racers",
    description:
      "The same IBM Granite stack that ships to Scuderia Ferrari's fan app, pointed at the drivers who need a race engineer most.",
    siteName: "APEX",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-architecture.png",
        width: 784,
        height: 805,
        alt: "APEX architecture diagram: driver inputs through the three-layer PhysicsTTM pipeline to coaching outputs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APEX | AI race engineer for adaptive racers",
    description:
      "AI race engineer for adaptive racers. Built on IBM Granite for IBM SkillsBuild May Challenge 2026.",
    images: ["/og-architecture.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans selection:bg-accent/30 selection:text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-racing-green focus:px-4 focus:py-2 focus:text-paper focus:font-mono focus:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
        >
          Skip to main content
        </a>
        <OneHandModeProvider>
          {children}
          <div className="fixed bottom-4 right-4 z-40 shadow-lg">
            <OneHandModeToggle />
          </div>
        </OneHandModeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
