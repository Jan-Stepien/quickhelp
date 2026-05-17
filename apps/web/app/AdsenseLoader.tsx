"use client";

import Script from "next/script";
import { useConsent } from "@quickhelp/ui";

const CLIENT_ID = process.env["NEXT_PUBLIC_ADSENSE_CLIENT_ID"] ?? "";
const ADS_ENABLED = process.env["NEXT_PUBLIC_ADS_ENABLED"] === "true";

export function AdsenseLoader() {
  const { consent } = useConsent();
  if (!ADS_ENABLED || !CLIENT_ID || consent?.advertising !== true) return null;
  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
