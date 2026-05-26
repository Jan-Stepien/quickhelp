# MCP Registry Submission Punch List

---

## MCP server config for quickhelp.dev

### HTTP transport (for registries and remote clients)

```json
{
  "mcpServers": {
    "quickhelp": {
      "url": "https://quickhelp.dev/mcp"
    }
  }
}
```

### Stdio transport (local, after cloning the repo)

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

Build first:
```bash
git clone <repo-url>
pnpm install
pnpm --filter @quickhelp/tool-kit build
pnpm --filter @quickhelp/agent-sdk build
pnpm --filter @quickhelp/mcp build
```

---

## 1. Smithery (smithery.ai)

**Submission URL:** https://smithery.ai/new

**How to submit:**

1. Go to https://smithery.ai/new
2. Sign in with GitHub
3. Select "Add a server"
4. Fill in the following fields:

| Field | Value |
|---|---|
| Name | quickhelp |
| Display name | quickhelp.dev |
| Description | Free developer utilities (JWT decoder, JSON formatter, image converter, image resizer, LCOV viewer) via MCP. Deterministic, stateless, no auth. OpenAPI 3.1 at https://quickhelp.dev/openapi.json. |
| GitHub repository | [your public repo URL] |
| Homepage | https://quickhelp.dev |
| Transport | HTTP (Streamable HTTP) |
| Server URL | https://quickhelp.dev/mcp |

**MCP config snippet to paste into Smithery:**
```json
{
  "mcpServers": {
    "quickhelp": {
      "url": "https://quickhelp.dev/mcp"
    }
  }
}
```

**Tools the server exposes:**
- `jwt-decoder` — Decode and verify JSON Web Tokens (header, payload, signature, optional HS256/RS256/ES256 verification)
- `json-formatter` — Pretty-print or minify JSON with syntax validation, key sorting, and auto-repair
- `image-converter` — Convert images between PNG, JPEG, WebP, AVIF, TIFF, and GIF (base64 in/out, max 3 MB)
- `image-resizer` — Resize, crop, rotate, and flip images (base64 in/out, PNG/JPEG/WebP output)
- `lcov-viewer` — Parse LCOV coverage files and return per-file line/function/branch coverage percentages

**What fields to fill:**
- All fields above are required
- Add a README to the GitHub repo with a `## MCP` section (Smithery pulls this for the listing page)
- Smithery may auto-run `tools/list` against your endpoint to verify it responds correctly — test this first:

```bash
curl -X POST https://quickhelp.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Expected approval time:** 1–5 business days (manual review by Smithery team)
**Priority:** High — Smithery is the primary MCP discovery registry as of mid-2025

---

## 2. Glama (glama.ai)

**Submission URL:** https://glama.ai/mcp/servers/new

**How to submit:**

1. Go to https://glama.ai/mcp/servers
2. Click "Submit a server" or "Add your MCP server"
3. Sign in (GitHub OAuth or email)
4. Fill in:

| Field | Value |
|---|---|
| Server name | quickhelp.dev |
| GitHub URL | [your public repo URL] |
| Homepage | https://quickhelp.dev |
| Short description | Deterministic developer utilities via MCP — JWT decoder, JSON formatter, image converter, image resizer, LCOV viewer. Free, no auth, OpenAPI 3.1 at /openapi.json. |
| Transport type | HTTP |
| Endpoint | https://quickhelp.dev/mcp |
| Category | Developer Tools / Utilities |
| License | [your license] |

**MCP config snippet for Glama listing:**
```json
{
  "mcpServers": {
    "quickhelp": {
      "url": "https://quickhelp.dev/mcp"
    }
  }
}
```

**Glama-specific notes:**
- Glama indexes the GitHub repo README — make sure the `## MCP` section in the README has the config snippet
- Glama may automatically crawl `tools/list` to populate the tool descriptions on the listing page
- The listing shows tool names and descriptions pulled from the MCP `tools/list` response; verify your tool `description` fields are clear and concise

**Test your endpoint before submitting:**
```bash
curl -X POST https://quickhelp.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Expected response structure:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "jwt-decoder",
        "description": "Decode and verify JSON Web Tokens...",
        "inputSchema": { ... }
      }
    ]
  }
}
```

**Expected approval time:** 2–7 business days
**Priority:** High

---

## 3. mcp.run

**Submission URL:** https://www.mcp.run/publish (or https://www.mcp.run/servers/new — check current URL)

**How to submit:**

1. Go to https://www.mcp.run
2. Sign in or create an account
3. Navigate to "Publish" or "Add a server"
4. Fill in:

| Field | Value |
|---|---|
| Server name | quickhelp |
| Display name | quickhelp.dev |
| Description | Six deterministic developer utilities (JWT decoder, JSON formatter, image converter, image resizer, LCOV viewer, background remover) accessible via MCP HTTP transport. Free, stateless, no API key required. Fully typed with OpenAPI 3.1 and llms.txt discovery. |
| Endpoint URL | https://quickhelp.dev/mcp |
| Homepage | https://quickhelp.dev |
| Tags | developer-tools, jwt, json, image, utility, free |

**MCP config snippet for mcp.run listing:**
```json
{
  "mcpServers": {
    "quickhelp": {
      "url": "https://quickhelp.dev/mcp"
    }
  }
}
```

**mcp.run-specific notes:**
- mcp.run may require the server to support the MCP `initialize` handshake as well as `tools/list` — test both:

```bash
# Test initialize
curl -X POST https://quickhelp.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.0.1"}}}'

# Test tools/list
curl -X POST https://quickhelp.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

- If mcp.run requires a server manifest file in the repo, create `mcp.json` at the repo root:

```json
{
  "name": "quickhelp",
  "version": "1.0.0",
  "description": "Deterministic developer utilities via MCP HTTP transport",
  "homepage": "https://quickhelp.dev",
  "endpoint": "https://quickhelp.dev/mcp",
  "transport": "http"
}
```

**Expected approval time:** 3–10 business days
**Priority:** Medium (mcp.run is newer; Smithery and Glama have more traction as of launch)

---

## Pre-submission checklist (all registries)

- [ ] `POST https://quickhelp.dev/mcp` with `tools/list` returns a valid JSON-RPC 2.0 response
- [ ] `POST https://quickhelp.dev/mcp` with `initialize` returns a valid response (if supported)
- [ ] GitHub repo is public (most registries require a public source link)
- [ ] README has a `## MCP` or `## Use via MCP` section with the config snippet
- [ ] Tool descriptions in `defineTool()` manifests are clear, specific, and under 120 characters each
- [ ] `GET https://quickhelp.dev/openapi.json` returns a valid OpenAPI 3.1 document

---
