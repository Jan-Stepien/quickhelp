import { NextRequest, NextResponse } from "next/server";
import { buildMcpTools } from "@quickhelp/agent-sdk";
import { registry } from "@/lib/registry";

// Node runtime required — sharp (used by image-converter) is a native binary
export const runtime = "nodejs";

const mcpTools = buildMcpTools(registry);

// Redirect browsers/crawlers to the docs page.
// The MCP endpoint is POST-only (JSON-RPC); GET here would otherwise return 405.
export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.redirect(new URL("/docs", req.url), { status: 302 });
}

interface McpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: McpRequest;
  try {
    body = (await req.json()) as McpRequest;
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    );
  }

  const { id, method, params } = body;

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: mcpTools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      },
    });
  }

  if (method === "tools/call") {
    const { name, arguments: args } = (params ?? {}) as {
      name?: string;
      arguments?: Record<string, unknown>;
    };

    const tool = registry.find((t) => t.slug === name);
    if (!tool) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: `Tool '${name}' not found` }],
          isError: true,
        },
      });
    }

    const parsed = tool.inputSchema.safeParse(args ?? {});
    if (!parsed.success) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: `Validation error: ${parsed.error.message}` }],
          isError: true,
        },
      });
    }

    try {
      const result = await tool.handler(parsed.data);
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: message }], isError: true },
      });
    }
  }

  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } },
    { status: 404 }
  );
}
