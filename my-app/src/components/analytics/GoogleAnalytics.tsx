import Script from "next/script";
import { publicEnv } from "@/lib/env";
import { isGoogleAnalyticsConfigured } from "@/lib/google";

/**
 * GA4 (gtag.js) loader — gated plug-and-play.
 *
 * Renders nothing until NEXT_PUBLIC_GOOGLE_ANALYTICS_ID is set, so no tracking
 * fires (and no console errors) while the client is still creating their GA4
 * property. Cutover = paste the G-XXXX Measurement ID into the env var and
 * redeploy. No code change. A GA4 property does NOT require the live domain.
 */
export default function GoogleAnalytics() {
  if (!isGoogleAnalyticsConfigured()) return null;

  const id = publicEnv.googleAnalyticsId;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
