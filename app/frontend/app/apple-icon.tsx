import { ImageResponse } from "next/og";

/**
 * Wave-44 Phase 6e Apple touch icon 180x180. iOS home-screen install
 * pulls this image for the Add to Home Screen affordance. Editorial-
 * paddock palette: cream paper background + racing-green APEX serif
 * italic. No alpha, no transparency (iOS rejects transparent apple-
 * touch-icons + auto-fills with black; the cream fill preserves the
 * intentional editorial aesthetic).
 */

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 56,
          background: "#F4EBD8",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0A2818",
          fontFamily: "serif",
          fontStyle: "italic",
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        APEX
      </div>
    ),
    {
      ...size,
    },
  );
}
