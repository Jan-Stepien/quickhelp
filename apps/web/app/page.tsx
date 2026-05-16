import Link from "next/link";
import { registry } from "@/lib/registry";

export default function HomePage() {
  const featured = registry.slice(0, 4);
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Utility tools for humans and agents
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Small, deterministic tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry.
          Free to use. Agent-native from day one.
        </p>
        <div className="flex gap-3">
          <Link
            href="/tools"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-80 transition-opacity"
          >
            Browse all tools
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Featured tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((tool) => (
            <Link key={tool.slug} href={`/${tool.slug}`} className="tool-card p-5">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {tool.category}
              </div>
              <div className="tool-card-title font-semibold">{tool.name}</div>
              <div className="tool-card-summary">{tool.summary}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-muted/40 p-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">For AI agents</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            <span className="font-mono text-muted-foreground/70">GET /openapi.json</span> — OpenAPI 3.1 for all tools
          </li>
          <li>
            <span className="font-mono text-muted-foreground/70">GET /llms.txt</span> — llms.txt discovery surface
          </li>
          <li>
            <span className="font-mono text-muted-foreground/70">POST /api/{"<slug>"}</span> — REST API, JSON in/out
          </li>
          <li>
            <span className="font-mono text-muted-foreground/70">MCP</span> — same registry, stdio or HTTP
          </li>
        </ul>
        <div className="mt-4 flex gap-2">
          <a
            href="/openapi.json"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            OpenAPI spec
          </a>
          <a
            href="/llms.txt"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            llms.txt
          </a>
        </div>
      </section>
    </div>
  );
}
