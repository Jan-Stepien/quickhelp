import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { registry, getToolBySlug } from "@/lib/registry";
import { serializeTool } from "@/lib/tool-serializer";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { buildMetadata } from "@/lib/metadata";
import { ToolPageClient } from "./ToolPageClient";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ad-slots";

interface Props {
  params: Promise<{ tool: string }>;
}

export async function generateStaticParams() {
  // image-converter and background-remover have their own dedicated pages
  const DEDICATED = new Set(["image-converter", "background-remover", "lcov-viewer", "image-resizer"]);
  return registry.filter((t) => !DEDICATED.has(t.slug)).map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return buildMetadata({
    path: `/${slug}`,
    title: tool.name,
    description: tool.summary,
    keywords: [tool.name, tool.category, "free tool", "developer tool", "API", "online tool"],
  });
}

export default async function ToolPage({ params }: Props) {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const jsonLd = buildToolJsonLd(tool, baseUrl);
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "All Tools", url: `${baseUrl}/tools` },
    { name: tool.name, url: `${baseUrl}/${tool.slug}` },
  ]);
  const serialized = serializeTool(tool);
  const content = tool.content;

  return (
    <>
      {jsonLd.map((item, i) => (
        <JsonLd key={i} data={item} />
      ))}
      <JsonLd data={breadcrumb} />

      {/* SSR content shell — visible to AI crawlers that don't execute JS */}
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {tool.category}
          </p>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <p className="text-lg text-muted-foreground">{tool.summary}</p>
        </header>

        {/* Interactive tool form — hydrated on client */}
        <ToolPageClient tool={serialized} />

        <AdSlot slot={AD_SLOTS["tool-mid"]} format="horizontal" className="my-2" />

        {content?.whatIs && (
          <section id="what-is" aria-labelledby="what-is-heading">
            <h2 id="what-is-heading" className="mb-3 text-xl font-semibold">
              What is {tool.name}?
            </h2>
            <p className="text-muted-foreground leading-relaxed">{content.whatIs}</p>
          </section>
        )}

        {content?.howToSteps && content.howToSteps.length > 0 && (
          <section id="how-to-use" aria-labelledby="how-to-heading">
            <h2 id="how-to-heading" className="mb-3 text-xl font-semibold">
              How to use {tool.name}
            </h2>
            <ol className="space-y-3 list-decimal list-inside">
              {content.howToSteps.map((step, i) => (
                <li key={i} className="text-muted-foreground">
                  <span className="font-medium text-foreground">{step.name}: </span>
                  {step.text}
                </li>
              ))}
            </ol>
          </section>
        )}

        {content?.faq && content.faq.length > 0 && (
          <section id="faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="mb-4 text-xl font-semibold">
              Frequently asked questions
            </h2>
            <dl className="space-y-4">
              {content.faq.map((item, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <dt className="font-medium">{item.question}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {content?.relatedTools && content.relatedTools.length > 0 && (
          <section id="related" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-3 text-xl font-semibold">
              Related tools
            </h2>
            <ul className="flex flex-wrap gap-2">
              {content.relatedTools.map((relatedSlug) => {
                const related = registry.find((t) => t.slug === relatedSlug);
                if (!related) return null;
                return (
                  <li key={relatedSlug}>
                    <Link
                      href={`/${relatedSlug}`}
                      className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted transition-colors"
                    >
                      {related.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            <strong>API:</strong>{" "}
            <code className="font-mono">
              POST {baseUrl}/api/{tool.slug}
            </code>{" "}
            — JSON in, JSON out. See{" "}
            <a href="/openapi.json" className="underline underline-offset-2">
              OpenAPI spec
            </a>{" "}
            or{" "}
            <a href="/llms.txt" className="underline underline-offset-2">
              llms.txt
            </a>
            .
          </p>
        </footer>
      </article>
    </>
  );
}
