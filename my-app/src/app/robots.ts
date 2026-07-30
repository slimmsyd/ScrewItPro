import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

/**
 * robots.txt served at /robots.txt.
 * Allow the public marketing surface; keep private/transactional/API routes
 * out of the index. Sitemap URL derives from NEXT_PUBLIC_APP_URL.
 */
export default function robots(): MetadataRoute.Robots {
  const base = publicEnv.appUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dev/",
        "/checkout/",
        "/auth/",
        "/orders/",
        "/jobs",
        "/account",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
