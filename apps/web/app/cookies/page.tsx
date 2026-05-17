"use client";

/* <!-- TODO: review with counsel --> */

import { useConsent } from "@quickhelp/ui";

export default function CookiesPage() {
  const { openManager } = useConsent();

  return (
    <div className="prose mx-auto max-w-3xl space-y-6 py-4">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <section className="space-y-3">
        <h2>What we store</h2>
        <p>
          quickhelp.dev uses browser localStorage (not HTTP cookies) for strictly necessary
          preferences, and third-party cookies only when you give advertising consent.
        </p>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-4 font-medium text-foreground">Key</th>
              <th className="pb-2 pr-4 font-medium text-foreground">Type</th>
              <th className="pb-2 pr-4 font-medium text-foreground">Purpose</th>
              <th className="pb-2 font-medium text-foreground">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">qh-theme</td>
              <td className="py-2 pr-4">localStorage</td>
              <td className="py-2 pr-4">Light/dark theme preference</td>
              <td className="py-2">Necessary</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">qh-consent-v1</td>
              <td className="py-2 pr-4">localStorage</td>
              <td className="py-2 pr-4">Your cookie consent choices</td>
              <td className="py-2">Necessary</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">cf_clearance / beacon</td>
              <td className="py-2 pr-4">Script</td>
              <td className="py-2 pr-4">Cloudflare Web Analytics (cookieless, aggregated)</td>
              <td className="py-2">Analytics</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">__gads, __gpi</td>
              <td className="py-2 pr-4">Cookie</td>
              <td className="py-2 pr-4">Google AdSense — ad personalisation and fraud prevention</td>
              <td className="py-2">Advertising</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2>Managing your preferences</h2>
        <p>
          You can change your cookie preferences at any time. Analytics and advertising
          are only activated after you give consent — and can be revoked at any time.
        </p>
        <button
          onClick={openManager}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity"
        >
          Manage cookie preferences
        </button>
      </section>

      <section className="space-y-3">
        <h2>Browser controls</h2>
        <p>
          You can also block or delete cookies using your browser settings. Deleting
          localStorage will reset your theme and consent preferences.
        </p>
      </section>

      <section className="space-y-3">
        <h2>More information</h2>
        <p>
          See our <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a> for
          full details on what data we process and your rights.
        </p>
      </section>
    </div>
  );
}
