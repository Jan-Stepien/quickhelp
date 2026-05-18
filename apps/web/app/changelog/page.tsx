import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@quickhelp/tool-kit";
import { JsonLd } from "@quickhelp/seo";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  path: "/changelog",
  title: "Changelog",
  description: "What's new on quickhelp.dev — new tools, improvements, and fixes.",
  keywords: ["changelog", "updates", "new tools", "quickhelp.dev updates"],
});

interface ChangelogEntry {
  date: string;
  version?: string;
  items: { type: "new" | "fix" | "improved"; text: string }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-05-18",
    items: [
      { type: "new", text: "Background Remover — AI-powered, runs entirely in browser via WebAssembly" },
      { type: "new", text: "SSR content shell on all tool pages — AI crawlers can now read whatIs/howToSteps/FAQ" },
      { type: "new", text: "/llms-full.txt — comprehensive AI context dump for one-shot loading" },
      { type: "new", text: "RSL 1.0 license declaration at /.well-known/rsl.xml" },
      { type: "new", text: "Explicit AI crawler allow-list in robots.txt (GPTBot, ClaudeBot, PerplexityBot, and 5 more)" },
      { type: "improved", text: "robots.txt — added AI crawler allow-list; all bots explicitly welcome" },
      { type: "improved", text: "Sitemap — added changefreq, per-URL priority, compare/* pairs, legal pages" },
      { type: "improved", text: "JSON-LD — removed deprecated HowTo schema; added Organization, WebSite, BreadcrumbList, CollectionPage builders" },
      { type: "improved", text: "Metadata — canonical URLs, OpenGraph, Twitter cards, and PWA manifest on all pages" },
      { type: "improved", text: "Security headers — HSTS, CSP, Referrer-Policy, Permissions-Policy, X-Robots-Tag on /api/*" },
    ],
  },
  {
    date: "2026-05-10",
    items: [
      { type: "new", text: "Image Converter — PNG, JPEG, WebP, AVIF, TIFF, GIF, SVG conversion in browser" },
      { type: "new", text: "/compare/[a]-vs-[b] comparison pages — auto-generated from relatedTools" },
      { type: "new", text: "/convert/[from]-to-[to] programmatic conversion pages" },
    ],
  },
  {
    date: "2026-05-01",
    items: [
      { type: "new", text: "JWT Decoder — decode header, payload, claims; optional signature verification" },
      { type: "new", text: "JSON Formatter — pretty-print, minify, sort keys, validate" },
      { type: "new", text: "OpenAPI 3.1 spec at /openapi.json" },
      { type: "new", text: "llms.txt discovery at /llms.txt" },
      { type: "new", text: "MCP server endpoint at /mcp" },
    ],
  },
];

const TYPE_LABELS: Record<"new" | "fix" | "improved", { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  fix: { label: "Fix", cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  improved: { label: "Improved", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
};

export default function ChangelogPage() {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://quickhelp.dev";
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Changelog", url: `${baseUrl}/changelog` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <div className="mx-auto max-w-3xl space-y-10 py-4">
        <header>
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="mt-2 text-muted-foreground">
            New tools, improvements, and fixes on quickhelp.dev.
          </p>
        </header>

        {CHANGELOG.map((entry) => (
          <section key={entry.date} className="space-y-3">
            <div className="flex items-center gap-3">
              <time
                dateTime={entry.date}
                className="text-sm font-mono font-semibold text-muted-foreground"
              >
                {entry.date}
              </time>
              {entry.version && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {entry.version}
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {entry.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span
                    className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium shrink-0 ${TYPE_LABELS[item.type].cls}`}
                  >
                    {TYPE_LABELS[item.type].label}
                  </span>
                  <span className="text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
