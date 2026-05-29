import { buildMetadata } from "@/lib/metadata";
import { buildOrganizationJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { registry } from "@/lib/registry";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/about",
  title: "About quickhelp.dev",
  description:
    "quickhelp.dev is a free collection of deterministic developer tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry. No auth, no database, no LLM cost per call.",
  keywords: ["about quickhelp.dev", "developer tools", "free tools", "deterministic tools", "agent-native"],
});

export default function AboutPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jan Stepien",
    email: "jasiek.stepien@gmail.com",
    url: baseUrl,
    worksFor: { "@id": `${baseUrl}/#organization` },
  };

  const sameAs = [
    process.env["NEXT_PUBLIC_GITHUB_URL"],
    process.env["NEXT_PUBLIC_TWITTER_URL"],
    process.env["NEXT_PUBLIC_LINKEDIN_URL"],
  ].filter((v): v is string => Boolean(v));

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd(baseUrl, sameAs)} />
      <JsonLd data={personJsonLd} />

      <div className="prose mx-auto max-w-3xl space-y-8 py-4">
        <header>
          <h1 className="text-3xl font-bold">About quickhelp.dev</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            A free, open collection of deterministic utility tools for developers and AI agents.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What is quickhelp.dev?</h2>
          <p className="text-muted-foreground leading-relaxed">
            quickhelp.dev is a single-domain collection of small, deterministic developer tools.
            Every tool is free, stateless, and completes in under 5 seconds. Each one exposes four
            interfaces: a human UI at <code>/{"{"}slug{"}"}</code>, a REST API at{" "}
            <code>/api/{"{"}slug{"}"}</code>, an OpenAPI 3.1 schema at{" "}
            <code>/openapi.json</code>, and an MCP server entry at <code>/mcp</code>.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The site currently hosts {registry.length} tools across encoding, formatting, conversion,
            cryptography, text processing, and more. Each tool comes with a detailed guide explaining
            what it does, how to use it, and when to use it — not just a form to fill in. New tools
            are added regularly, chosen based on search demand and implementation feasibility.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Why we built this</h2>
          <p className="text-muted-foreground leading-relaxed">
            The immediate trigger was spending too much time Google-searching for basic conversions during
            development — decoding a JWT to check its expiry, formatting a JSON blob to read a nested field,
            converting a Unix timestamp to a readable date. The existing tools are scattered across dozens of
            sites, many of which are cluttered with ads, require accounts, or silently send your data to a
            server. A JWT containing real credentials should not need to leave your browser to be decoded.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The longer-term motivation is the shift toward AI-agent workflows. When an agent calls an external
            tool, it needs to be able to trust that tool — that the same input always produces the same output,
            that the interface is documented in a machine-readable format, and that the tool does not have
            hidden side effects. quickhelp.dev is designed for that trust model from the start: strict input
            and output schemas, no server-side state, and a single OpenAPI document that lets any agent or
            automation framework discover and call every tool without manual configuration.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Design principles</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">One tool, one job.</strong> Every tool does exactly
              one thing. A JWT decoder decodes JWTs. A JSON formatter formats JSON. A hash generator
              generates hashes. Narrow scope means a predictable, trustworthy interface.
            </li>
            <li>
              <strong className="text-foreground">No auth, no database.</strong> Every tool is
              stateless. Nothing is stored server-side beyond what is necessary to return the response.
              There are no user accounts because there is nothing to persist.
            </li>
            <li>
              <strong className="text-foreground">Deterministic output.</strong> Given the same input,
              every tool returns the same output. No randomness, no AI-generated results, no variation
              based on time or server state (except the UUID generator, where randomness is the feature).
            </li>
            <li>
              <strong className="text-foreground">Privacy-first for sensitive data.</strong> Image
              tools (converter, resizer, background remover) run entirely in your browser using the
              Canvas API and WebAssembly. Your files never leave your device.
            </li>
            <li>
              <strong className="text-foreground">Agent-native from day one.</strong> Every tool
              is discoverable by AI agents via <code>/openapi.json</code>, <code>/llms.txt</code>,
              and the MCP endpoint. The schema definitions are designed to be unambiguous, so agents
              can call tools correctly on the first attempt without trial and error.
            </li>
            <li>
              <strong className="text-foreground">Free tier with attribution.</strong> The API is free
              to use. Anonymous API responses include a small attribution watermark. Paid keys (coming
              soon) will remove the watermark and include higher rate limits.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Technical architecture</h2>
          <p className="text-muted-foreground leading-relaxed">
            The site runs on Next.js 14 with the App Router, deployed on Vercel. Tool logic lives in
            independent packages (<code>packages/tools/&lt;slug&gt;/</code>), each exporting a
            manifest that includes the tool&apos;s name, description, category, input schema (Zod),
            output schema (Zod), handler function, and SEO content block.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The four discovery surfaces — web UI, REST API, OpenAPI spec, and MCP server — are all
            generated automatically from the same registry. Adding a new tool means writing one file
            and adding it to the registry; everything else (routing, API endpoint, schema generation,
            MCP registration, sitemap, llms.txt) is handled automatically. This architecture makes it
            practical to add multiple tools per week without accumulating maintenance debt.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">For AI agents</h2>
          <p className="text-muted-foreground">
            quickhelp.dev exposes the following machine-readable discovery surfaces:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-3 items-start">
              <a href="/openapi.json" className="underline underline-offset-2 font-mono shrink-0">
                /openapi.json
              </a>
              <span>— OpenAPI 3.1 schema for all {registry.length} tools, with full input/output schema definitions</span>
            </li>
            <li className="flex gap-3 items-start">
              <a href="/llms.txt" className="underline underline-offset-2 font-mono shrink-0">
                /llms.txt
              </a>
              <span>— llms.txt discovery document (compact format, one tool per section)</span>
            </li>
            <li className="flex gap-3 items-start">
              <a href="/llms-full.txt" className="underline underline-offset-2 font-mono shrink-0">
                /llms-full.txt
              </a>
              <span>— Full content dump including schemas and examples — designed for one-shot context loading</span>
            </li>
            <li className="flex gap-3 items-start">
              <a href="/mcp" className="underline underline-offset-2 font-mono shrink-0">
                /mcp
              </a>
              <span>— Model Context Protocol endpoint (HTTP transport) — compatible with Claude, Cursor, and any MCP client</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Built by Jan Stepien. Questions, bug reports, or feature suggestions:{" "}
            <a
              href="mailto:jasiek.stepien@gmail.com"
              className="underline underline-offset-2"
            >
              jasiek.stepien@gmail.com
            </a>
            . Alternatively, visit the{" "}
            <a href="/contact" className="underline underline-offset-2">Contact page</a> for
            more details on response times and what to include.
          </p>
        </section>
      </div>
    </>
  );
}
