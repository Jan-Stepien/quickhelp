import { NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { buildOpenAPI } from "@no-work/agent-sdk";

export const dynamic = "force-static";

export function GET(): NextResponse {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://no.work";
  const doc = buildOpenAPI(registry, { baseUrl });
  return NextResponse.json(doc, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
