import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

/**
 * XML sitemap served at /sitemap.xml.
 * Only public, indexable pages — admin/dev/checkout/api/auth are intentionally
 * excluded (they're also disallowed in robots.ts). URLs derive from
 * NEXT_PUBLIC_APP_URL, so they self-correct at the domain cutover.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.appUrl.replace(/\/$/, "");
  const now = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/join`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
