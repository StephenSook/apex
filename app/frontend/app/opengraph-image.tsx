import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../lib/og-card";

export const alt =
  "APEX | AI race engineer for adaptive racers - built on IBM Granite";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "nodejs";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "IBM SkillsBuild May Challenge 2026",
    headline: "The race engineer for the drivers who don't have one.",
    subhead:
      "An agentic AI race engineer for adaptive, veteran, and grassroots racers, built on the IBM Granite stack.",
    badge: "Home",
  });
}
