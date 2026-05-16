import type { Tool } from "@no-work/tool-kit";
import { manifestToJsonLd } from "@no-work/tool-kit";

export function buildToolJsonLd(tool: Tool, baseUrl = "https://no.work"): Record<string, unknown>[] {
  return manifestToJsonLd(tool, baseUrl);
}
