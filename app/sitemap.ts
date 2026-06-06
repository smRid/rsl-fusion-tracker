import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rsl-ai-fusion-tracker.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/tracker`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    }
  ];
}
