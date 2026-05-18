import Link from "next/link";
import { registry } from "@/lib/registry";
import type { Category } from "@quickhelp/tool-kit";
import { buildCollectionPageJsonLd, buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  path: "/tools",
  title: "All Developer Tools",
  description: `Browse all ${registry.length} deterministic utility tools on quickhelp.dev — each with a human UI, REST API, OpenAPI schema, and MCP entry. Free, no sign-up.`,
  keywords: ["developer tools", "utility tools", "online tools", "free tools", "API tools", "MCP tools"],
});

export default function ToolsPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const collectionJsonLd = buildCollectionPageJsonLd(registry, baseUrl);
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "All Tools", url: `${baseUrl}/tools` },
  ]);

  const byCategory = registry.reduce<Record<string, typeof registry>>((acc, tool) => {
    const cat = tool.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(tool);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort() as Category[];

  return (
    <>
      {collectionJsonLd.map((item, i) => <JsonLd key={i} data={item} />)}
      <JsonLd data={breadcrumb} />
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">All tools</h1>
        <p className="mt-1">{registry.length} tools available</p>
      </div>

      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {cat}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byCategory[cat]!.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`} className="tool-card">
                <div className="tool-card-title">{tool.name}</div>
                <div className="tool-card-summary">{tool.summary}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      </div>
    </>
  );
}
