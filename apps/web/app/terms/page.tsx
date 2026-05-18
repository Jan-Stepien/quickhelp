import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/terms",
  title: "Terms of Service",
  description: "Terms of service for quickhelp.dev.",
  noindex: true,
});

/* <!-- TODO: review with counsel --> */
export default function TermsPage() {
  return (
    <div className="prose mx-auto max-w-3xl space-y-6 py-4">
      <h1>Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <section className="space-y-3">
        <h2>1. Acceptance</h2>
        <p>
          By using quickhelp.dev you agree to these terms. If you do not agree, please
          stop using the site.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Service description</h2>
        <p>
          quickhelp.dev provides free, stateless utility tools for developers. Tools are
          provided as-is for convenience. We make no guarantee of availability, accuracy,
          or fitness for any particular purpose.
        </p>
      </section>

      <section className="space-y-3">
        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Attempt to circumvent rate limits or abuse the API</li>
          <li>Use the service for illegal purposes</li>
          <li>Scrape or mirror the site without permission</li>
          <li>Introduce malware or attempt to disrupt the service</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. Disclaimers</h2>
        <p>
          The service is provided <strong>&ldquo;as is&rdquo;</strong> without any warranty,
          express or implied. We do not warrant that the service will be error-free,
          uninterrupted, or that results will be accurate.
        </p>
        <p>
          Tools that process data (e.g. JWT decoders, formatters) operate entirely in
          your browser or transiently on our servers. We do not store or log the content
          of your inputs beyond what is necessary to process your request.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, quickhelp.dev and its operators shall
          not be liable for any indirect, incidental, or consequential damages arising
          from your use of the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the service after
          changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a href="mailto:legal@quickhelp.dev" className="underline underline-offset-2">
            legal@quickhelp.dev
          </a>
        </p>
      </section>
    </div>
  );
}
