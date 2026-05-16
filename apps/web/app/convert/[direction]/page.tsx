import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDirections, parseDirection, FORMAT_INFO } from "@/lib/conversion-directions";
import { getToolBySlug } from "@/lib/registry";
import { serializeTool } from "@/lib/tool-serializer";
import { ToolPageClient } from "@/app/[tool]/ToolPageClient";
import { JsonLd } from "@no-work/seo";
import { manifestToJsonLd } from "@no-work/tool-kit";

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
  return {
    title: `${fromLabel} to ${toLabel} Converter — no.work`,
    description: `Convert ${fromLabel} images to ${toLabel} format online, free. No sign-up, no software to install.`,
  };
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

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://no.work";
  const jsonLd = manifestToJsonLd(tool, baseUrl);

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to convert ${fromLabel} to ${toLabel}`,
    step: [
      {
        "@type": "HowToStep",
        name: "Upload",
        text: `Click the file picker and select your ${fromLabel} image (up to 3 MB).`,
      },
      {
        "@type": "HowToStep",
        name: "Convert",
        text: `The source format is pre-set to ${fromLabel} and the target to ${toLabel}. Click Run.`,
      },
      {
        "@type": "HowToStep",
        name: "Download",
        text: `Preview the converted ${toLabel} image and click Download.`,
      },
    ],
  };

  return (
    <>
      {jsonLd.map((obj, i) => (
        <JsonLd key={i} data={obj} />
      ))}
      <JsonLd data={howToJsonLd} />

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
