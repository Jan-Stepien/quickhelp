import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";

export const dynamic = "force-static";

interface GlossaryEntry {
  term: string;
  slug: string;
  definition: string;
  extended: string;
  related?: string[];
  seeAlso?: { label: string; href: string }[];
}

// Each entry ≥200 words per quality-gates.md (safe-at-scale programmatic page type)
const GLOSSARY: GlossaryEntry[] = [
  {
    term: "JWT",
    slug: "jwt",
    definition:
      "JWT (JSON Web Token) is an open standard (RFC 7519) for compactly and securely transmitting information between parties as a JSON object. A JWT consists of three base64url-encoded parts separated by dots: the header (algorithm and token type), the payload (claims), and the signature.",
    extended: `
JSON Web Tokens are commonly used for authentication and information exchange in web applications and APIs. The header specifies the signing algorithm (e.g., HS256, RS256) and token type. The payload contains claims — statements about an entity (typically the user) and additional metadata. Common registered claims include \`iss\` (issuer), \`sub\` (subject), \`exp\` (expiration time), \`iat\` (issued at), and \`aud\` (audience).

The signature is computed by encoding the header and payload, concatenating them with a dot, and signing with the algorithm specified in the header. For HMAC-based algorithms (HS256, HS384, HS512), the signature uses a shared secret. For RSA and ECDSA algorithms, a private key signs and a public key verifies.

JWTs are widely used in OAuth 2.0, OpenID Connect, and session management. They allow stateless authentication because the server can verify the token without storing session data. However, JWTs cannot be invalidated before expiry without a server-side deny-list, so short expiry times are recommended for sensitive operations.

Use quickhelp.dev's JWT Decoder to inspect any JWT's header and payload, and optionally verify the signature with your secret or public key.
    `.trim(),
    related: ["jwt-decoder", "json-formatter"],
    seeAlso: [
      { label: "JWT Decoder", href: "/jwt-decoder" },
      { label: "RFC 7519", href: "https://datatracker.ietf.org/doc/html/rfc7519" },
    ],
  },
  {
    term: "MCP",
    slug: "mcp",
    definition:
      "MCP (Model Context Protocol) is an open standard that defines how AI models and agents discover and invoke external tools. It provides a unified interface for tool registration, invocation, and result handling, enabling any AI system to use any MCP-compatible tool without custom integration code.",
    extended: `
The Model Context Protocol was introduced to solve the n×m integration problem: n AI systems each needing custom integrations with m tools. MCP defines a standard wire protocol (typically JSON-RPC over stdio or HTTP) with well-defined messages for tool discovery (\`tools/list\`), invocation (\`tools/call\`), and resource access.

An MCP server exposes a registry of tools. Each tool has a name, description, and JSON Schema-described input parameters. An MCP client (typically an AI agent or model) queries the server for available tools, selects the appropriate tool, calls it with structured input, and receives structured output.

quickhelp.dev exposes all registered tools over MCP at \`/mcp\` (HTTP transport) and via stdio for local use with Claude Desktop. The same tool registry powering the REST API and OpenAPI spec automatically populates the MCP tool list — adding a new tool makes it available across all four surfaces at once.

MCP is a key part of the agent-native design: tools built for MCP are discoverable by any AI system that speaks the protocol.
    `.trim(),
    related: [],
    seeAlso: [
      { label: "MCP Endpoint", href: "/mcp" },
      { label: "OpenAPI Spec", href: "/openapi.json" },
    ],
  },
  {
    term: "OpenAPI",
    slug: "openapi",
    definition:
      "OpenAPI (formerly Swagger) is a specification for describing HTTP APIs in a machine-readable format. An OpenAPI document (typically JSON or YAML) describes endpoints, request/response schemas, authentication, and examples in a standardised way that tools can use to generate clients, servers, documentation, and tests automatically.",
    extended: `
OpenAPI 3.1 (the current version) aligns fully with JSON Schema, allowing reuse of existing schema definitions and enabling richer validation. An OpenAPI document consists of an \`info\` block (title, version, description), \`paths\` (endpoints with operations), \`components\` (reusable schemas, parameters, responses), and optional security schemes.

For AI agents, the OpenAPI spec is a critical discovery surface. Agents can load \`/openapi.json\`, parse the available operations, understand input and output shapes, and call any tool without prior knowledge of its API. Tools like Claude, ChatGPT plugins, and LangChain's OpenAPI agent all support this pattern.

quickhelp.dev maintains an aggregated OpenAPI 3.1 document at \`/openapi.json\`. Each tool's \`inputSchema\` and \`outputSchema\` (defined as Zod schemas in the manifest) are automatically compiled to JSON Schema and embedded in the OpenAPI document. Adding a new tool automatically extends the spec.

Use the spec to generate client SDKs in any language, import it into Postman or Insomnia, or point an AI agent at it for tool discovery.
    `.trim(),
    related: [],
    seeAlso: [
      { label: "quickhelp.dev OpenAPI spec", href: "/openapi.json" },
      { label: "OpenAPI Initiative", href: "https://www.openapis.org" },
    ],
  },
  {
    term: "llms.txt",
    slug: "llms-txt",
    definition:
      "llms.txt is an emerging standard (proposed 2024) for web sites to provide AI language models with a structured, concise summary of their content. Similar to robots.txt for search engine crawlers, llms.txt tells AI systems what a site offers, where to find key resources, and how to interact with its APIs.",
    extended: `
The llms.txt format is a plain-text Markdown document placed at the root of a domain (\`/llms.txt\`). It typically starts with a title and brief description of the site, followed by structured lists of pages, APIs, and key resources. Unlike a sitemap (which lists URLs for indexing), llms.txt is written for AI consumption — it explains what the site does, what tools or APIs are available, and how to use them.

An extended variant, llms-full.txt, provides a comprehensive content dump suitable for one-shot context loading by an AI agent. Instead of just listing URLs, it includes the full content of each tool's description, usage steps, and examples.

quickhelp.dev provides both:
- \`/llms.txt\` — lightweight discovery document, one entry per tool
- \`/llms-full.txt\` — complete content of all tools for one-shot loading

These surfaces, combined with \`/openapi.json\` and \`/mcp\`, make quickhelp.dev fully discoverable by any AI agent or model that follows standard discovery patterns.
    `.trim(),
    related: [],
    seeAlso: [
      { label: "llms.txt", href: "/llms.txt" },
      { label: "llms-full.txt", href: "/llms-full.txt" },
    ],
  },
];

export function generateStaticParams() {
  return GLOSSARY.map((entry) => ({ term: entry.slug }));
}

export function generateMetadata({ params }: { params: { term: string } }): Metadata {
  const entry = GLOSSARY.find((e) => e.slug === params.term);
  if (!entry) return {};
  return buildMetadata({
    path: `/glossary/${params.term}`,
    title: `What is ${entry.term}? — Definition`,
    description: entry.definition.slice(0, 160),
    keywords: [entry.term, "definition", "developer glossary", "what is", "explained"],
  });
}

export default function GlossaryTermPage({ params }: { params: { term: string } }) {
  const entry = GLOSSARY.find((e) => e.slug === params.term);
  if (!entry) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Glossary", url: `${baseUrl}/glossary` },
    { name: entry.term, url: `${baseUrl}/glossary/${entry.slug}` },
  ]);
  const webPage = buildWebPageJsonLd({
    name: `What is ${entry.term}?`,
    description: entry.definition,
    url: `${baseUrl}/glossary/${entry.slug}`,
  });

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={webPage} />
      <article className="mx-auto max-w-3xl space-y-8 py-4">
        <header>
          <nav className="mb-4 text-xs text-muted-foreground">
            <Link href="/">Home</Link> /{" "}
            <Link href="/glossary">Glossary</Link> / {entry.term}
          </nav>
          <h1 className="text-3xl font-bold">What is {entry.term}?</h1>
        </header>

        <section>
          <p className="text-lg text-muted-foreground leading-relaxed">{entry.definition}</p>
        </section>

        <section className="prose prose-sm max-w-none text-muted-foreground">
          {entry.extended.split("\n\n").map((para, i) => (
            <p key={i} className="leading-relaxed mb-4">{para}</p>
          ))}
        </section>

        {entry.seeAlso && entry.seeAlso.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">See also</h2>
            <ul className="flex flex-wrap gap-2">
              {entry.seeAlso.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
