import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getToolBySlug, registry } from "@/lib/registry";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { buildMetadata } from "@/lib/metadata";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ad-slots";

export const metadata: Metadata = buildMetadata({
  path: "/lcov-viewer",
  title: "LCOV Coverage Viewer",
  description:
    "View LCOV code coverage reports online. Parse lcov.info files from Jest, Istanbul, Vitest, gcov, and coverage.py — line, function, and branch coverage per file. Free, runs in your browser.",
  keywords: [
    "lcov viewer", "lcov coverage viewer", "view lcov file online", "lcov info file viewer",
    "jest coverage viewer", "istanbul coverage report", "vitest coverage", "code coverage report viewer",
    "lcov parser", "gcov viewer", "coverage.py lcov",
  ],
});

const LcovViewerUI = dynamic(
  () => import("./LcovViewerUI").then((m) => ({ default: m.LcovViewerUI })),
  { ssr: false }
);

export default function LcovViewerPage() {
  const tool = getToolBySlug("lcov-viewer");
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const jsonLd = tool ? buildToolJsonLd(tool, baseUrl) : [];
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "All Tools", url: `${baseUrl}/tools` },
    { name: "LCOV Coverage Viewer", url: `${baseUrl}/lcov-viewer` },
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
          validation
        </p>
        <h1 className="text-3xl font-bold">LCOV Coverage Viewer</h1>
        <p className="text-lg text-muted-foreground">
          Parse lcov.info files from Jest, Istanbul, Vitest, gcov, and coverage.py — line, function, and branch coverage per file. Runs in your browser.
        </p>
      </header>

      <LcovViewerUI />

      <AdSlot slot={AD_SLOTS["tool-mid"]} format="horizontal" className="my-2" />

      {content?.whatIs && (
        <section id="what-is" aria-labelledby="what-is-heading">
          <h2 id="what-is-heading" className="mb-3 text-xl font-semibold">
            What is LCOV Coverage Viewer?
          </h2>
          <p className="text-muted-foreground leading-relaxed">{content.whatIs}</p>
        </section>
      )}

      {content?.howToSteps && content.howToSteps.length > 0 && (
        <section id="how-to-use" aria-labelledby="how-to-heading">
          <h2 id="how-to-heading" className="mb-3 text-xl font-semibold">
            How to view your LCOV report
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
          Processing runs entirely in your browser — your coverage data is never sent to any server.{" "}
          <strong>API:</strong>{" "}
          <code className="font-mono">POST {baseUrl}/api/lcov-viewer</code> — accepts raw LCOV content, returns structured JSON.{" "}
          See <a href="/openapi.json" className="underline underline-offset-2">OpenAPI spec</a>.
        </p>
      </footer>
    </article>
  );
}
