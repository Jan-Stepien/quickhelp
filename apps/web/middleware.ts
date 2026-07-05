import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;

// In-memory store — resets on cold start, which gives per-instance limits.
// Upgrade path: replace with Vercel KV for cross-instance enforcement.
const ipMap = new Map<string, { count: number; windowStart: number }>();

export function middleware(req: NextRequest) {
  // Redirect HTTP → HTTPS. Vercel normally handles this but some DNS/proxy
  // configurations (e.g. Cloudflare in front of Vercel) can bypass it.
  const proto = req.headers.get("x-forwarded-proto");
  if (proto === "http") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 301 });
  }

  // Only rate-limit API routes
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Bearer token present → trusted caller, bypass rate limit (placeholder for future paid tiers)
  if (req.headers.get("authorization")?.startsWith("Bearer ")) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
    return NextResponse.next();
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Retry after " + retryAfter + " seconds." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil((entry.windowStart + WINDOW_MS) / 1000)),
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  res.headers.set("X-RateLimit-Remaining", String(MAX_REQUESTS - entry.count));
  return res;
}

export const config = {
  // Run on all routes so the HTTP→HTTPS redirect fires everywhere.
  // Excludes Next.js internals and static files that never need redirecting.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
