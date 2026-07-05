import { NextRequest, NextResponse } from "next/server";
import { getToolBySlug } from "@/lib/registry";

interface RouteParams {
  params: Promise<{ tool: string }>;
}

// Redirect browsers/crawlers to the human-readable API docs page.
// The actual API is POST-only; GET here would otherwise return 405.
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tool: slug } = await params;
  return NextResponse.redirect(new URL(`/docs/api/${slug}`, req.url), { status: 302 });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return NextResponse.json({ error: `Tool '${slug}' not found` }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = tool.inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await tool.handler(parsed.data);

    if (tool.attribution) {
      const withAttrib = {
        ...(result as Record<string, unknown>),
        _attribution: tool.attribution.text,
      };
      return NextResponse.json(withAttrib);
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
