import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getToolBySlug, registry } from "@/lib/registry";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { buildMetadata } from "@/lib/metadata";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = buildMetadata({
  path: "/background-remover",
  title: "Background Remover",
  description:
    "Remove image backgrounds instantly with AI. Runs entirely in your browser — your image never leaves your device. Free, no sign-up.",
  keywords: ["background remover", "remove background", "AI background removal", "transparent background", "PNG background remover", "free background remover", "browser AI"],
});

// ssr: false keeps onnxruntime-web out of the server bundle entirely (ESM/CJS incompatibility)
const BackgroundRemoverUI = dynamic(
  () => import("./BackgroundRemoverUI").then((m) => ({ default: m.BackgroundRemoverUI })),
  { ssr: false }
);

export default function BackgroundRemoverPage() {
  const tool = getToolBySlug("background-remover");
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const jsonLd = tool ? buildToolJsonLd(tool, baseUrl) : [];
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "All Tools", url: `${baseUrl}/tools` },
    { name: "Background Remover", url: `${baseUrl}/background-remover` },
  ]);
  const content = tool?.content;

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      {jsonLd.map((item, i) => (
        <JsonLd key={i} data={item} />
      ))}
      <JsonLd data={breadcrumb} />

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          image
        </p>
        <h1 className="text-3xl font-bold">Background Remover</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered background removal — runs entirely in your browser. Your image never leaves your device.
        </p>
      </header>

      {/* Browser-only AI — requires WebAssembly + WebGPU/WASM; ssr:false */}
      <BackgroundRemoverUI />
      <AdSlot slot="tool-page-mid" format="horizontal" className="my-2" />

      {content?.whatIs && (
        <section id="what-is" aria-labelledby="what-is-heading">
          <h2 id="what-is-heading" className="mb-3 text-xl font-semibold">
            What is Background Remover?
          </h2>
          <p className="text-muted-foreground leading-relaxed">{content.whatIs}</p>
        </section>
      )}

      {content?.howToSteps && content.howToSteps.length > 0 && (
        <section id="how-to-use" aria-labelledby="how-to-heading">
          <h2 id="how-to-heading" className="mb-3 text-xl font-semibold">
            How to remove an image background
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
            {content.relatedTools.map((slug) => {
              const related = registry.find((t) => t.slug === slug);
              if (!related) return null;
              return (
                <li key={slug}>
                  <Link
                    href={`/${slug}`}
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
          This tool runs the AI model entirely in your browser using WebAssembly. No image data is transmitted to any server.
        </p>
      </footer>
    </article>
  );
}
