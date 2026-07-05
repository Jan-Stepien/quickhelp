# quickhelp.dev — 15 free developer tools, each with a UI, API, and MCP server

> Every tool runs in your browser, exposes a REST API, and is wired into a single MCP server so AI agents and humans get first-class access without any sign-up.

**Live:** [quickhelp.dev](https://quickhelp.dev) · **API:** [quickhelp.dev/openapi.json](https://quickhelp.dev/openapi.json) · **MCP:** [quickhelp.dev/mcp](https://quickhelp.dev/mcp)

---

## Tools

| Tool | UI | API endpoint |
|---|---|---|
| JWT Decoder | [/jwt-decoder](https://quickhelp.dev/jwt-decoder) | `POST /api/jwt-decoder` |
| JSON Formatter | [/json-formatter](https://quickhelp.dev/json-formatter) | `POST /api/json-formatter` |
| Base64 Encoder / Decoder | [/base64](https://quickhelp.dev/base64) | `POST /api/base64` |
| Image Converter | [/image-converter](https://quickhelp.dev/image-converter) | `POST /api/image-converter` |
| Image Resizer | [/image-resizer](https://quickhelp.dev/image-resizer) | `POST /api/image-resizer` |
| Background Remover | [/background-remover](https://quickhelp.dev/background-remover) | `POST /api/background-remover` |
| Hash Generator | [/hash-generator](https://quickhelp.dev/hash-generator) | `POST /api/hash-generator` |
| UUID Generator | [/uuid-generator](https://quickhelp.dev/uuid-generator) | `POST /api/uuid-generator` |
| URL Encoder / Decoder | [/url-encoder](https://quickhelp.dev/url-encoder) | `POST /api/url-encoder` |
| Timestamp Converter | [/timestamp-converter](https://quickhelp.dev/timestamp-converter) | `POST /api/timestamp-converter` |
| JSON to CSV | [/json-to-csv](https://quickhelp.dev/json-to-csv) | `POST /api/json-to-csv` |
| Text Case Converter | [/text-case-converter](https://quickhelp.dev/text-case-converter) | `POST /api/text-case-converter` |
| Color Converter | [/color-converter](https://quickhelp.dev/color-converter) | `POST /api/color-converter` |
| Number Base Converter | [/number-base-converter](https://quickhelp.dev/number-base-converter) | `POST /api/number-base-converter` |
| LCOV Viewer | [/lcov-viewer](https://quickhelp.dev/lcov-viewer) | `POST /api/lcov-viewer` |

---

## Three interfaces, one domain

**Human UI** — browser-based, no sign-up, no upload to a server. Image tools use WebAssembly in your browser; text tools run client-side JS.

**REST API** — every tool is `POST /api/<slug>`, JSON in, JSON out. Free tier: 30 req/60s watermarked. OpenAPI 3.1 spec at `/openapi.json`.

**MCP server** — a single MCP endpoint covers all 15 tools. AI agents (Claude, Cursor, Continue, etc.) can discover and call any tool via the Model Context Protocol.

```
GET  https://quickhelp.dev/openapi.json    # OpenAPI 3.1 — all tools
GET  https://quickhelp.dev/llms.txt        # llms.txt discovery surface
GET  https://quickhelp.dev/llms-full.txt   # full per-tool docs for LLMs
POST https://quickhelp.dev/mcp             # MCP HTTP (JSON-RPC 2.0)
```

---

## Use the MCP server

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "quickhelp": {
      "command": "npx",
      "args": ["-y", "quickhelp-mcp"]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add --transport http quickhelp https://quickhelp.dev/mcp
```

### Hosted HTTP endpoint (any MCP client)

```
POST https://quickhelp.dev/mcp
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

---

## Quick API example

```bash
# Decode a JWT
curl -X POST https://quickhelp.dev/api/jwt-decoder \
  -H 'Content-Type: application/json' \
  -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"}'

# Convert a colour
curl -X POST https://quickhelp.dev/api/color-converter \
  -H 'Content-Type: application/json' \
  -d '{"color":"#FF5733","from":"hex","to":"hsl"}'

# Generate UUIDs
curl -X POST https://quickhelp.dev/api/uuid-generator \
  -H 'Content-Type: application/json' \
  -d '{"version":"v4","count":5}'
```

---

## Repo structure

```
no_work/
├── apps/web/          # Next.js 14 — human UI + REST API + discovery routes
├── apps/mcp/          # Standalone MCP stdio server (same registry)
├── packages/tool-kit/ # defineTool() contract + Zod helpers
├── packages/agent-sdk/# buildOpenAPI(), buildLlmsTxt(), buildMcpTools()
├── packages/ui/       # Shared UI components
├── packages/seo/      # MetaTags + JSON-LD
├── packages/tools/    # One package per tool
└── tooling/           # CLI scaffolder (pnpm create-tool <slug>)
```

## Local development

```bash
pnpm install
pnpm dev          # web app at localhost:3000
```

## Adding a new tool

```bash
pnpm create-tool <slug>
# Fill in packages/tools/<slug>/src/manifest.ts
# Tool auto-appears in UI, API, OpenAPI, llms.txt, and MCP — no extra wiring
```

## Design principles

- **No auth, no database, no LLM calls** — every tool is stateless and finishes in <5s.
- **Privacy-first** — image processing runs in your browser via WebAssembly; nothing is uploaded.
- **Single-domain aggregation** — one `/openapi.json`, one `/mcp`, one `/llms.txt` so agents resolve tool discovery in one request.
- **Free tier, always** — anonymous use is free (watermarked output, 30 req/60s).

---

⭐ If this is useful, a GitHub star helps other developers find it.
