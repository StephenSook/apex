import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
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

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  // Default to a known-resolvable Vercel URL until apex.race is registered + DNS configured (Q-007).
  // Flip to "https://apex.race" once domain is live in production.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://apex-race.vercel.app",
  ),
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
    "Team BRIT",
    "FIA Certificate of Adaptations",
    "Granite TimeSeries TTM",
    "PhysicsTTM",
    "IBM SkillsBuild",
    "motorsport AI",
  ],
  openGraph: {
    title: "APEX | AI race engineer for adaptive racers",
    description:
      "The same IBM Granite stack that ships to Scuderia Ferrari's fan app, pointed at the drivers who need a race engineer most.",
    siteName: "APEX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "APEX | AI race engineer for adaptive racers",
    description:
      "AI race engineer for adaptive racers. Built on IBM Granite for IBM SkillsBuild May Challenge 2026.",
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
        {children}
      </body>
    </html>
  );
}
