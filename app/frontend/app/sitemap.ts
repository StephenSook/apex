import type { MetadataRoute } from "next";

/**
 * Wave-44 Phase 9 perf batch sitemap generator. Static 5-route
 * sitemap for the apex-one-black.vercel.app production deploy +
 * the BeMyApp / Devpost judge-portal crawlers. Routes mirror the
 * Next.js app router file layout (5 pages); priority + change-
 * frequency reflect editorial weight (judges hit / + /judges most
 * during evaluation).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://apex-one-black.vercel.app";
  const lastModified = new Date("2026-05-24");
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/judges`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/analyze`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/sim-rig`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/status`, lastModified, changeFrequency: "daily", priority: 0.6 },
  ];
}
