import React from "react";

interface CloudflareAnalyticsProps {
  token: string;
}

export function CloudflareAnalytics({ token }: CloudflareAnalyticsProps) {
  if (!token) return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
