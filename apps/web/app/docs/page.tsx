import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { registry } from "@/lib/registry";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/docs",
  title: "API Documentation",
  description: "REST API reference for all quickhelp.dev tools — endpoints, request/response schemas, curl examples, and OpenAPI 3.1 spec.",
  keywords: ["quickhelp API docs", "REST API reference", "developer documentation", "OpenAPI", "JWT decoder API", "JSON formatter API"],
});

export default function DocsPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Docs", url: `${baseUrl}/docs` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <div className="mx-auto max-w-3xl space-y-8 py-4">
        <header>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            Every quickhelp.dev tool is available as a REST API. No auth required for the anonymous
            free tier (30 req/min per IP). The full OpenAPI 3.1 spec is at{" "}
            <Link href="/openapi.json" className="underline underline-offset-2 font-mono">
              /openapi.json
            </Link>
            .
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Quick start</h2>
          <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`curl -X POST https://quickhelp.dev/api/jwt-decoder \\
  -H 'Content-Type: application/json' \\
  -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'`}
          </pre>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Tool endpoints</h2>
          <ul className="space-y-3">
            {registry.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/docs/api/${tool.slug}`}
                  className="group flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">POST</span>
                      <code className="font-mono text-sm">/api/{tool.slug}</code>
                    </div>
                    <p className="text-sm font-medium group-hover:underline underline-offset-2">{tool.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tool.summary}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 rounded bg-muted px-2 py-0.5">
                    {tool.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Agent discovery surfaces</h2>
          <p className="text-sm text-muted-foreground">
            quickhelp.dev is designed for AI agent consumption. Beyond the REST API, these surfaces
            provide machine-readable tool discovery:
          </p>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/openapi.json", label: "/openapi.json", desc: "OpenAPI 3.1 — all endpoints with schemas" },
              { href: "/llms.txt", label: "/llms.txt", desc: "llms.txt discovery document" },
              { href: "/llms-full.txt", label: "/llms-full.txt", desc: "Full content dump for one-shot AI context loading" },
              { href: "/mcp", label: "/mcp", desc: "Model Context Protocol endpoint (HTTP transport)" },
            ].map((item) => (
              <li key={item.href} className="flex items-center gap-3">
                <Link href={item.href} className="font-mono underline underline-offset-2 text-foreground shrink-0">
                  {item.label}
                </Link>
                <span className="text-muted-foreground">— {item.desc}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
