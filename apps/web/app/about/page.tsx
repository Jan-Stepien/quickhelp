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
            quickhelp.dev is a single-domain factory of small, deterministic developer tools.
            Every tool is free, stateless, and finishes in under 5 seconds. Each one exposes four
            interfaces: a human UI at <code>/{"{"}slug{"}"}</code>, a REST API at{" "}
            <code>/api/{"{"}slug{"}"}</code>, an OpenAPI 3.1 schema at{" "}
            <code>/openapi.json</code>, and an MCP server entry at <code>/mcp</code>.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The site currently hosts {registry.length} tools across encoding, formatting,
            conversion, and image processing. New tools are added regularly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Principles</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">No auth, no database.</strong> Every tool is
              stateless. Nothing is stored server-side.
            </li>
            <li>
              <strong className="text-foreground">No LLM-backed tools in v1.</strong> Cost-per-call
              without billing infrastructure means negative margin. All tools are deterministic.
            </li>
            <li>
              <strong className="text-foreground">Privacy-first.</strong> Browser-side tools
              (image converter, background remover) never upload your data. The model runs in your
              browser using WebAssembly.
            </li>
            <li>
              <strong className="text-foreground">Agent-native from day one.</strong> Every tool
              is discoverable by AI agents via <code>/openapi.json</code>, <code>/llms.txt</code>,
              and the MCP endpoint.
            </li>
            <li>
              <strong className="text-foreground">Free tier, watermarked.</strong> The API is free
              to use. Responses include an attribution watermark. Paid keys (coming soon) strip it.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">For AI agents</h2>
          <p className="text-muted-foreground">
            quickhelp.dev exposes the following machine-readable discovery surfaces:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground font-mono">
            <li>
              <a href="/openapi.json" className="underline underline-offset-2">
                /openapi.json
              </a>{" "}
              — OpenAPI 3.1 schema for all tools
            </li>
            <li>
              <a href="/llms.txt" className="underline underline-offset-2">
                /llms.txt
              </a>{" "}
              — lightweight discovery document
            </li>
            <li>
              <a href="/llms-full.txt" className="underline underline-offset-2">
                /llms-full.txt
              </a>{" "}
              — full content dump for one-shot context loading
            </li>
            <li>
              <a href="/mcp" className="underline underline-offset-2">
                /mcp
              </a>{" "}
              — MCP endpoint (HTTP transport)
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Built by Jan Stepien. Questions, suggestions, or bug reports:{" "}
            <a
              href="mailto:jasiek.stepien@gmail.com"
              className="underline underline-offset-2"
            >
              jasiek.stepien@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}
