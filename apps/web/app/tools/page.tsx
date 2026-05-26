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

  const categoryDescriptions: Partial<Record<Category, string>> = {
    encoding: "Tools for encoding, decoding, and inspecting token formats used in authentication and data exchange.",
    formatting: "Tools that parse, validate, and reformat structured data — making it readable or compact without changing its meaning.",
    images: "Client-side image processing tools for converting, resizing, and editing images — no upload to a server required.",
    coverage: "Tools for inspecting and visualising code coverage reports.",
  };

  return (
    <>
      {collectionJsonLd.map((item, i) => <JsonLd key={i} data={item} />)}
      <JsonLd data={breadcrumb} />
      <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">All developer tools</h1>
        <p className="text-muted-foreground max-w-2xl">
          {registry.length} free, deterministic tools — each available as a web UI, a REST API endpoint,
          an OpenAPI 3.1 schema, and an MCP server entry. No account required. Every tool accepts
          JSON input and returns JSON output with a consistent, documented schema.
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Use any tool directly in your browser, integrate it into a script or CI pipeline via the API,
          or add the MCP server to Claude or Cursor to let your AI agent call these tools automatically.
          The <a href="/openapi.json" className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/openapi.json</a> endpoint
          documents every tool&apos;s input and output schemas in a machine-readable format.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat}>
          <div className="mb-3">
            <h2 className="text-base font-semibold capitalize text-foreground">
              {cat}
            </h2>
            {categoryDescriptions[cat] && (
              <p className="mt-0.5 text-sm text-muted-foreground">{categoryDescriptions[cat]}</p>
            )}
          </div>
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

      <section className="rounded-lg border border-border bg-muted/40 p-5 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Use any tool as an API</h2>
        <p className="text-sm text-muted-foreground">
          Every tool on this page has a corresponding REST endpoint at{" "}
          <span className="font-mono text-xs">POST /api/{"<slug>"}</span>.
          Send a JSON body matching the tool&apos;s input schema and receive a structured JSON response.
          No API key is required. Input and output schemas are documented in the{" "}
          <a href="/openapi.json" className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/openapi.json</a>{" "}
          spec and the per-tool <a href="/docs" className="underline underline-offset-2 hover:text-foreground">API docs</a>.
        </p>
        <pre className="rounded bg-muted p-3 text-xs text-muted-foreground overflow-x-auto">
          {`curl -X POST https://quickhelp.dev/api/json-formatter \\
  -H 'Content-Type: application/json' \\
  -d '{"json":"{\"key\":1}","mode":"pretty"}'`}
        </pre>
      </section>
      </div>
    </>
  );
}
