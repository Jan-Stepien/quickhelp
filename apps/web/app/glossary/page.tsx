import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/glossary",
  title: "Developer Glossary — Encoding, Cryptography & API Concepts",
  description: "Plain-English definitions of Base64, SHA-256, JWT, UUID, REST API, Regex, OAuth 2.0, MCP, OpenAPI and more — key concepts used across quickhelp.dev developer tools.",
  keywords: ["developer glossary", "Base64 definition", "SHA-256 definition", "JWT definition", "UUID definition", "REST API definition", "regex definition", "OAuth 2.0 definition", "MCP definition", "OpenAPI definition", "URL encoding definition", "Unix timestamp definition"],
});

const TERMS = [
  { slug: "base64", term: "Base64", summary: "Binary-to-text encoding scheme that represents binary data as printable ASCII characters." },
  { slug: "binary", term: "Binary", summary: "Base-2 number system using only digits 0 and 1 — the native language of computers." },
  { slug: "csv", term: "CSV", summary: "Comma-Separated Values — simple tabular text format widely used for data exchange." },
  { slug: "hash-function", term: "Hash function", summary: "One-way function that maps data of any size to a fixed-length digest." },
  { slug: "hexadecimal", term: "Hexadecimal", summary: "Base-16 number system using digits 0–9 and letters A–F, common in computing." },
  { slug: "hmac", term: "HMAC", summary: "Hash-based Message Authentication Code — keyed cryptographic MAC using a hash function." },
  { slug: "json", term: "JSON", summary: "JavaScript Object Notation — lightweight, human-readable data interchange format." },
  { slug: "json-schema", term: "JSON Schema", summary: "Vocabulary for annotating and validating JSON document structure." },
  { slug: "jwt", term: "JWT", summary: "JSON Web Token — compact, URL-safe claims representation used in auth flows." },
  { slug: "llms-txt", term: "llms.txt", summary: "Emerging standard for structured AI-readable site summaries, analogous to robots.txt." },
  { slug: "mcp", term: "MCP", summary: "Model Context Protocol — open standard for AI tool discovery and invocation." },
  { slug: "oauth2", term: "OAuth 2.0", summary: "Authorization framework for delegating access without sharing credentials." },
  { slug: "openapi", term: "OpenAPI", summary: "Machine-readable HTTP API specification format (formerly Swagger)." },
  { slug: "regex", term: "Regex", summary: "Regular expressions — patterns for matching and extracting text." },
  { slug: "rest-api", term: "REST API", summary: "Architectural style for HTTP APIs using resources, verbs, and stateless requests." },
  { slug: "sha-256", term: "SHA-256", summary: "Secure Hash Algorithm producing a 256-bit digest; backbone of TLS, Git, and Bitcoin." },
  { slug: "unix-timestamp", term: "Unix timestamp", summary: "Count of seconds elapsed since 1970-01-01T00:00:00Z, the universal epoch." },
  { slug: "url-encoding", term: "URL encoding", summary: "Percent-encoding scheme that safely embeds arbitrary bytes in URLs." },
  { slug: "uuid", term: "UUID", summary: "Universally Unique Identifier — 128-bit label guaranteed to be globally unique." },
  { slug: "zod", term: "Zod", summary: "TypeScript-first schema declaration and runtime validation library." },
];

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <header>
        <h1 className="text-3xl font-bold">Developer Glossary</h1>
        <p className="mt-2 text-muted-foreground">
          Plain-English definitions of encoding standards, cryptographic primitives, API protocols, and data formats used across quickhelp.dev tools. Each entry links to a full explanation with examples, use cases, and related tools.
        </p>
      </header>

      <ul className="space-y-3">
        {TERMS.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/glossary/${entry.slug}`}
              className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-muted transition-colors"
            >
              <span className="font-mono font-semibold text-foreground w-24 shrink-0">
                {entry.term}
              </span>
              <span className="text-sm text-muted-foreground">{entry.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
