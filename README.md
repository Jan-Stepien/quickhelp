# quickhelp.dev — Agent-Native Tool Factory

A monorepo of small, deterministic utility tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry.

**Live at:** [quickhelp.dev](https://quickhelp.dev)

## Tools

| Tool | UI | API |
|---|---|---|
| JWT Decoder | `/jwt-decoder` | `POST /api/jwt-decoder` |
| JSON Formatter | `/json-formatter` | `POST /api/json-formatter` |
| Image Converter | `/image-converter` | `POST /api/image-converter` |

## For AI agents

```
GET  https://quickhelp.dev/openapi.json   # OpenAPI 3.1
GET  https://quickhelp.dev/llms.txt       # llms.txt discovery
POST https://quickhelp.dev/mcp            # MCP HTTP (JSON-RPC 2.0)
```

## MCP — Claude Desktop config

```json
{
  "mcpServers": {
    "quickhelp": {
      "command": "node",
      "args": ["/path/to/no_work/apps/mcp/dist/index.js"]
    }
  }
}
```

Build first: `pnpm --filter @no-work/mcp build`

## Structure

- `apps/web` — Next.js 14 toolhub (human UI + REST API + discovery surfaces)
- `apps/mcp` — MCP stdio server (same registry)
- `packages/tool-kit` — `defineTool()` contract
- `packages/agent-sdk` — OpenAPI / llms.txt / sitemap / MCP builders
- `packages/ui` — shared UI components
- `packages/seo` — MetaTags + JSON-LD
- `packages/analytics` — Cloudflare Web Analytics wrapper
- `packages/tools/*` — individual tools

## Getting started

```bash
pnpm install
pnpm dev        # localhost:3000
```

## Adding a tool

```bash
pnpm create-tool <slug>
# then fill in packages/tools/<slug>/src/manifest.ts
```

## Rate limits

Free tier: 30 requests / 60s per IP. Responses include an attribution watermark. Bearer token bypasses rate limit (paid tiers — coming soon).
