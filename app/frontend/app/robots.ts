import type { MetadataRoute } from "next";

/**
 * Wave-44 Phase 9 perf batch robots.txt generator. Allow-all
 * crawler policy with explicit sitemap pointer; no judge-portal
 * crawler should hit a 404 on /robots.txt. /api/* routes are
 * disallowed since they are server-side only + emit JSON/NDJSON
 * not HTML.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://apex-one-black.vercel.app/sitemap.xml",
  };
}
