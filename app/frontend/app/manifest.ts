import type { MetadataRoute } from "next";

/**
 * Wave-44 Phase 6e PWA manifest. Editorial-paddock palette landing
 * (cream paper background, deep racing-green theme) + standalone
 * display so home-screen install on iOS + Android renders APEX as a
 * full-screen app rather than a Safari/Chrome chrome wrapper.
 *
 * shouldn't-be-possible move #6 (per D-019 wave-44 extension):
 * "install as app on phone for paddock-side use" surfaces the
 * project as a deployable artifact rather than a web demo.
 *
 * Service worker intentionally deferred per wave-44 Phase 6e rollback
 * path documented in `~/.claude/plans/all-right-i-want-rippling-moon.md`:
 * cache-bust risk to /judges hard-refresh during the demo exceeds the
 * offline-fallback value at the submission window. Re-evaluate post-
 * submission for the paddock-side real-use case.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "APEX | AI race engineer for adaptive racers",
    short_name: "APEX",
    description:
      "An agentic AI race engineer for adaptive, veteran, and grassroots racers, built on IBM Granite. IBM SkillsBuild May Challenge 2026.",
    start_url: "/judges",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F4EBD8",
    theme_color: "#0A2818",
    categories: ["sports", "education", "productivity"],
    lang: "en",
    dir: "ltr",
    scope: "/",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon2",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
