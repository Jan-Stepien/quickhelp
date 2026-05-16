import type { Tool } from "@quickhelp/tool-kit";
import { zodToOpenAPI } from "@quickhelp/tool-kit";

interface OpenAPIDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, unknown>;
  };
}

export function buildOpenAPI(
  tools: Tool[],
  options: { title?: string; version?: string; description?: string; baseUrl?: string } = {}
): OpenAPIDocument {
  const {
    title = "Agent-Native Tool Factory",
    version = "1.0.0",
    description = "A collection of deterministic utility tools with REST API, OpenAPI schema, and MCP server.",
    baseUrl = "https://quickhelp.dev",
  } = options;

  const paths: Record<string, unknown> = {};

  for (const tool of tools) {
    const inputSchema = zodToOpenAPI(tool.inputSchema);
    const outputSchema = zodToOpenAPI(tool.outputSchema);

    paths[`/api/${tool.slug}`] = {
      post: {
        operationId: tool.id,
        summary: tool.summary,
        description: tool.description,
        tags: [tool.category],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: inputSchema,
              examples: Object.fromEntries(
                tool.examples.map((ex) => [
                  ex.title,
                  { summary: ex.title, value: ex.input },
                ])
              ),
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: outputSchema,
              },
            },
          },
          "400": {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
        externalDocs: {
          url: `${baseUrl}/${tool.slug}`,
          description: `Interactive UI for ${tool.name}`,
        },
      },
    };
  }

  return {
    openapi: "3.1.0",
    info: { title, version, description },
    paths,
    components: { schemas: {} },
  };
}
