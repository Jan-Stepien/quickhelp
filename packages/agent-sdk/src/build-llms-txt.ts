import type { Tool } from "@no-work/tool-kit";

export function buildLlmsTxt(tools: Tool[], baseUrl = "https://no.work"): string {
  const header = [
    "# Agent-Native Tool Factory",
    "",
    "> A collection of deterministic utility tools. Each tool exposes a REST API at `/api/<slug>`, a human UI at `/<slug>`, and is listed here for agent discovery.",
    "",
    "## Available Tools",
    "",
  ].join("\n");

  const toolEntries = tools.map((tool) => {
    const lines = [
      `### ${tool.name}`,
      "",
      `- **Slug**: \`${tool.slug}\``,
      `- **Category**: ${tool.category}`,
      `- **Summary**: ${tool.summary}`,
      `- **API**: POST ${baseUrl}/api/${tool.slug}`,
      `- **UI**: ${baseUrl}/${tool.slug}`,
    ];

    if (tool.examples.length > 0) {
      const ex = tool.examples[0]!;
      lines.push(
        "",
        `**Example** — ${ex.title}:`,
        "```json",
        `Input:  ${JSON.stringify(ex.input)}`,
        `Output: ${JSON.stringify(ex.output)}`,
        "```"
      );
    }

    return lines.join("\n");
  });

  const footer = [
    "",
    "## Discovery",
    "",
    `- OpenAPI 3.1: ${baseUrl}/openapi.json`,
    `- Sitemap: ${baseUrl}/sitemap.xml`,
    `- MCP endpoint: ${baseUrl}/mcp`,
    "",
    "## Terms",
    "",
    "Free tier: 30 req/min per IP, responses include attribution watermark.",
  ].join("\n");

  return header + toolEntries.join("\n\n") + footer;
}
