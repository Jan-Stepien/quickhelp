"use client";

import Script from "next/script";

// Cloudflare Web Analytics is cookieless and stores no PII — no consent needed.
export function AnalyticsLoader({ cfToken }: { cfToken: string }) {
  if (!cfToken) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: cfToken })}
    />
  );
}
