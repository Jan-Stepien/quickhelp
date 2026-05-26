import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDirections, parseDirection, FORMAT_INFO, getConversionContent } from "@/lib/conversion-directions";
import { getToolBySlug } from "@/lib/registry";
import { serializeTool } from "@/lib/tool-serializer";
import { ToolPageClient } from "@/app/[tool]/ToolPageClient";
import { JsonLd } from "@quickhelp/seo";
import { manifestToJsonLd, buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllDirections().map((d) => ({ direction: d.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { direction: string };
}): Metadata {
  const dir = parseDirection(params.direction);
  if (!dir) return {};
  const fromLabel = FORMAT_INFO[dir.from]?.label ?? dir.from.toUpperCase();
  const toLabel = FORMAT_INFO[dir.to]?.label ?? dir.to.toUpperCase();
  return buildMetadata({
    path: `/convert/${params.direction}`,
    title: `${fromLabel} to ${toLabel} Converter`,
    description: `Convert ${fromLabel} images to ${toLabel} format online, free. No sign-up, no software to install. Privacy-first: runs in your browser.`,
    keywords: [fromLabel, toLabel, "image converter", "convert", "free", "online", "browser"],
  });
}

export default function ConversionPage({
  params,
}: {
  params: { direction: string };
}) {
  const dir = parseDirection(params.direction);
  if (!dir) notFound();

  const tool = getToolBySlug("image-converter");
  if (!tool) notFound();

  const serialized = serializeTool(tool);
  const fromInfo = FORMAT_INFO[dir.from];
  const toInfo = FORMAT_INFO[dir.to];
  const fromLabel = fromInfo?.label ?? dir.from.toUpperCase();
  const toLabel = toInfo?.label ?? dir.to.toUpperCase();
  const content = getConversionContent(dir.from, dir.to);

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const jsonLd = manifestToJsonLd(tool, baseUrl);
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Image Converter", url: `${baseUrl}/image-converter` },
    { name: `${fromLabel} to ${toLabel}`, url: `${baseUrl}/convert/${dir.from}-to-${dir.to}` },
  ]);

  // HowTo schema deprecated by Google (Sept 2023). Steps rendered as visible HTML instead.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `How to convert ${fromLabel} to ${toLabel}`,
    description: `Step-by-step guide to convert ${fromLabel} images to ${toLabel} format online for free.`,
    url: `${baseUrl}/convert/${dir.from}-to-${dir.to}`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {jsonLd.map((obj, i) => (
        <JsonLd key={i} data={obj} />
      ))}
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumb} />

      <div className="mx-auto max-w-2xl space-y-10 py-4">
        {/* Hero */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {fromLabel} to {toLabel} Converter
          </h1>
          <p className="text-muted-foreground">
            Convert {fromLabel} images to {toLabel} format free, in your browser — no upload, no sign-up.
          </p>
        </div>

        {/* The tool */}
        <ToolPageClient
          tool={serialized}
          prefilledValues={{ from: dir.from, to: dir.to }}
        />

        {/* Why convert */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Why convert {fromLabel} to {toLabel}?</h2>
          <p className="text-sm text-muted-foreground">{content.why}</p>
          <ul className="space-y-1">
            {content.useCases.map((uc, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1 shrink-0 text-foreground/30">–</span>
                <span>{uc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* About the formats */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">About {fromLabel} and {toLabel}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{fromLabel} (source)</div>
              <p className="text-sm text-muted-foreground">{fromInfo?.description}</p>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{toLabel} (output)</div>
              <p className="text-sm text-muted-foreground">{toInfo?.description}</p>
            </div>
          </div>
          {content.qualityNote && (
            <p className="text-sm text-muted-foreground rounded-lg bg-muted/40 border border-border px-4 py-3">
              <span className="font-medium text-foreground">Quality note: </span>
              {content.qualityNote}
            </p>
          )}
        </section>

        {/* Step-by-step */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">How to convert {fromLabel} to {toLabel}</h2>
          <ol className="space-y-2">
            {[
              `Drag your ${fromLabel} file (or files) onto the converter above, or click to browse.`,
              `Confirm the output format is set to ${toLabel}. Adjust quality or size options if needed.`,
              `Click Convert. The conversion runs in your browser — your images are never uploaded.`,
              `Download the ${toLabel} file. For multiple files, a ZIP is downloaded automatically.`,
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="shrink-0 font-mono text-xs pt-0.5 text-foreground/40">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Frequently asked questions</h2>
          <dl className="space-y-4">
            {content.faq.map((item, i) => (
              <div key={i} className="space-y-1">
                <dt className="text-sm font-medium text-foreground">{item.question}</dt>
                <dd className="text-sm text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Related directions */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Other {fromLabel} conversions</h2>
          <div className="flex flex-wrap gap-2">
            {getAllDirections()
              .filter((d) => d.from === dir.from && d.to !== dir.to)
              .map((d) => {
                const toL = FORMAT_INFO[d.to]?.label ?? d.to.toUpperCase();
                return (
                  <a
                    key={d.slug}
                    href={`/convert/${d.slug}`}
                    className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    {fromLabel} → {toL}
                  </a>
                );
              })}
          </div>
        </section>
      </div>
    </>
  );
}
