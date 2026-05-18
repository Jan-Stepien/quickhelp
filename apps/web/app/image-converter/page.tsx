import type { Metadata } from "next";
import Link from "next/link";
import { getToolBySlug, registry } from "@/lib/registry";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { buildMetadata } from "@/lib/metadata";
import { ImageConverterUI } from "./ImageConverterUI";

export const metadata: Metadata = buildMetadata({
  path: "/image-converter",
  title: "Image Converter",
  description:
    "Convert images between PNG, JPEG, WebP, AVIF, TIFF, GIF, and SVG. Free, fast, no sign-up. Upload multiple files at once. Runs in your browser.",
  keywords: ["image converter", "PNG to JPEG", "WebP converter", "AVIF converter", "convert image online", "free image converter", "browser image converter"],
});

export default function ImageConverterPage() {
  const tool = getToolBySlug("image-converter");
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const jsonLd = tool ? buildToolJsonLd(tool, baseUrl) : [];
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "All Tools", url: `${baseUrl}/tools` },
    { name: "Image Converter", url: `${baseUrl}/image-converter` },
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
          conversion
        </p>
        <h1 className="text-3xl font-bold">Image Converter</h1>
        <p className="text-lg text-muted-foreground">
          Convert images between PNG, JPEG, WebP, AVIF, TIFF, and GIF — free, in your browser.
        </p>
      </header>

      {/* Browser-only UI — requires Canvas API */}
      <ImageConverterUI />

      {content?.whatIs && (
        <section id="what-is" aria-labelledby="what-is-heading">
          <h2 id="what-is-heading" className="mb-3 text-xl font-semibold">
            What is Image Converter?
          </h2>
          <p className="text-muted-foreground leading-relaxed">{content.whatIs}</p>
        </section>
      )}

      {content?.howToSteps && content.howToSteps.length > 0 && (
        <section id="how-to-use" aria-labelledby="how-to-heading">
          <h2 id="how-to-heading" className="mb-3 text-xl font-semibold">
            How to convert an image
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
          <strong>API:</strong>{" "}
          <code className="font-mono">POST {baseUrl}/api/image-converter</code> — JSON in, JSON out.
          See{" "}
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
  );
}
