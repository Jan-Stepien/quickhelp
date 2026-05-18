import { NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { buildSitemap } from "@quickhelp/agent-sdk";
import { getAllDirections } from "@/lib/conversion-directions";

export const dynamic = "force-static";

const BLOG_POSTS = [
  { slug: "how-to-decode-jwt-safely", date: "2026-05-18" },
  { slug: "png-vs-webp-vs-avif-benchmark", date: "2026-05-15" },
  { slug: "background-removal-in-browser", date: "2026-05-12" },
  { slug: "json-formatter-benchmarks", date: "2026-05-10" },
];

const GLOSSARY_TERMS = ["jwt", "mcp", "openapi", "llms-txt"];

export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

  const conversionRoutes = getAllDirections().map((d) => ({
    path: `/convert/${d.slug}`,
    priority: "0.7" as const,
  }));

  const contentRoutes = [
    { path: "/blog", priority: "0.8", changefreq: "weekly" as const },
    { path: "/changelog", priority: "0.6", changefreq: "weekly" as const },
    { path: "/glossary", priority: "0.7", changefreq: "monthly" as const },
    { path: "/about", priority: "0.5", changefreq: "monthly" as const },
    { path: "/contact", priority: "0.5", changefreq: "yearly" as const },
    { path: "/docs", priority: "0.8", changefreq: "weekly" as const },
    ...BLOG_POSTS.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: "0.7",
      changefreq: "monthly" as const,
      lastmod: p.date,
    })),
    ...GLOSSARY_TERMS.map((t) => ({
      path: `/glossary/${t}`,
      priority: "0.6",
      changefreq: "monthly" as const,
    })),
    ...registry.map((tool) => ({
      path: `/docs/api/${tool.slug}`,
      priority: "0.7",
      changefreq: "monthly" as const,
    })),
  ];

  const xml = buildSitemap(registry, baseUrl, [...conversionRoutes, ...contentRoutes]);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
