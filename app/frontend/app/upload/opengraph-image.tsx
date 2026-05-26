import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX upload | Judge-uploadable telemetry CSV with strict server-side parser (5MB cap + 10k row cap + per-channel summary stats)";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "edge";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/upload - telemetry CSV",
    headline: "Upload your telemetry.",
    subhead:
      "Strict server-side parser. 5 MB cap. Canonical APEX-Bench schema. Per-channel min / max / mean summary stats. Operator-empathy surface per Sookra Methodology Pillar 4.",
    badge: "Upload",
  });
}
