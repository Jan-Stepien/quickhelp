import Link from "next/link";
import { registry } from "@/lib/registry";
import { JsonLd } from "@quickhelp/seo";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@quickhelp/tool-kit";

export default function HomePage() {
  const featured = registry;
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const sameAs = [
    process.env["NEXT_PUBLIC_GITHUB_URL"],
    process.env["NEXT_PUBLIC_TWITTER_URL"],
    process.env["NEXT_PUBLIC_LINKEDIN_URL"],
  ].filter((v): v is string => Boolean(v));

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd(baseUrl, sameAs)} />
      <JsonLd data={buildWebSiteJsonLd(baseUrl)} />
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">What is quickhelp.dev?</h2>
        <p className="text-muted-foreground">
          quickhelp.dev is a collection of small, focused developer tools that do exactly one thing well.
          Each tool is free to use — no account, no rate limit for normal use. You can use any tool
          through its web interface, call it directly as a REST API, discover it through an OpenAPI
          3.1 schema, or register it as an MCP tool inside Claude, Cursor, or any MCP-compatible agent.
        </p>
        <p className="text-muted-foreground">
          The tools are deterministic: given the same input, they always produce the same output.
          There are no black-box AI models deciding the result — just well-defined transformations
          like decoding a JWT, formatting JSON, converting an image, or removing a background.
          That predictability makes them reliable for automated workflows, CI pipelines, and AI agents
          that need a tool they can trust.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Three ways to use every tool</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="text-sm font-semibold text-foreground">Human UI</div>
            <p className="text-sm text-muted-foreground">
              Visit the tool page, fill in the form, click Run. Results appear instantly and can be
              copied with one click. No sign-up, no tutorial.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="text-sm font-semibold text-foreground">REST API</div>
            <p className="text-sm text-muted-foreground">
              Every tool has a <span className="font-mono text-xs">POST /api/{"<slug>"}</span> endpoint
              that accepts JSON and returns JSON. No API key required for standard use. Integrate it
              into any script, workflow, or application.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="text-sm font-semibold text-foreground">MCP server</div>
            <p className="text-sm text-muted-foreground">
              Add quickhelp.dev to Claude Desktop or any MCP-compatible agent. All tools are
              registered automatically — the agent can discover and call them without extra
              configuration.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Why deterministic tools?</h2>
        <p className="text-muted-foreground">
          AI agents work best with tools that are predictable. A tool that decodes a JWT should
          always return the same header and payload — not a summary, not a paraphrase, not a
          hallucination. quickhelp.dev tools are built with that contract in mind: strict JSON
          schemas for inputs and outputs, no side effects, no state between calls.
        </p>
        <p className="text-muted-foreground">
          Every tool exposes its input and output shapes via OpenAPI 3.1, which means agents
          using the OpenAPI spec can validate inputs before calling and parse outputs without
          guesswork. The <a href="/llms.txt" className="underline underline-offset-2 hover:text-foreground">llms.txt</a> file
          at the root of the domain gives language models a structured overview of what each
          tool does, how to call it, and what to expect back.
        </p>
      </section>
      </div>
    </>
  );
}
