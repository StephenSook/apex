import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX changelog | Auto-rendered commit timeline from git log with conventional-commit color pills";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "edge";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/changelog - the commit timeline",
    headline: "Every change, since Day 1.",
    subhead:
      "Auto-rendered from git log on the production branch. Conventional-commit color pills cover feat, fix, docs, test, refactor, chore, perf. Default view filters to feat-only.",
    badge: "Changelog",
  });
}
