import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX compare | Multi-driver baseline-vs-improved coaching report comparison with delta visualization";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "nodejs";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/compare - multi-driver delta",
    headline: "Baseline versus improved.",
    subhead:
      "Two-driver side-by-side coaching report with delta pills + verdict synthesis. Driver-agnostic by design per Lane K persona-decoupling rule.",
    badge: "Compare",
  });
}
