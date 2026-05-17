import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { registry, getToolBySlug } from "@/lib/registry";
import { serializeTool } from "@/lib/tool-serializer";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { ToolPageClient } from "./ToolPageClient";

interface Props {
  params: Promise<{ tool: string }>;
}

export async function generateStaticParams() {
  // image-converter has its own dedicated page at /app/image-converter
  return registry.filter((t) => t.slug !== "image-converter").map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return { title: tool.name, description: tool.summary };
}

export default async function ToolPage({ params }: Props) {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const jsonLd = buildToolJsonLd(tool, baseUrl);
  const serialized = serializeTool(tool);

  return (
    <>
      {jsonLd.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <ToolPageClient tool={serialized} />
    </>
  );
}
