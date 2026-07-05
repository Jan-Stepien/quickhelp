import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { registry } from "@/lib/registry";
import { JsonLd } from "@quickhelp/seo";
import { manifestToJsonLd, buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import type { Tool } from "@quickhelp/tool-kit";
import { buildMetadata } from "@/lib/metadata";
import { getCompareContent } from "@/lib/compare-content";

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
  return buildMetadata({
    path: `/compare/${params.pair}`,
    title: `${a.name} vs ${b.name}: When to Use Each`,
    description: `Compare ${a.name} and ${b.name}: what each tool does, key differences, and when to use one over the other. Free, no sign-up.`,
    keywords: [a.name, b.name, "compare", "vs", "developer tools", "when to use"],
  });
}

export default function ComparePage({ params }: { params: { pair: string } }) {
  const [toolA, toolB] = parsePair(params.pair);
  if (!toolA || !toolB) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const content = getCompareContent(toolA, toolB);

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${toolA.name} vs ${toolB.name}: When to Use Each`,
    description: content.intro,
    url: `${baseUrl}/compare/${params.pair}`,
  };

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "All Tools", url: `${baseUrl}/tools` },
    { name: `${toolA.name} vs ${toolB.name}`, url: `${baseUrl}/compare/${params.pair}` },
  ]);

  const toolAJsonLd = manifestToJsonLd(toolA, baseUrl)[0];
  const toolBJsonLd = manifestToJsonLd(toolB, baseUrl)[0];

  const faqJsonLd = content.mergedFaq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.mergedFaq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <>
      <JsonLd data={pageJsonLd} />
      <JsonLd data={breadcrumb} />
      {toolAJsonLd && <JsonLd data={toolAJsonLd} />}
      {toolBJsonLd && <JsonLd data={toolBJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <article className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tool comparison
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {toolA.name} vs {toolB.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{content.intro}</p>
        </header>

        {/* Editorial verdict */}
        <section aria-labelledby="verdict-heading" className="rounded-lg border border-border bg-muted/30 px-6 py-5">
          <h2 id="verdict-heading" className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Bottom line
          </h2>
          <p className="text-foreground leading-relaxed">{content.verdict}</p>
        </section>

        {/* What each tool does */}
        <section aria-labelledby="what-each-does-heading">
          <h2 id="what-each-does-heading" className="mb-4 text-xl font-semibold">
            What each tool does
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">{toolA.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.toolAWhatIs}</p>
              <a
                href={`/${toolA.slug}`}
                className="inline-block text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
              >
                Open {toolA.name} →
              </a>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">{toolB.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.toolBWhatIs}</p>
              <a
                href={`/${toolB.slug}`}
                className="inline-block text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
              >
                Open {toolB.name} →
              </a>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section aria-labelledby="comparison-table-heading">
          <h2 id="comparison-table-heading" className="mb-4 text-xl font-semibold">
            Side-by-side comparison
          </h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/4">Feature</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">{toolA.name}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">{toolB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {content.tableRows.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 font-medium text-muted-foreground">{row.label}</td>
                    <td className="px-4 py-3 text-foreground">{row.a}</td>
                    <td className="px-4 py-3 text-foreground">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to use each */}
        <section aria-labelledby="when-to-use-heading">
          <h2 id="when-to-use-heading" className="mb-6 text-xl font-semibold">
            When to use each
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">
                Use {toolA.name} when…
              </h3>
              {content.whenToUseA.map((uc, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{uc.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uc.intro}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">
                Use {toolB.name} when…
              </h3>
              {content.whenToUseB.map((uc, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{uc.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uc.intro}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Merged FAQ */}
        {content.mergedFaq.length > 0 && (
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="mb-4 text-xl font-semibold">
              Frequently asked questions
            </h2>
            <dl className="space-y-4">
              {content.mergedFaq.map((item, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <dt className="font-medium text-foreground">{item.question}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* CTAs */}
        <footer className="flex flex-wrap gap-4 border-t border-border pt-6">
          <a
            href={`/${toolA.slug}`}
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Use {toolA.name} →
          </a>
          <a
            href={`/${toolB.slug}`}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Use {toolB.name} →
          </a>
          <a
            href="/tools"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Browse all tools
          </a>
        </footer>
      </article>
    </>
  );
}
