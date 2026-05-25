import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX LIPS harness | 4-axis evaluation ablation table (Latency + Integrity + Physics + Skill) per D-026 + G10 reproducibility statement";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "nodejs";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/lips-harness - 4-axis ablation",
    headline: "Latency. Integrity. Physics. Skill.",
    subhead:
      "Four configurations versus four axes. Zero-shot TTM, soft-loss-only, APEX hard projection, full 3-track ensemble + 8-tier physics. Per D-026 + G10 reproducibility statement.",
    badge: "LIPS",
  });
}
