#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { buildMcpTools } from "@quickhelp/agent-sdk";
import type { Tool } from "@quickhelp/tool-kit";
import { jwtDecoder } from "@quickhelp/tools-jwt-decoder";
import { jsonFormatter } from "@quickhelp/tools-json-formatter";
import { imageConverter } from "@quickhelp/tools-image-converter";
import { imageResizer } from "@quickhelp/tools-image-resizer";
import { lcovViewer } from "@quickhelp/tools-lcov-viewer";
import { base64 } from "@quickhelp/tools-base64";
import { hashGenerator } from "@quickhelp/tools-hash-generator";
import { urlEncoder } from "@quickhelp/tools-url-encoder";
import { timestampConverter } from "@quickhelp/tools-timestamp-converter";
import { uuidGenerator } from "@quickhelp/tools-uuid-generator";
import { textCaseConverter } from "@quickhelp/tools-text-case-converter";
import { jsonToCsv } from "@quickhelp/tools-json-to-csv";
import { colorConverter } from "@quickhelp/tools-color-converter";
import { numberBaseConverter } from "@quickhelp/tools-number-base-converter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Tool<any, any>[] = [jwtDecoder, jsonFormatter, imageConverter, imageResizer, lcovViewer, base64, hashGenerator, urlEncoder, timestampConverter, uuidGenerator, textCaseConverter, jsonToCsv, colorConverter, numberBaseConverter];

const server = new Server(
  { name: "quickhelp-mcp", version: "0.0.1" },
  { capabilities: { tools: {} } }
);

const mcpTools = buildMcpTools(registry);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: mcpTools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = registry.find((t) => t.slug === name);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Tool '${name}' not found` }],
      isError: true,
    };
  }

  const parsed = tool.inputSchema.safeParse(args);
  if (!parsed.success) {
    return {
      content: [{ type: "text", text: `Validation error: ${parsed.error.message}` }],
      isError: true,
    };
  }

  try {
    const result = await tool.handler(parsed.data);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { content: [{ type: "text", text: message }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
