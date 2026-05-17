import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/registry";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { ImageConverterUI } from "./ImageConverterUI";

export const metadata: Metadata = {
  title: "Image Converter",
  description:
    "Convert images between PNG, JPEG, WebP, AVIF, TIFF, GIF, and SVG. Free, fast, no sign-up. Upload multiple files at once.",
};

export default function ImageConverterPage() {
  const tool = getToolBySlug("image-converter");
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const jsonLd = tool ? buildToolJsonLd(tool, baseUrl) : [];

  return (
    <>
      {jsonLd.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <ImageConverterUI />
    </>
  );
}
