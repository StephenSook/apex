import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX judge-tour | 6-step narrative walkthrough for evaluators (problem -> IBM stack -> byte-equality -> COA gate -> galaxy moves -> submission)";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "nodejs";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/judge-tour - 6-step narrative",
    headline: "APEX, walked through.",
    subhead:
      "Six steps cover the problem, the IBM stack, the engine-agnostic byte-equality lock, the COA-parameterized simultaneity gate, the galaxy-tier moves, and the submission package.",
    badge: "Judge tour",
  });
}
