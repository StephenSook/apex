import type { MetadataRoute } from "next";

/**
 * Sitemap generator for the apex-one-black.vercel.app production deploy +
 * the BeMyApp / Devpost judge-portal crawlers. Covers all 12 public page
 * routes (wave-57 audit found the prior 5-route sitemap omitted 7 live
 * pages); priority + change-frequency reflect editorial weight (judges hit
 * / + /judges most during evaluation).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://apex-one-black.vercel.app";
  const lastModified = new Date("2026-05-29");
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/judges`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/analyze`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/methodology`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/compare`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/sim-rig`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/lips-harness`, lastModified, changeFrequency: "weekly", priority: 0.65 },
    { url: `${base}/coach-code`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/upload`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/judge-tour`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/status`, lastModified, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/changelog`, lastModified, changeFrequency: "daily", priority: 0.55 },
  ];
}
