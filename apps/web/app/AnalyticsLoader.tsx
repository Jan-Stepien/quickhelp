"use client";

import Script from "next/script";
import { useConsent } from "@quickhelp/ui";

export function AnalyticsLoader({ cfToken }: { cfToken: string }) {
  const { consent } = useConsent();
  if (!cfToken || consent?.analytics !== true) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: cfToken })}
    />
  );
}
