import type { Tool } from "@quickhelp/tool-kit";
import { zodToJsonSchema } from "@quickhelp/tool-kit";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export function buildMcpTools(tools: Tool[]): McpToolDefinition[] {
  return tools.map((tool) => {
    const schema = zodToJsonSchema(tool.inputSchema);
    return {
      name: tool.slug,
      description: `${tool.summary}\n\nCategory: ${tool.category}`,
      inputSchema: {
        type: "object",
        properties: schema.properties ?? {},
        ...(schema.required ? { required: schema.required } : {}),
      },
    };
  });
}
