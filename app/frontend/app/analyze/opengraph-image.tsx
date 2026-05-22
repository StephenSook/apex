import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const runtime = "nodejs";
export const alt =
  "APEX Analyze | Upload telemetry, COA, and debrief - corner-by-corner coaching report in ~60s";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/analyze - the demo path",
    headline: "Three slots. One coaching report. Sixty seconds.",
    subhead:
      "Upload telemetry CSV, FIA Certificate of Adaptations PDF, and the driver's debrief. APEX returns a corner-by-corner report with Guardian audit and provenance footer.",
    badge: "Analyze",
  });
}
