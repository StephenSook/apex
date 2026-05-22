import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const runtime = "nodejs";
export const alt =
  "APEX Sim-rig live | 20 Hz adaptive-controls telemetry tile - Stretch S1 pulled forward to Day 2";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/sim-rig - live telemetry",
    headline: "Real telemetry, audited in flight.",
    subhead:
      "A 20 Hz stream of adaptive-controls telemetry flowing into the APEX coaching loop. Synthetic Sarah Reynolds Donington lap today; live sim-rig WebSocket Day 9.",
    badge: "Sim-rig",
  });
}
