import Link from "next/link";
import { registry } from "@/lib/registry";

export default function HomePage() {
  const featured = registry.slice(0, 4);
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Utility tools for humans and agents
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          Small, deterministic tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry.
          Free to use. Agent-native from day one.
        </p>
        <div className="flex gap-3">
          <Link
            href="/tools"
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            Browse all tools
          </Link>
          <a
            href="/openapi.json"
            className="rounded-md border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            OpenAPI
          </a>
          <a
            href="/llms.txt"
            className="rounded-md border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            llms.txt
          </a>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Featured tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="block rounded-lg border bg-white p-5 hover:border-gray-400"
            >
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                {tool.category}
              </div>
              <div className="font-semibold text-gray-900">{tool.name}</div>
              <div className="mt-1 text-sm text-gray-600">{tool.summary}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">For AI agents</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            <span className="font-mono text-gray-500">GET /openapi.json</span> — OpenAPI 3.1 for all tools
          </li>
          <li>
            <span className="font-mono text-gray-500">GET /llms.txt</span> — llms.txt discovery surface
          </li>
          <li>
            <span className="font-mono text-gray-500">POST /api/{"<slug>"}</span> — REST API, JSON in/out
          </li>
          <li>
            <span className="font-mono text-gray-500">MCP</span> — same registry, stdio or HTTP
          </li>
        </ul>
      </section>
    </div>
  );
}
