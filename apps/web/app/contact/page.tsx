import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/contact",
  title: "Contact",
  description: "Get in touch with the quickhelp.dev team — bug reports, feature suggestions, API questions, or general feedback.",
  keywords: ["contact quickhelp.dev", "support", "feedback", "bug report"],
});

export default function ContactPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Contact", url: `${baseUrl}/contact` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <div className="mx-auto max-w-2xl space-y-8 py-4">
        <header>
          <h1 className="text-3xl font-bold">Contact</h1>
          <p className="mt-2 text-muted-foreground">
            Questions, bug reports, or feature suggestions — we&apos;d love to hear from you.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Email</h2>
          <p className="text-muted-foreground">
            The fastest way to reach us is by email:
          </p>
          <a
            href="mailto:jasiek.stepien@gmail.com"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            jasiek.stepien@gmail.com
          </a>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What to include</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li><strong className="text-foreground">Bug reports:</strong> the tool name, what you input, and what went wrong</li>
            <li><strong className="text-foreground">Feature requests:</strong> what you&apos;d like the tool to do</li>
            <li><strong className="text-foreground">API questions:</strong> your use case and the endpoint you&apos;re calling</li>
            <li><strong className="text-foreground">General:</strong> anything else — we read every message</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Response time</h2>
          <p className="text-sm text-muted-foreground">
            We typically respond within 1–2 business days. For urgent API issues,
            mention &quot;API&quot; in the subject line.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-muted/40 p-5">
          <h2 className="text-base font-semibold">Useful links</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/docs" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">
                API Documentation
              </a>{" "}
              — endpoint reference for all tools
            </li>
            <li>
              <a href="/openapi.json" className="underline underline-offset-2 text-muted-foreground hover:text-foreground font-mono">
                /openapi.json
              </a>{" "}
              — OpenAPI 3.1 spec
            </li>
            <li>
              <a href="/about" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">
                About quickhelp.dev
              </a>{" "}
              — what we build and why
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
