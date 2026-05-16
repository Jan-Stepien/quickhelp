import { NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { buildLlmsTxt } from "@no-work/agent-sdk";
import { getAllDirections } from "@/lib/conversion-directions";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

  const conversionRoutes = getAllDirections().map((d) => ({
    path: `/convert/${d.slug}`,
    title: `${d.from.toUpperCase()} to ${d.to.toUpperCase()} Converter`,
    summary: `Convert ${d.from} images to ${d.to} format online`,
  }));

  const txt = buildLlmsTxt(registry, baseUrl, conversionRoutes);
  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
