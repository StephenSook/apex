import { ImageResponse } from "next/og";

import { loadBrandFonts } from "./brand-fonts";

/**
 * BeMyApp 1920x600 banner renderer.
 *
 * Editorial magazine cover, typography-first, warm cream paper. Deliberate
 * contrast with the universal dark-cinematic banner aesthetic observed
 * across competing projects in the BeMyApp gallery (calibration source
 * kept in private memory per the project's operator-attribution rule).
 *
 * Fonts loaded via the shared `loadBrandFonts` helper in `./brand-fonts`,
 * which guards the Google Fonts fetch with AbortSignal.timeout + Content-Type
 * validation + parallel fetches. The rendered PNG is committed once to
 * `deliverables/bemyapp-banner-1920x600.png` and that file is the artifact
 * uploaded to the BeMyApp project page top slot. The route handler at
 * `app/bemyapp-banner/route.ts` calls this for iteration + re-renders.
 *
 * Brand brief: `docs/banner-brand-brief.md`.
 */

export const BANNER_SIZE = { width: 1920, height: 600 } as const;
export const BANNER_CONTENT_TYPE = "image/png" as const;

const PAPER = "#F4EBD8";
const PAPER_WARM = "#EAE0C7";
const RACING_GREEN = "#0A2818";
const ACCENT = "#C1492C";
const AMBER = "#D9A441";
const INK = "#0F1410";
const INK_SOFT = "#1F2A22";
const MUTED = "#6F6657";

export async function renderBeMyAppBanner(): Promise<ImageResponse> {
  const fonts = await loadBrandFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          fontFamily: "PlexSans",
          color: INK,
          position: "relative",
        }}
      >
        <MastheadStrip />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            padding: "32px 88px 24px 88px",
          }}
        >
          <LeftMasthead />
          <RightLockup />
        </div>
        <FooterStrip />
      </div>
    ),
    {
      ...BANNER_SIZE,
      fonts: [...fonts],
    },
  );
}

function MastheadStrip() {
  return (
    <div
      style={{
        background: RACING_GREEN,
        color: PAPER_WARM,
        padding: "10px 88px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "PlexMono",
        fontSize: 18,
        letterSpacing: 4,
        textTransform: "uppercase",
        borderBottom: `2px solid ${AMBER}`,
      }}
    >
      <span>IBM SkillsBuild AI Builders Challenge</span>
      <span style={{ color: AMBER }}>Vol. 01 - No. 01</span>
      <span>May 2026</span>
    </div>
  );
}

function LeftMasthead() {
  return (
    <div
      style={{
        flex: "0 0 58%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingRight: 24,
      }}
    >
      <div
        style={{
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 260,
          lineHeight: 0.92,
          color: INK,
          letterSpacing: -8,
          marginBottom: 12,
        }}
      >
        APEX
      </div>
      <div
        style={{
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.14,
          color: INK_SOFT,
          maxWidth: 950,
          marginBottom: 18,
        }}
      >
        The race engineer for the drivers who don&rsquo;t have one.
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            background: ACCENT,
            color: PAPER,
            fontFamily: "PlexSans",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "8px 14px",
            borderRadius: 2,
          }}
        >
          First integrated workflow for adaptive hand-controls
        </div>
      </div>
    </div>
  );
}

function RightLockup() {
  return (
    <div
      style={{
        flex: "1 1 42%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        paddingLeft: 24,
        borderLeft: `1px solid ${INK}33`,
      }}
    >
      <SectorLabel />
      <RacingLineCurve />
      <DeltaCallout />
      <CoaSticker />
    </div>
  );
}

function SectorLabel() {
  return (
    <div
      style={{
        fontFamily: "PlexMono",
        fontSize: 18,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: RACING_GREEN,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <span>Sector 2 - Old Hairpin</span>
      <span style={{ color: MUTED, fontSize: 16, letterSpacing: 2 }}>Donington Park GP</span>
    </div>
  );
}

function RacingLineCurve() {
  return (
    <div
      style={{
        position: "relative",
        height: 200,
        display: "flex",
        alignItems: "center",
      }}
    >
      <svg width="700" height="200" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 20 30 C 200 30, 280 30, 360 90 S 540 170, 680 170"
          stroke={INK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 20 30 C 200 30, 280 30, 360 90 S 540 170, 680 170"
          stroke={ACCENT}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity="0.6"
        />
        <circle cx="360" cy="90" r="9" fill={ACCENT} />
        <circle cx="360" cy="90" r="18" fill="none" stroke={ACCENT} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function DeltaCallout() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontFamily: "PlexMono",
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 56,
          fontWeight: 500,
          color: ACCENT,
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        +0.34s
      </span>
      <span
        style={{
          fontSize: 17,
          color: MUTED,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Lap 17 of 19 - Sarah Reynolds (fictional persona)
      </span>
    </div>
  );
}

function CoaSticker() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          background: AMBER,
          color: INK,
          fontFamily: "PlexMono",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: "uppercase",
          padding: "8px 14px",
          borderRadius: 2,
        }}
      >
        COA hardware spec - simultaneity derived
      </div>
    </div>
  );
}

function FooterStrip() {
  return (
    <div
      style={{
        background: RACING_GREEN,
        color: PAPER_WARM,
        padding: "12px 88px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "PlexMono",
        fontSize: 18,
        letterSpacing: 2,
        borderTop: `2px solid ${AMBER}`,
      }}
    >
      <span>github.com/StephenSook/apex</span>
      <span style={{ color: AMBER }}>Built on IBM Granite - 8 tools, all load-bearing</span>
      <span>Apache 2.0</span>
    </div>
  );
}
