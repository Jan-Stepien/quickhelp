import { NextResponse } from "next/server";
import { registry } from "@/lib/registry";
import { buildSitemap } from "@quickhelp/agent-sdk";
import { getAllDirections } from "@/lib/conversion-directions";

export const dynamic = "force-static";

const BLOG_POSTS = [
  { slug: "png-to-webp-conversion-guide", date: "2026-07-05" },
  { slug: "base64-encoding-guide", date: "2026-07-04" },
  { slug: "uuid-v4-vs-v7", date: "2026-07-03" },
  { slug: "hex-rgb-hsl-color-formats-guide", date: "2026-07-02" },
  { slug: "how-to-view-lcov-coverage-reports", date: "2026-05-20" },
  { slug: "understanding-lcov-coverage-metrics", date: "2026-05-19" },
  { slug: "how-to-decode-jwt-safely", date: "2026-05-18" },
  { slug: "image-sizes-for-social-media-2026", date: "2026-05-17" },
  { slug: "how-to-crop-images-for-web", date: "2026-05-16" },
  { slug: "png-vs-webp-vs-avif-benchmark", date: "2026-05-15" },
  { slug: "resize-product-photos-for-etsy-amazon-shopify", date: "2026-05-14" },
  { slug: "background-removal-in-browser", date: "2026-05-12" },
  { slug: "json-formatter-benchmarks", date: "2026-05-10" },
];

const GLOSSARY_TERMS = [
  "base64", "binary", "csv", "hash-function", "hexadecimal", "hmac",
  "json", "json-schema", "jwt", "llms-txt", "mcp", "oauth2",
  "openapi", "regex", "rest-api", "sha-256", "unix-timestamp",
  "url-encoding", "uuid", "zod",
];

export function GET() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

  const conversionRoutes = getAllDirections().map((d) => ({
    path: `/convert/${d.slug}`,
    priority: "0.7" as const,
  }));

  const useCaseRoutes: { path: string; priority: "0.6"; changefreq: "monthly" }[] = [];
  for (const tool of registry) {
    for (const uc of tool.content?.useCases ?? []) {
      useCaseRoutes.push({ path: `/use-cases/${uc.slug}`, priority: "0.6", changefreq: "monthly" });
    }
  }

  const contentRoutes = [
    { path: "/use-cases", priority: "0.7", changefreq: "weekly" as const },
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

  const xml = buildSitemap(registry, baseUrl, [...conversionRoutes, ...useCaseRoutes, ...contentRoutes]);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
