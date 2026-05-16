#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const slug = process.argv[2];

if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error("Usage: pnpm create-tool <slug>\nSlug must be lowercase letters, numbers, and hyphens.");
  process.exit(1);
}

const toolDir = join(repoRoot, "packages", "tools", slug);

if (existsSync(toolDir)) {
  console.error(`Tool '${slug}' already exists at ${toolDir}`);
  process.exit(1);
}

const packageName = `@quickhelp/tools-${slug}`;
const name = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

await mkdir(join(toolDir, "src"), { recursive: true });

await writeFile(
  join(toolDir, "package.json"),
  JSON.stringify(
    {
      name: packageName,
      version: "0.0.1",
      private: true,
      type: "module",
      exports: {
        ".": {
          types: "./src/index.ts",
          import: "./src/index.ts",
        },
      },
      scripts: {
        typecheck: "tsc --noEmit",
        build: "echo 'Tool consumed directly from src by Next.js'",
      },
      dependencies: {
        "@quickhelp/tool-kit": "workspace:*",
        zod: "^3.24.2",
      },
      devDependencies: {
        typescript: "^5.7.2",
      },
    },
    null,
    2
  )
);

await writeFile(
  join(toolDir, "src", "manifest.ts"),
  `import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const ${toCamel(slug)} = defineTool({
  id: "${slug}",
  slug: "${slug}",
  name: "${name}",
  summary: "TODO: one-line summary",
  description: "TODO: detailed description",
  category: "other",
  inputSchema: z.object({
    input: z.string().describe("TODO: describe input"),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  examples: [
    {
      title: "Basic example",
      input: { input: "example" },
      output: { output: "result" },
    },
  ],
  handler({ input }) {
    // TODO: implement
    return { output: input };
  },
  schemaOrg: {
    name: "${name}",
    description: "TODO: description",
    url: "https://quickhelp.dev/${slug}",
  },
  content: {
    whatIs: "TODO: what is this tool?",
    howToSteps: [
      { name: "Step 1", text: "TODO: describe step" },
    ],
    faq: [
      { question: "TODO: question?", answer: "TODO: answer" },
    ],
  },
});
`
);

await writeFile(
  join(toolDir, "src", "index.ts"),
  `export { ${toCamel(slug)} } from "./manifest.js";\n`
);

console.log(`\n✓ Created ${packageName} at packages/tools/${slug}/`);
console.log(`
Next steps:
  1. Edit packages/tools/${slug}/src/manifest.ts — fill in summary, description, handler
  2. Add the tool to apps/web/lib/registry.ts and apps/web/package.json
  3. Add the tool to apps/mcp/src/index.ts
  4. Run: pnpm install
`);

function toCamel(slug) {
  const parts = slug.split("-");
  return parts[0] + parts.slice(1).map((p) => p[0].toUpperCase() + p.slice(1)).join("");
}
