import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://no.work";
  const content = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join("\n");

  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
