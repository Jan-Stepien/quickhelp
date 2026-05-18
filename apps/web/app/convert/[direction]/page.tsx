import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDirections, parseDirection, FORMAT_INFO } from "@/lib/conversion-directions";
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

  return (
    <>
      {jsonLd.map((obj, i) => (
        <JsonLd key={i} data={obj} />
      ))}
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumb} />

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {fromLabel} to {toLabel} Converter
          </h1>
          <p className="text-gray-600">
            {fromInfo?.description} {toInfo?.description}
          </p>
        </div>

        <ToolPageClient
          tool={serialized}
          prefilledValues={{ from: dir.from, to: dir.to }}
        />
      </div>
    </>
  );
}
