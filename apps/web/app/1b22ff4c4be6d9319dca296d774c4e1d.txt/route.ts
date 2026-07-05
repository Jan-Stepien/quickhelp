import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return new NextResponse("1b22ff4c4be6d9319dca296d774c4e1d", {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
