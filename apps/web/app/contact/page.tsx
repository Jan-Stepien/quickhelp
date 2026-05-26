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

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Common questions</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">My API call is returning a 400 error.</p>
              <p className="mt-1">
                The most common cause is a missing or incorrect field in the JSON body. Check the
                input schema in the <a href="/docs" className="underline underline-offset-2 hover:text-foreground">API docs</a> or
                in the <a href="/openapi.json" className="underline underline-offset-2 hover:text-foreground font-mono text-xs">/openapi.json</a> spec.
                Include your request body and the tool slug in your email so we can reproduce it quickly.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Is there a rate limit?</p>
              <p className="mt-1">
                There is a generous shared rate limit on the free tier — more than enough for personal
                projects, prototyping, and automated workflows with moderate traffic. If you need higher
                limits or a dedicated allocation, mention your use case in your email and we will figure
                out a solution.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Can I use these tools in a commercial project?</p>
              <p className="mt-1">
                Yes. The tools are free to use — the API, the MCP server, and the web UI — for personal
                and commercial projects alike. See the <a href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms of Service</a> for
                the full details.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">I want to request a new tool.</p>
              <p className="mt-1">
                Send a short description of what the tool should do — one input, one deterministic output — and
                we will consider it for the next release. Tools with a clear API use case (not just a UI feature)
                are prioritised.
              </p>
            </div>
          </div>
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
              <a href="/openapi.json" className="underline underline-offset-2 text-muted-foreground hover:text-foreground font-mono text-xs">
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
