import type { Tool } from "@quickhelp/tool-kit";

export interface ExtraSitemapRoute {
  path: string;
  priority?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: string;
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function buildUrl(entry: SitemapEntry): string {
  return [
    "  <url>",
    `    <loc>${entry.loc}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export function buildSitemap(
  tools: Tool[],
  baseUrl = "https://quickhelp.dev",
  extraRoutes: ExtraSitemapRoute[] = []
): string {
  const now = new Date().toISOString().split("T")[0]!;

  const staticUrls: SitemapEntry[] = [
    { loc: baseUrl, lastmod: now, changefreq: "daily", priority: "1.0" },
    { loc: `${baseUrl}/tools`, lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/llms.txt`, lastmod: now, changefreq: "daily", priority: "0.5" },
    { loc: `${baseUrl}/llms-full.txt`, lastmod: now, changefreq: "daily", priority: "0.5" },
    { loc: `${baseUrl}/openapi.json`, lastmod: now, changefreq: "daily", priority: "0.5" },
  ];

  const toolUrls: SitemapEntry[] = tools.map((tool) => ({
    loc: `${baseUrl}/${tool.slug}`,
    lastmod: now,
    changefreq: "weekly",
    priority: "0.8",
  }));

  // Generate compare pages: every unordered pair from relatedTools cross-references
  const comparePairs = new Set<string>();
  for (const tool of tools) {
    for (const related of tool.content?.relatedTools ?? []) {
      const key = [tool.slug, related].sort().join("-vs-");
      comparePairs.add(key);
    }
  }
  const compareUrls: SitemapEntry[] = Array.from(comparePairs).map((pair) => ({
    loc: `${baseUrl}/compare/${pair}`,
    lastmod: now,
    changefreq: "monthly",
    priority: "0.6",
  }));

  const legalUrls: SitemapEntry[] = [
    { loc: `${baseUrl}/privacy`, lastmod: now, changefreq: "yearly", priority: "0.2" },
    { loc: `${baseUrl}/terms`, lastmod: now, changefreq: "yearly", priority: "0.2" },
    { loc: `${baseUrl}/cookies`, lastmod: now, changefreq: "yearly", priority: "0.2" },
  ];

  const extraUrls: SitemapEntry[] = extraRoutes.map((r) => ({
    loc: `${baseUrl}${r.path}`,
    lastmod: r.lastmod ?? now,
    changefreq: r.changefreq ?? "weekly",
    priority: r.priority ?? "0.7",
  }));

  const allUrls = [...staticUrls, ...toolUrls, ...compareUrls, ...extraUrls, ...legalUrls];

  const urlElements = allUrls.map(buildUrl).join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    urlElements,
    `</urlset>`,
  ].join("\n");
}
