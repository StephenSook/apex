import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX Status | Live build, CI, and demo health signals - confidence signal for the IBM SkillsBuild May 2026 evaluation window";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "nodejs";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/status - the confidence signal",
    headline: "Health, at a glance.",
    subhead:
      "Live CI signal polled from GitHub Actions on main. Repo, license, build window, deploy URL, and pending indicators that turn live as Day 9 + Day 10 + Day 11 ship.",
    badge: "Status",
  });
}
