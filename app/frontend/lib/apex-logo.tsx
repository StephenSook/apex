import { ImageResponse } from "next/og";

import { loadBrandFonts } from "./brand-fonts";

/**
 * APEX project-logo renderer (square, circle-crop-safe).
 *
 * BeMyApp displays the project logo cropped to a CIRCLE (the upload slot shows
 * a circular avatar). So every variant is full-bleed background + centered
 * content kept well clear of the corners, so nothing important is clipped by
 * the circle mask. Rendered at 512x512 for retina headroom (BeMyApp recommends
 * 100x100 and downscales; max 5mb leaves ample room). Shares the editorial
 * brand palette + `loadBrandFonts` helper with `./bemyapp-banner`.
 *
 * Re-render the committed PNG via `app/frontend/scripts/render-logo.tsx`.
 */

export const LOGO_SIZE = { width: 512, height: 512 } as const;
export const LOGO_CONTENT_TYPE = "image/png" as const;

const PAPER = "#F4EBD8";
const RACING_GREEN = "#0A2818";
const ACCENT = "#C1492C";
const AMBER = "#D9A441";

export type LogoVariant =
  | "monogram-green"
  | "monogram-paper"
  | "curve-mark"
  | "wordmark-green";

export const LOGO_VARIANTS: ReadonlyArray<LogoVariant> = [
  "monogram-green",
  "monogram-paper",
  "curve-mark",
  "wordmark-green",
];

export async function renderApexLogo(
  variant: LogoVariant = "monogram-green",
): Promise<ImageResponse> {
  const fonts = await loadBrandFonts();
  return new ImageResponse(<Logo variant={variant} />, {
    ...LOGO_SIZE,
    fonts: [...fonts],
  });
}

function Logo({ variant }: { variant: LogoVariant }) {
  switch (variant) {
    case "monogram-paper":
      return <MonogramPaper />;
    case "curve-mark":
      return <CurveMark />;
    case "wordmark-green":
      return <WordmarkGreen />;
    case "monogram-green":
    default:
      return <MonogramGreen />;
  }
}

/** Big italic Fraunces "A" on racing green, clay apex dot at the letter's peak. */
function MonogramGreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: RACING_GREEN,
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 380,
          lineHeight: 1,
          color: PAPER,
          letterSpacing: -12,
          marginTop: -8,
        }}
      >
        A
      </div>
      <div
        style={{
          position: "absolute",
          top: 132,
          left: 296,
          width: 60,
          height: 60,
          borderRadius: 60,
          background: ACCENT,
          display: "flex",
        }}
      />
    </div>
  );
}

/** Paper field, racing-green italic "A", clay apex dot. Lighter twin. */
function MonogramPaper() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PAPER,
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 380,
          lineHeight: 1,
          color: RACING_GREEN,
          letterSpacing: -12,
          marginTop: -8,
        }}
      >
        A
      </div>
      <div
        style={{
          position: "absolute",
          top: 132,
          left: 296,
          width: 60,
          height: 60,
          borderRadius: 60,
          background: ACCENT,
          display: "flex",
        }}
      />
    </div>
  );
}

/** Pure apex mark: a racing-line corner with the clay apex dot, no letter. */
function CurveMark() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: RACING_GREEN,
      }}
    >
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 76 150 C 210 150, 250 150, 300 256 S 410 372, 436 372"
          stroke={PAPER}
          strokeWidth="26"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="300" cy="256" r="56" fill="none" stroke={ACCENT} strokeWidth="8" />
        <circle cx="300" cy="256" r="32" fill={ACCENT} />
      </svg>
    </div>
  );
}

/** APEX wordmark on green, clay apex dot over the peak of the A. */
function WordmarkGreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: RACING_GREEN,
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 1,
          color: PAPER,
          letterSpacing: -6,
          display: "flex",
        }}
      >
        APEX
      </div>
      <div
        style={{
          marginTop: 26,
          width: 132,
          height: 8,
          borderRadius: 8,
          background: AMBER,
          display: "flex",
        }}
      />
    </div>
  );
}
