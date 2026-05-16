import { NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { buildSitemap } from "@no-work/agent-sdk";
import { getAllDirections } from "@/lib/conversion-directions";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://no.work";

  const conversionRoutes = getAllDirections().map((d) => ({
    path: `/convert/${d.slug}`,
    priority: "0.7",
  }));

  const xml = buildSitemap(registry, baseUrl, conversionRoutes);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
