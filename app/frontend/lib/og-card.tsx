import { ImageResponse } from "next/og";

import { loadBrandFonts } from "./brand-fonts";

/**
 * 1200x630 OG card renderer used by `app/opengraph-image.tsx` and the four
 * per-route variants at `app/{analyze,judges,status,sim-rig}/opengraph-image.tsx`.
 *
 * Loads brand fonts (Fraunces italic + IBM Plex Sans + IBM Plex Mono) via
 * the shared `loadBrandFonts` helper so the social-share preview matches the
 * banner's editorial-paddock identity. Previously this file relied on system
 * font names ("Georgia", "SF Mono", "Segoe UI") which Satori cannot resolve
 * and which silently fell back to its bundled default. Wave-22 cold review
 * caught the brand-fidelity loss; this file now uses the same Fraunces +
 * Plex pair the banner ships.
 */

export const OG_CARD_SIZE = { width: 1200, height: 630 } as const;
export const OG_CARD_CONTENT_TYPE = "image/png" as const;

const PAPER = "#F4EBD8";
const PAPER_WARM = "#EAE0C7";
const RACING_GREEN = "#0A2818";
const ACCENT = "#C1492C";
const AMBER = "#D9A441";
const INK = "#0F1410";
const MUTED = "#6F6657";

export interface OgCardProps {
  readonly eyebrow: string;
  readonly headline: string;
  readonly subhead: string;
  readonly badge: string;
}

export async function renderOgCard(props: OgCardProps): Promise<ImageResponse> {
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
          padding: "72px 84px",
          fontFamily: "PlexSans",
          color: INK,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: RACING_GREEN,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 0,
            right: 0,
            height: 4,
            background: AMBER,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontFamily: "PlexMono",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: RACING_GREEN,
              fontWeight: 500,
            }}
          >
            APEX
          </span>
          <span
            style={{
              fontFamily: "PlexMono",
              fontSize: 16,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: PAPER,
              background: RACING_GREEN,
              padding: "8px 16px",
              borderRadius: 3,
            }}
          >
            {props.badge}
          </span>
        </div>
        <div
          style={{
            fontFamily: "PlexMono",
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 20,
            fontWeight: 500,
          }}
        >
          {props.eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: 84,
            lineHeight: 1.05,
            color: INK,
            fontStyle: "italic",
            fontWeight: 700,
            marginBottom: 36,
            maxWidth: 1000,
            letterSpacing: -1,
          }}
        >
          {props.headline}
        </div>
        <div
          style={{
            fontFamily: "PlexSans",
            fontSize: 28,
            lineHeight: 1.35,
            color: MUTED,
            maxWidth: 1000,
          }}
        >
          {props.subhead}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: RACING_GREEN,
            padding: "20px 84px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "PlexMono",
              fontSize: 18,
              color: PAPER_WARM,
              letterSpacing: 1,
            }}
          >
            github.com/StephenSook/apex
          </span>
          <span
            style={{
              fontFamily: "PlexMono",
              fontSize: 18,
              color: AMBER,
              letterSpacing: 1,
            }}
          >
            IBM Granite | Apache 2.0
          </span>
        </div>
      </div>
    ),
    { ...OG_CARD_SIZE, fonts: [...fonts] },
  );
}
