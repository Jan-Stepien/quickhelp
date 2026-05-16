import Link from "next/link";
import { registry } from "@/lib/registry";
import type { Category } from "@quickhelp/tool-kit";

export const metadata = {
  title: "All Tools",
  description: "Browse all utility tools available on quickhelp.dev.",
};

export default function ToolsPage() {
  const byCategory = registry.reduce<Record<string, typeof registry>>((acc, tool) => {
    const cat = tool.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(tool);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort() as Category[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All tools</h1>
        <p className="mt-1 text-gray-600">{registry.length} tools available</p>
      </div>

      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {cat}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byCategory[cat]!.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="block rounded-lg border bg-white p-4 hover:border-gray-400"
              >
                <div className="font-medium text-gray-900">{tool.name}</div>
                <div className="mt-1 text-sm text-gray-600">{tool.summary}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
