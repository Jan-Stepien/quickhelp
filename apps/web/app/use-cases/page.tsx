import type { Metadata } from "next";
import Link from "next/link";
import { registry } from "@/lib/registry";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  path: "/use-cases",
  title: "Use Cases",
  description:
    "Step-by-step guides for common developer tasks — decoding JWTs, converting images, formatting JSON, and removing backgrounds. Free browser tools, no sign-up.",
  keywords: ["developer guides", "use cases", "how to", "JWT", "image converter", "JSON formatter", "background remover"],
});

export default function UseCasesPage() {
  const toolsWithCases = registry
    .map((tool) => ({
      tool,
      cases: tool.content?.useCases ?? [],
    }))
    .filter((t) => t.cases.length > 0);

  const totalCases = toolsWithCases.reduce((sum, t) => sum + t.cases.length, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          guides
        </p>
        <h1 className="text-3xl font-bold">Use Cases</h1>
        <p className="text-lg text-muted-foreground">
          {totalCases} step-by-step guides for common developer tasks — each using a free, browser-based tool.
        </p>
      </header>

      {toolsWithCases.map(({ tool, cases }) => (
        <section key={tool.slug} aria-labelledby={`tool-${tool.slug}`} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 id={`tool-${tool.slug}`} className="text-xl font-semibold">
              <Link href={`/${tool.slug}`} className="hover:underline underline-offset-2">
                {tool.name}
              </Link>
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {cases.length} guides
            </span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {cases.map((uc) => (
              <li key={uc.slug}>
                <Link
                  href={`/use-cases/${uc.slug}`}
                  className="block rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors space-y-1"
                >
                  <p className="text-sm font-medium leading-snug">{uc.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{uc.intent}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
