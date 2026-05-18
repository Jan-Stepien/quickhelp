import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description: "Privacy policy for quickhelp.dev — how we collect and use data.",
  noindex: true,
});

/* <!-- TODO: review with counsel --> */
export default function PrivacyPage() {
  return (
    <div className="prose mx-auto max-w-3xl space-y-6 py-4">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <section className="space-y-3">
        <h2>1. Who we are</h2>
        <p>
          quickhelp.dev is a free utility-tool site. We do not operate user accounts or
          store personal data on our servers.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Data we collect</h2>
        <p>
          We collect minimal data to operate the site:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Usage analytics</strong> — aggregated, cookieless page-view data via
            Cloudflare Web Analytics. No personally identifiable information is collected.
            Only collected with your consent.
          </li>
          <li>
            <strong>Ad impressions</strong> — Google AdSense may collect data to serve
            personalised ads. Only loaded with your advertising consent. See Google&apos;s
            privacy policy at policies.google.com.
          </li>
          <li>
            <strong>Your preferences</strong> — theme (light/dark) and cookie consent
            choices are stored in your browser&apos;s localStorage and never sent to our
            servers.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. Cookies and local storage</h2>
        <p>
          We use browser localStorage (not cookies) for necessary preferences:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><code>qh-theme</code> — your display theme preference</li>
          <li><code>qh-consent-v1</code> — your cookie consent choices</li>
        </ul>
        <p>
          Google AdSense sets its own cookies (<code>__gads</code>, <code>__gpi</code>)
          when advertising consent is given. See our{" "}
          <a href="/cookies" className="underline underline-offset-2">Cookie Policy</a>{" "}
          for details.
        </p>
      </section>

      <section className="space-y-3">
        <h2>4. Third-party services</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Cloudflare Web Analytics</strong> — privacy-first analytics with no
            cookies and no cross-site tracking. Data processed by Cloudflare Inc.
          </li>
          <li>
            <strong>Google AdSense</strong> — advertising served by Google LLC. Subject to
            Google&apos;s privacy policy and EU user consent policy.
          </li>
          <li>
            <strong>Vercel</strong> — hosting provider. Standard server logs (IP, request
            path, timestamp) retained per Vercel&apos;s data processing terms.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>5. Your rights (GDPR / UK GDPR)</h2>
        <p>If you are in the European Economic Area or UK, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access, correct, or delete personal data we hold about you</li>
          <li>Withdraw consent for advertising or analytics at any time via the cookie manager</li>
          <li>Object to or restrict processing</li>
          <li>Data portability</li>
          <li>Lodge a complaint with your supervisory authority</li>
        </ul>
        <p>
          Because we do not store personal data on our servers, most rights are exercised
          by clearing your browser&apos;s localStorage.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Contact</h2>
        <p>
          For privacy enquiries, email us at{" "}
          <a href="mailto:privacy@quickhelp.dev" className="underline underline-offset-2">
            privacy@quickhelp.dev
          </a>
          .
        </p>
      </section>
    </div>
  );
}
