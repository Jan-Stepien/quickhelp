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
    encoding: "Tools for encoding, decoding, and inspecting token formats used in authentication and data exchange. Covers Base64 (the standard encoding for binary data in JSON and HTTP), JWT (JSON Web Tokens used in OAuth2 and OpenID Connect), and URL percent-encoding for query strings and path parameters.",
    formatting: "Tools that parse, validate, and reformat structured data — making it readable or compact without changing its meaning. Pretty-printing JSON and converting between JSON and CSV are the most common formatting tasks in API development and data pipelines.",
    conversion: "Client-side tools for converting images and files between formats — no upload to a server required. All image processing runs in your browser using the Canvas API and WebAssembly, so your files never leave your device.",
    validation: "Tools for inspecting, linting, and visualising code and data quality reports. Includes the LCOV Coverage Viewer for reading test coverage output from Jest, Vitest, pytest-cov, and Go's testing package.",
    cryptography: "Tools for generating and verifying hashes and digests. Supports the MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms — all computed locally using the Web Crypto API with no server-side processing.",
    generation: "Tools for generating unique identifiers and random values. The UUID generator produces RFC 4122-compliant v4 UUIDs using cryptographically secure randomness, suitable for database primary keys, request IDs, and API tokens.",
    text: "Tools for transforming text casing and formatting conventions. Covers all common programming naming styles: camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, and more — useful when adapting code across languages or style guides.",
    datetime: "Tools for converting and inspecting timestamps. The timestamp converter handles Unix epoch (seconds and milliseconds), ISO 8601, and human-readable formats, with automatic detection of whether a numeric value is in seconds or milliseconds.",
    network: "Tools for inspecting and transforming network-related data formats — URLs, IP addresses, headers, and HTTP utilities.",
    other: "Miscellaneous utility tools that don't fit neatly into a single category but are commonly needed in day-to-day development work.",
  };

  return (
    <>
      {collectionJsonLd.map((item, i) => <JsonLd key={i} data={item} />)}
      <JsonLd data={breadcrumb} />
      <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">All developer tools</h1>
        <p className="text-muted-foreground max-w-2xl">
          {registry.length} free, deterministic tools — each available as a web UI, a REST API endpoint,
          an OpenAPI 3.1 schema, and an MCP server entry. No account required. Every tool accepts
          JSON input and returns JSON output with a consistent, documented schema.
        </p>
        <p className="text-muted-foreground max-w-2xl">
          Use any tool directly in your browser, integrate it into a script or CI pipeline via the API,
          or add the MCP server to Claude or Cursor to let your AI agent call these tools automatically.
          The <a href="/openapi.json" className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/openapi.json</a> endpoint
          documents every tool&apos;s input and output schemas in a machine-readable format.
        </p>
        <p className="text-muted-foreground max-w-2xl">
          Tools are grouped by category below. Each category solves a distinct class of problems —
          encoding covers the formats that move data safely over HTTP, cryptography covers integrity
          and verification, conversion covers format translation, and so on. Every tool is stateless:
          the same input always produces the same output, with no server-side state, no user accounts,
          and no data retention beyond the lifetime of the request.
        </p>
        <p className="text-muted-foreground max-w-2xl">
          Because every tool exposes a REST API and an MCP entry, you can chain them inside automated
          workflows. A common pattern: an AI agent calls the JWT decoder to extract the expiry claim
          from a token, feeds the Unix timestamp to the timestamp converter to display it as a human
          date, then calls the hash generator to verify a payload checksum — all in a single automated
          pipeline without the user needing to open a browser.
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Why single-purpose tools?</h2>
        <p className="text-muted-foreground">
          Every tool on quickhelp.dev does exactly one thing. This is a deliberate design decision,
          not a limitation. Single-purpose tools are easier to integrate into scripts and pipelines
          because their interfaces are narrow and predictable. When a tool accepts one kind of input
          and returns one kind of output, it can be composed with other tools without surprises.
        </p>
        <p className="text-muted-foreground">
          It also makes them more trustworthy for AI agents. A large language model calling a tool
          can reason about what a JSON formatter will do — it will pretty-print or minify the JSON.
          A tool that also sorts keys, validates schemas, converts to YAML, and summarises the
          structure is much harder to reason about. The narrow scope is a feature.
        </p>
        <p className="text-muted-foreground">
          Every tool here is also stateless and deterministic. Given the same input, the same output
          is always produced. There is no hidden server-side state, no session, and no user account
          influencing the result. This predictability makes tools suitable for CI pipelines, automated
          testing, and any workflow where reproducibility matters.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Privacy-first by default</h2>
        <p className="text-muted-foreground">
          Several tools in the image and conversion categories — the Image Converter, Image Resizer,
          and Background Remover — perform all processing in your browser. Your files are never
          uploaded to any server. The image data is processed entirely by the JavaScript running
          in your browser tab, using the Canvas API and WebAssembly. This is significant for
          developers working with sensitive documents, proprietary designs, or personal photos
          who would prefer not to trust those files to a third-party server.
        </p>
        <p className="text-muted-foreground">
          For the API-based tools (JWT decoder, JSON formatter, hash generator, timestamp converter,
          and others), requests are processed on the server but nothing is logged beyond standard
          infrastructure access logs, and inputs are not retained after the response is sent.
          See the <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a> for
          full details.
        </p>
      </section>
      </div>
    </>
  );
}
