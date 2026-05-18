import { ImageResponse } from "next/og";
import { getToolBySlug } from "@/lib/registry";

// Node.js runtime required — registry includes image-converter which depends on sharp (Node-only)
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ToolOgImage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  const name = tool?.name ?? "Developer Tool";
  const summary = tool?.summary ?? "Free, deterministic, agent-native.";
  const category = tool?.category ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {category && (
          <div
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: 6,
              padding: "6px 14px",
              color: "#a5b4fc",
              fontSize: 20,
              marginBottom: 24,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {category}
          </div>
        )}
        <div style={{ color: "#ffffff", fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
          {name}
        </div>
        <div style={{ color: "#9ca3af", fontSize: 28, marginTop: 20, maxWidth: 800 }}>
          {summary}
        </div>
        <div style={{ color: "#6b7280", fontSize: 22, marginTop: 40 }}>quickhelp.dev</div>
      </div>
    ),
    { ...size }
  );
}
