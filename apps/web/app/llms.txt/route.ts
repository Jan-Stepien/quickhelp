import { NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { buildLlmsTxt } from "@no-work/agent-sdk";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://no.work";
  const txt = buildLlmsTxt(registry, baseUrl);
  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
