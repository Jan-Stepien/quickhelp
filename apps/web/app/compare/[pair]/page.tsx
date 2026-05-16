import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { registry } from "@/lib/registry";
import { JsonLd } from "@no-work/seo";
import { manifestToJsonLd } from "@no-work/tool-kit";
import type { Tool } from "@no-work/tool-kit";

export const dynamic = "force-static";

function getComparePairs(): { pair: string }[] {
  const pairs: { pair: string }[] = [];
  const seen = new Set<string>();
  for (const tool of registry) {
    const related = tool.content?.relatedTools ?? [];
    for (const relatedSlug of related) {
      const key = [tool.slug, relatedSlug].sort().join("-vs-");
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ pair: key });
      }
    }
  }
  return pairs;
}

function parsePair(pair: string): [Tool | undefined, Tool | undefined] {
  const match = pair.match(/^([a-z0-9-]+)-vs-([a-z0-9-]+)$/);
  if (!match) return [undefined, undefined];
  const a = registry.find((t) => t.slug === match[1]);
  const b = registry.find((t) => t.slug === match[2]);
  return [a, b];
}

export function generateStaticParams() {
  return getComparePairs();
}

export function generateMetadata({
  params,
}: {
  params: { pair: string };
}): Metadata {
  const [a, b] = parsePair(params.pair);
  if (!a || !b) return {};
  return {
    title: `${a.name} vs ${b.name} — quickhelp.dev`,
    description: `Compare ${a.name} and ${b.name}: features, use cases, and when to use each tool.`,
  };
}

export default function ComparePage({ params }: { params: { pair: string } }) {
  const [toolA, toolB] = parsePair(params.pair);
  if (!toolA || !toolB) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${toolA.name} vs ${toolB.name}`,
    description: `Side-by-side comparison of ${toolA.name} and ${toolB.name}.`,
    url: `${baseUrl}/compare/${params.pair}`,
  };

  const toolAJsonLd = manifestToJsonLd(toolA, baseUrl)[0];
  const toolBJsonLd = manifestToJsonLd(toolB, baseUrl)[0];

  return (
    <>
      <JsonLd data={pageJsonLd} />
      {toolAJsonLd && <JsonLd data={toolAJsonLd} />}
      {toolBJsonLd && <JsonLd data={toolBJsonLd} />}

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          {toolA.name} vs {toolB.name}
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          <ToolCard tool={toolA} baseUrl={baseUrl} />
          <ToolCard tool={toolB} baseUrl={baseUrl} />
        </div>

        <ComparisonTable toolA={toolA} toolB={toolB} />
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ToolCard({ tool, baseUrl }: { tool: Tool<any, any>; baseUrl: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 space-y-3">
      <div>
        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {tool.category}
        </span>
        <h2 className="mt-2 text-xl font-semibold">{tool.name}</h2>
        <p className="mt-1 text-gray-600 text-sm">{tool.summary}</p>
      </div>
      <p className="text-gray-700 text-sm">{tool.description}</p>
      {tool.examples.length > 0 && (
        <div className="rounded-md bg-gray-50 p-3 text-xs font-mono">
          <p className="font-semibold text-gray-500 mb-1">Example input:</p>
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(tool.examples[0]!.input, null, 2)}
          </pre>
        </div>
      )}
      <a
        href={`${baseUrl}/${tool.slug}`}
        className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Use {tool.name} →
      </a>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ComparisonTable({ toolA, toolB }: { toolA: Tool<any, any>; toolB: Tool<any, any> }) {
  const rows = [
    { label: "Category", a: toolA.category, b: toolB.category },
    {
      label: "Inputs",
      a: getInputKeys(toolA),
      b: getInputKeys(toolB),
    },
    {
      label: "Outputs",
      a: getOutputKeys(toolA),
      b: getOutputKeys(toolB),
    },
  ];

  return (
    <div className="mt-8 overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Feature</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">{toolA.name}</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">{toolB.name}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-3 font-medium text-gray-600">{row.label}</td>
              <td className="px-4 py-3 text-gray-800">{row.a}</td>
              <td className="px-4 py-3 text-gray-800">{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getInputKeys(tool: Tool<any, any>): string {
  try {
    const shape = (tool.inputSchema as { shape?: Record<string, unknown> }).shape;
    return shape ? Object.keys(shape).join(", ") : "—";
  } catch {
    return "—";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOutputKeys(tool: Tool<any, any>): string {
  try {
    const shape = (tool.outputSchema as { shape?: Record<string, unknown> }).shape;
    return shape ? Object.keys(shape).join(", ") : "—";
  } catch {
    return "—";
  }
}
