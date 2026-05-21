import { ImageResponse } from "next/og";

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

export function renderOgCard(props: OgCardProps): ImageResponse {
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
          fontFamily: "Georgia, 'Times New Roman', serif",
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
              fontFamily: "ui-monospace, 'SF Mono', monospace",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: RACING_GREEN,
              fontWeight: 600,
            }}
          >
            APEX
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, 'SF Mono', monospace",
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
            fontFamily: "ui-monospace, 'SF Mono', monospace",
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
            fontSize: 84,
            lineHeight: 1.05,
            color: INK,
            fontStyle: "italic",
            fontWeight: 400,
            marginBottom: 36,
            maxWidth: 1000,
            letterSpacing: -1,
          }}
        >
          {props.headline}
        </div>
        <div
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
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
              fontFamily: "ui-monospace, 'SF Mono', monospace",
              fontSize: 18,
              color: PAPER_WARM,
              letterSpacing: 1,
            }}
          >
            github.com/StephenSook/apex
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, 'SF Mono', monospace",
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
    OG_CARD_SIZE,
  );
}
