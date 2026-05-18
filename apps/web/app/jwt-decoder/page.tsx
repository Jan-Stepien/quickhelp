import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@quickhelp/seo";
import { buildToolJsonLd } from "@quickhelp/agent-sdk";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { jwtDecoder } from "@quickhelp/tools-jwt-decoder";
import type { Tool } from "@quickhelp/tool-kit";
import { buildMetadata } from "@/lib/metadata";
import { registry } from "@/lib/registry";
import { JwtDecoderUI } from "./JwtDecoderUI";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  path: "/jwt-decoder",
  title: "JWT Decoder",
  description:
    "Decode and verify JSON Web Tokens. Inspect header, payload, and claims. Optionally verify the signature with your secret — all in the browser.",
  keywords: ["JWT", "JSON Web Token", "decode JWT", "JWT verifier", "base64url", "JWT claims", "JWT header", "JWT payload"],
});

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLdItems = buildToolJsonLd(jwtDecoder as unknown as Tool<any, any>, baseUrl);
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "All Tools", url: `${baseUrl}/tools` },
    { name: "JWT Decoder", url: `${baseUrl}/jwt-decoder` },
  ]);
  const content = jwtDecoder.content;

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      {jsonLdItems.map((item, i) => (
        <JsonLd key={i} data={item} />
      ))}
      <JsonLd data={breadcrumb} />

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {jwtDecoder.category}
        </p>
        <h1 className="text-3xl font-bold">JWT Decoder</h1>
        <p className="text-lg text-muted-foreground">{jwtDecoder.summary}</p>
      </header>

      <JwtDecoderUI sampleToken={SAMPLE_TOKEN} />

      {content?.whatIs && (
        <section id="what-is" aria-labelledby="what-is-heading">
          <h2 id="what-is-heading" className="mb-3 text-xl font-semibold">
            What is a JWT Decoder?
          </h2>
          <p className="text-muted-foreground leading-relaxed">{content.whatIs}</p>
        </section>
      )}

      {content?.howToSteps && content.howToSteps.length > 0 && (
        <section id="how-to-use" aria-labelledby="how-to-heading">
          <h2 id="how-to-heading" className="mb-3 text-xl font-semibold">
            How to decode a JWT
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
          <code className="font-mono">POST {baseUrl}/api/jwt-decoder</code> — JSON in, JSON out.
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
