import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getToolBySlug } from "@/lib/registry";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";

export const metadata: Metadata = {
  title: "Background Remover",
  description:
    "Remove image backgrounds instantly with AI. Runs entirely in your browser — your image never leaves your device. Free, no sign-up.",
};

// ssr: false keeps onnxruntime-web out of the server bundle entirely (ESM/CJS incompatibility)
const BackgroundRemoverUI = dynamic(
  () => import("./BackgroundRemoverUI").then((m) => ({ default: m.BackgroundRemoverUI })),
  { ssr: false }
);

export default function BackgroundRemoverPage() {
  const tool = getToolBySlug("background-remover");
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
      <BackgroundRemoverUI />
    </>
  );
}
