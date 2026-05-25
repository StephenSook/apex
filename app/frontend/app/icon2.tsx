import { ImageResponse } from "next/og";

/**
 * Wave-44 Phase 6e PWA 512x512 maskable home-screen icon. Editorial-
 * paddock palette: cream paper #F4EBD8 background + racing-green
 * #0A2818 APEX wordmark serif italic. Inner safe area = 80% of canvas
 * per maskable-icon spec so the wordmark renders fully even when the
 * platform crops to a circle / squircle / squared mask.
 */

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon2() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F4EBD8",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "80%",
            height: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 160,
            color: "#0A2818",
            fontFamily: "serif",
            fontStyle: "italic",
            fontWeight: 700,
            letterSpacing: -6,
          }}
        >
          APEX
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
