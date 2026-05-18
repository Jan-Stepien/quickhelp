import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/glossary",
  title: "Developer Glossary",
  description: "Definitions of key developer and AI concepts used across quickhelp.dev tools — JWT, MCP, OpenAPI, llms.txt, and more.",
  keywords: ["developer glossary", "JWT definition", "MCP definition", "OpenAPI definition", "llms.txt definition"],
});

const TERMS = [
  { slug: "jwt", term: "JWT", summary: "JSON Web Token — compact, URL-safe claims representation." },
  { slug: "mcp", term: "MCP", summary: "Model Context Protocol — standard for AI tool discovery and invocation." },
  { slug: "openapi", term: "OpenAPI", summary: "Machine-readable HTTP API specification format." },
  { slug: "llms-txt", term: "llms.txt", summary: "Standard for structured AI-readable site summaries." },
];

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <header>
        <h1 className="text-3xl font-bold">Developer Glossary</h1>
        <p className="mt-2 text-muted-foreground">
          Definitions of key concepts used across quickhelp.dev tools.
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
