import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX methodology | Sookra Methodology Five Pillars landing (Product credibility + Technical depth + Storytelling + Operator empathy + Business case)";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "edge";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/methodology - the five pillars",
    headline: "Sookra Methodology.",
    subhead:
      "Five pillars carry every project: Product credibility, Technical depth, Storytelling, Operator empathy, Business case. APEX is the discrete-event instantiation.",
    badge: "Methodology",
  });
}
