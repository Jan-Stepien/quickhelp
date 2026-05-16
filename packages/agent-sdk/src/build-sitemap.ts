import type { Tool } from "@no-work/tool-kit";

export function buildSitemap(tools: Tool[], baseUrl = "https://no.work"): string {
  const now = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: baseUrl, priority: "1.0" },
    { loc: `${baseUrl}/tools`, priority: "0.9" },
    { loc: `${baseUrl}/openapi.json`, priority: "0.5" },
    { loc: `${baseUrl}/llms.txt`, priority: "0.5" },
  ];

  const toolUrls = tools.map((tool) => ({
    loc: `${baseUrl}/${tool.slug}`,
    priority: "0.8",
  }));

  const allUrls = [...staticUrls, ...toolUrls];

  const urlElements = allUrls
    .map(
      ({ loc, priority }) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlElements}\n</urlset>`;
}
