import type { Tool } from "@quickhelp/tool-kit";
import { manifestToJsonLd } from "@quickhelp/tool-kit";

export function buildToolJsonLd(tool: Tool, baseUrl = "https://quickhelp.dev"): Record<string, unknown>[] {
  return manifestToJsonLd(tool, baseUrl);
}
