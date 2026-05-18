import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name?: string;
      value?: number;
      rating?: string;
      id?: string;
      path?: string;
      ts?: number;
    };
    console.info("[cwv]", JSON.stringify({ ...body, ua: request.headers.get("user-agent")?.slice(0, 80) }));
  } catch {
    // ignore parse errors
  }
  return new NextResponse(null, { status: 204 });
}
