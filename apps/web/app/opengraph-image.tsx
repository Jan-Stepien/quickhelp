import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "quickhelp.dev — Developer Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
        <div style={{ color: "#6b7280", fontSize: 24, marginBottom: 20, letterSpacing: 2 }}>
          DEVELOPER TOOLS
        </div>
        <div style={{ color: "#ffffff", fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          quickhelp.dev
        </div>
        <div style={{ color: "#9ca3af", fontSize: 32, marginTop: 24, maxWidth: 800 }}>
          Deterministic utility tools for humans and AI agents
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
          {["REST API", "OpenAPI", "MCP", "llms.txt"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                padding: "8px 16px",
                color: "#d1d5db",
                fontSize: 20,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
