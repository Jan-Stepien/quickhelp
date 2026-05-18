import { NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { buildLlmsFullTxt } from "@quickhelp/agent-sdk";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const txt = buildLlmsFullTxt(registry, baseUrl);
  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
