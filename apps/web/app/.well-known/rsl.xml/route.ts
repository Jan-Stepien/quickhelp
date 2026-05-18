import { NextResponse } from "next/server";

export const dynamic = "force-static";

// RSL 1.0 (Really Simple Licensing) — machine-readable AI licensing terms.
// Standard backed by Reddit, Yahoo, Medium, Quora, Cloudflare, Akamai, Creative Commons (Dec 2025).
export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rsl version="1.0" xmlns="https://rsl.ai/schema/1.0">
  <site>
    <url>${baseUrl}</url>
    <name>quickhelp.dev</name>
  </site>
  <permissions>
    <!-- Tool UI pages and documentation: open for AI training and citation -->
    <allow>
      <paths>
        <path>/</path>
        <path>/tools</path>
        <path>/llms.txt</path>
        <path>/llms-full.txt</path>
        <path>/openapi.json</path>
      </paths>
      <uses>
        <use>ai-training</use>
        <use>ai-citation</use>
        <use>ai-search</use>
      </uses>
      <license>https://creativecommons.org/licenses/by/4.0/</license>
    </allow>
    <!-- API responses include attribution watermark on free tier -->
    <allow>
      <paths>
        <path>/api/*</path>
      </paths>
      <uses>
        <use>ai-search</use>
        <use>ai-citation</use>
      </uses>
      <condition>attribution-required</condition>
    </allow>
  </permissions>
</rsl>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
