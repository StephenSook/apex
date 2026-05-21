import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX Judges' tour | One-page evaluator landing - demo, video, deck, repo, Q&A, IBM stack, team";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/judges - the evaluator path",
    headline: "APEX, in one page.",
    subhead:
      "Live demo, sim-rig tile, 3-minute video, deck, repo, methodology trace, IBM stack, Q&A defense pack, and team. Five minutes of judging, one click.",
    badge: "Judges",
  });
}
