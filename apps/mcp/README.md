# quickhelp-mcp

MCP server for [quickhelp.dev](https://quickhelp.dev) — 15 free, deterministic developer tools available to any MCP-compatible AI agent.

## Tools available

| Tool | What it does |
|---|---|
| `jwt-decoder` | Decode JWT header + payload (optional signature verify) |
| `json-formatter` | Pretty-print, minify, sort, validate, or repair JSON |
| `base64` | Encode/decode Base64 (standard and URL-safe) |
| `image-converter` | Convert between PNG, JPEG, WebP, AVIF, TIFF, GIF, SVG |
| `image-resizer` | Resize images by pixel dimensions or percentage |
| `background-remover` | AI-powered background removal (ONNX Runtime) |
| `hash-generator` | MD5, SHA-1, SHA-256, SHA-512 checksums |
| `uuid-generator` | Generate UUIDs v1/v3/v4/v5/v7 |
| `url-encoder` | Percent-encode / decode URL components |
| `timestamp-converter` | Unix timestamp ↔ human-readable date/time |
| `json-to-csv` | Flatten a JSON array of objects to CSV rows |
| `text-case-converter` | camelCase, snake_case, kebab-case, UPPER_CASE, Title Case |
| `color-converter` | HEX ↔ RGB ↔ HSL ↔ HSV colour conversion |
| `number-base-converter` | Binary, octal, decimal, hexadecimal |
| `lcov-viewer` | Parse and summarise LCOV coverage reports |

All tools are **stateless, free, no auth required**, and respond in <5 s.

---

## Option 1 — Hosted HTTP endpoint (no install)

Any MCP client that supports HTTP transport can use the hosted endpoint directly:

```
POST https://quickhelp.dev/mcp
Content-Type: application/json
```

### Claude Code (CLI)

```bash
claude mcp add --transport http quickhelp https://quickhelp.dev/mcp
```

### Manual JSON-RPC

```bash
# List tools
curl -X POST https://quickhelp.dev/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Call a tool
curl -X POST https://quickhelp.dev/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"uuid-generator","arguments":{"version":"v4","count":3}}}'
```

---

## Option 2 — npx (stdio, no build)

```bash
npx -y quickhelp-mcp
```

### Claude Desktop config

Add to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`):

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

---

## Option 3 — Local build from source

```bash
git clone https://github.com/Jan-Stepien/no_work
cd no_work
pnpm install
pnpm --filter @quickhelp/tool-kit build
pnpm --filter @quickhelp/agent-sdk build
pnpm --filter quickhelp-mcp build
```

### Claude Desktop config (local build)

```json
{
  "mcpServers": {
    "quickhelp": {
      "command": "node",
      "args": ["/absolute/path/to/no_work/apps/mcp/dist/index.js"]
    }
  }
}
```

### Test via stdio

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  | node apps/mcp/dist/index.js
```

---

## Discovery endpoints

```
GET https://quickhelp.dev/openapi.json    # OpenAPI 3.1 — all tools
GET https://quickhelp.dev/llms.txt        # llms.txt discovery
GET https://quickhelp.dev/llms-full.txt   # full per-tool docs
```

## Rate limits

- **Free (anonymous):** 30 requests / 60 s per IP, responses include attribution watermark.
- **Paid tiers:** coming soon — bearer token, higher limits, no watermark.
