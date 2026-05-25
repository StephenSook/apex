import { ImageResponse } from "next/og";

/**
 * Wave-44 Phase 6e PWA 192x192 home-screen icon. Editorial-paddock
 * palette: cream paper #F4EBD8 background + racing-green #0A2818
 * APEX wordmark serif (system serif fallback since Fraunces is not
 * statically bundled into ImageResponse; system serif preserves the
 * editorial feel without the font-fetch cost). Referenced from
 * app/manifest.ts as the primary 192x192 home-screen icon.
 */

export const size = {
  width: 192,
  height: 192,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
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
          letterSpacing: -2,
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
