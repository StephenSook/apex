import {
  OG_CARD_CONTENT_TYPE,
  OG_CARD_SIZE,
  renderOgCard,
} from "../../lib/og-card";

export const alt =
  "APEX coach-code | Granite 4.1 8B Instruct code-feedback for engineers building telemetry tools (HARD-COMPLIANCE scrubber on server)";
export const size = OG_CARD_SIZE;
export const contentType = OG_CARD_CONTENT_TYPE;
export const runtime = "edge";

export default function OpenGraphImage() {
  return renderOgCard({
    eyebrow: "/coach-code - Granite 4.1 8B feedback",
    headline: "Coach your telemetry code.",
    subhead:
      "Paste a snippet + ask a question. Granite 4.1 8B Instruct returns concise text feedback wired into the APEX three-layer architecture. HARD-COMPLIANCE scrubber server-side. Granite Code 8B deprecated; 4.1 8B supersedes (HumanEval 87.2% pass@1).",
    badge: "Coach code",
  });
}
