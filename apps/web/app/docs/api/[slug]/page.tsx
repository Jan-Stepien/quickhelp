import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getToolBySlug, registry } from "@/lib/registry";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return registry.map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return buildMetadata({
    path: `/docs/api/${params.slug}`,
    title: `${tool.name} API Reference`,
    description: `REST API documentation for ${tool.name} on quickhelp.dev — endpoint, request schema, response schema, and curl examples.`,
    keywords: [`${tool.name} API`, `${tool.slug} REST API`, "quickhelp API", "developer docs", tool.category],
  });
}

function schemaTypeLabel(zodType: { _def?: { typeName?: string } } | null | undefined): string {
  const name = zodType?._def?.typeName ?? "";
  const map: Record<string, string> = {
    ZodString: "string",
    ZodNumber: "number",
    ZodBoolean: "boolean",
    ZodObject: "object",
    ZodArray: "array",
    ZodEnum: "enum",
    ZodOptional: "optional",
    ZodDefault: "default",
    ZodRecord: "record",
    ZodUnknown: "unknown",
  };
  return map[name] ?? name.replace("Zod", "").toLowerCase();
}

function getFields(schema: {
  shape?: Record<string, { _def?: { typeName?: string; description?: string } }>;
}): { name: string; type: string; required: boolean; description: string }[] {
  if (!schema?.shape) return [];
  return Object.entries(schema.shape).map(([name, field]) => {
    const typeName = field?._def?.typeName ?? "";
    const isOptional = typeName === "ZodOptional" || typeName === "ZodDefault";
    const description = field?._def?.description ?? "";
    return { name, type: schemaTypeLabel(field), required: !isOptional, description };
  });
}

export default function DocsApiPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const endpoint = `${baseUrl}/api/${tool.slug}`;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Docs", url: `${baseUrl}/docs` },
    { name: `${tool.name} API`, url: `${baseUrl}/docs/api/${tool.slug}` },
  ]);

  const techArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${tool.name} API Reference`,
    description: tool.description,
    url: `${baseUrl}/docs/api/${tool.slug}`,
    publisher: { "@id": `${baseUrl}/#organization` },
  };

  const inputFields = getFields(tool.inputSchema as Parameters<typeof getFields>[0]);
  const outputFields = getFields(tool.outputSchema as Parameters<typeof getFields>[0]);

  const exampleInput = tool.examples[0]?.input ?? {};
  const exampleOutput = tool.examples[0]?.output ?? {};

  const curlExample = `curl -X POST ${endpoint} \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(exampleInput)}'`;

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={techArticle} />
      <article className="mx-auto max-w-3xl space-y-10 py-4">
        <header className="space-y-3">
          <nav className="text-xs text-muted-foreground">
            <Link href="/">Home</Link> / <Link href="/docs">Docs</Link> / {tool.name} API
          </nav>
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              {tool.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{tool.name} API Reference</h1>
          <p className="text-lg text-muted-foreground">{tool.description}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Endpoint</h2>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3">
            <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">POST</span>
            <code className="font-mono text-sm break-all">/api/{tool.slug}</code>
          </div>
          <p className="text-sm text-muted-foreground">
            Full URL: <code className="font-mono text-xs">{endpoint}</code>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Request</h2>
          <p className="text-sm text-muted-foreground">
            Content-Type: <code className="font-mono">application/json</code>. No authentication required for the anonymous free tier (30 req/min per IP).
          </p>
          {inputFields.length > 0 && (
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 text-foreground">Field</th>
                    <th className="text-left px-4 py-2 text-foreground">Type</th>
                    <th className="text-left px-4 py-2 text-foreground">Required</th>
                    <th className="text-left px-4 py-2 text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {inputFields.map((f) => (
                    <tr key={f.name} className="border-t border-border">
                      <td className="px-4 py-2 font-mono text-xs">{f.name}</td>
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{f.type}</td>
                      <td className="px-4 py-2 text-xs">{f.required ? "Yes" : "No"}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{f.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Response</h2>
          <p className="text-sm text-muted-foreground">
            Returns <code className="font-mono">application/json</code>. On error, returns a JSON object with an <code className="font-mono">error</code> string field and an appropriate HTTP status code.
          </p>
          {outputFields.length > 0 && (
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 text-foreground">Field</th>
                    <th className="text-left px-4 py-2 text-foreground">Type</th>
                    <th className="text-left px-4 py-2 text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {outputFields.map((f) => (
                    <tr key={f.name} className="border-t border-border">
                      <td className="px-4 py-2 font-mono text-xs">{f.name}</td>
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{f.type}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{f.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {tool.examples.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Example</h2>
            {tool.examples[0] && (
              <p className="text-sm text-muted-foreground font-medium">{tool.examples[0].title}</p>
            )}

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">curl</p>
              <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">{curlExample}</pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Request body</p>
              <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
                {JSON.stringify(exampleInput, null, 2)}
              </pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Response</p>
              <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
                {JSON.stringify(exampleOutput, null, 2)}
              </pre>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Error codes</h2>
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-2 text-foreground">Status</th>
                  <th className="text-left px-4 py-2 text-foreground">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["200", "Success — result in response body"],
                  ["400", "Bad request — invalid input; error field describes the problem"],
                  ["404", "Tool not found"],
                  ["429", "Rate limit exceeded (30 req/min anonymous, 300 req/min free key)"],
                  ["500", "Internal server error — transient; retry with exponential back-off"],
                ].map(([status, meaning]) => (
                  <tr key={status} className="border-t border-border">
                    <td className="px-4 py-2 font-mono text-xs">{status}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">OpenAPI spec</h2>
          <p className="text-sm text-muted-foreground">
            The full OpenAPI 3.1 specification for all tools is available at{" "}
            <Link href="/openapi.json" className="underline underline-offset-2 text-foreground font-mono">
              /openapi.json
            </Link>
            . Import it into Postman, Insomnia, or any OpenAPI-compatible client to get all endpoints with
            schema validation automatically.
          </p>
        </section>

        <footer className="border-t border-border pt-6 flex items-center justify-between">
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
            ← All API docs
          </Link>
          <Link href={`/${tool.slug}`} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
            Try {tool.name} →
          </Link>
        </footer>
      </article>
    </>
  );
}
