import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { registry } from "@/lib/registry";
import type { ToolUseCase } from "@quickhelp/tool-kit";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

type UseCaseWithTool = ToolUseCase & { toolSlug: string; toolName: string };

function getAllUseCases(): UseCaseWithTool[] {
  const result: UseCaseWithTool[] = [];
  for (const tool of registry) {
    for (const uc of tool.content?.useCases ?? []) {
      result.push({ ...uc, toolSlug: tool.slug, toolName: tool.name });
    }
  }
  return result;
}

export function generateStaticParams() {
  return getAllUseCases().map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const uc = getAllUseCases().find((u) => u.slug === slug);
  if (!uc) return {};
  return buildMetadata({
    path: `/use-cases/${slug}`,
    title: uc.title,
    description: uc.intent,
  });
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const uc = getAllUseCases().find((u) => u.slug === slug);
  if (!uc) notFound();

  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Use Cases", url: `${baseUrl}/use-cases` },
    { name: uc.title, url: `${baseUrl}/use-cases/${slug}` },
  ]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: uc.title,
    description: uc.intent,
    url: `${baseUrl}/use-cases/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "quickhelp.dev",
      url: baseUrl,
    },
    mainEntityOfPage: `${baseUrl}/use-cases/${slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <JsonLd data={breadcrumb} />
      <JsonLd data={articleJsonLd} />

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          use case
        </p>
        <h1 className="text-3xl font-bold">{uc.title}</h1>
        <p className="text-lg text-muted-foreground">{uc.intent}</p>
      </header>

      <section id="intro">
        <p className="text-muted-foreground leading-relaxed">{uc.intro}</p>
      </section>

      <section id="steps" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="mb-3 text-xl font-semibold">
          Step-by-step guide
        </h2>
        <ol className="space-y-4 list-decimal list-inside">
          {uc.steps.map((step, i) => (
            <li key={i} className="text-muted-foreground">
              <span className="font-medium text-foreground">{step.name}: </span>
              {step.text}
            </li>
          ))}
        </ol>
      </section>

      {uc.faq && uc.faq.length > 0 && (
        <section id="faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-4 text-xl font-semibold">
            Frequently asked questions
          </h2>
          <dl className="space-y-4">
            {uc.faq.map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <dt className="font-medium">{item.question}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section id="cta" className="rounded-xl border border-border bg-muted/40 p-6 space-y-3">
        <h2 className="text-lg font-semibold">Try it now</h2>
        <p className="text-sm text-muted-foreground">
          Use the {uc.toolName} to complete this task — free, no sign-up, runs in your browser.
        </p>
        <Link
          href={`/${uc.toolSlug}`}
          className="inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          Open {uc.toolName} →
        </Link>
      </section>
    </article>
  );
}
