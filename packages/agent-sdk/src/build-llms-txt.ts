import type { Tool } from "@quickhelp/tool-kit";

export interface ExtraRoute {
  path: string;
  title: string;
  summary?: string;
}

export function buildLlmsFullTxt(
  tools: Tool[],
  baseUrl = "https://quickhelp.dev"
): string {
  const header = [
    "# quickhelp.dev — Full Content Dump for AI Agents",
    "",
    "> This document contains the complete content of all tools for one-shot context loading.",
    "> Lightweight discovery: GET /llms.txt",
    "> OpenAPI 3.1: GET /openapi.json",
    "> MCP endpoint: GET /mcp",
    "",
    `Total tools: ${tools.length}`,
    "",
    "---",
    "",
  ].join("\n");

  const toolEntries = tools.map((tool) => {
    const sections: string[] = [
      `## ${tool.name}`,
      "",
      `**Slug**: \`${tool.slug}\``,
      `**Category**: ${tool.category}`,
      `**API**: POST ${baseUrl}/api/${tool.slug}`,
      `**UI**: ${baseUrl}/${tool.slug}`,
      "",
      `### Description`,
      "",
      tool.description,
    ];

    if (tool.content?.whatIs) {
      sections.push("", "### What is it?", "", tool.content.whatIs);
    }

    if (tool.content?.howToSteps && tool.content.howToSteps.length > 0) {
      sections.push("", "### How to use");
      tool.content.howToSteps.forEach((step, i) => {
        sections.push(``, `${i + 1}. **${step.name}**: ${step.text}`);
      });
    }

    if (tool.content?.faq && tool.content.faq.length > 0) {
      sections.push("", "### FAQ");
      tool.content.faq.forEach((item) => {
        sections.push("", `**Q: ${item.question}**`, "", `A: ${item.answer}`);
      });
    }

    if (tool.examples.length > 0) {
      sections.push("", "### Examples");
      tool.examples.forEach((ex) => {
        sections.push(
          "",
          `**${ex.title}**`,
          "```json",
          `Input:  ${JSON.stringify(ex.input, null, 2)}`,
          `Output: ${JSON.stringify(ex.output, null, 2)}`,
          "```"
        );
      });
    }

    if (tool.content?.relatedTools && tool.content.relatedTools.length > 0) {
      sections.push(
        "",
        "### Related tools",
        "",
        tool.content.relatedTools.map((slug) => `- ${baseUrl}/${slug}`).join("\n")
      );
    }

    sections.push("", "---");
    return sections.join("\n");
  });

  return header + toolEntries.join("\n\n");
}

export function buildLlmsTxt(
  tools: Tool[],
  baseUrl = "https://quickhelp.dev",
  extraRoutes: ExtraRoute[] = []
): string {
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

  const extraSection =
    extraRoutes.length > 0
      ? [
          "",
          "## Additional Pages",
          "",
          ...extraRoutes.map(
            (r) =>
              `- [${r.title}](${baseUrl}${r.path})${r.summary ? ` — ${r.summary}` : ""}`
          ),
        ].join("\n")
      : "";

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

  return header + toolEntries.join("\n\n") + extraSection + footer;
}
