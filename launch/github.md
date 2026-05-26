# GitHub Repo Polish Checklist

---

## Recommended Repository Description

Paste this into the "About" field (the short description under the repo name on GitHub — 350 char limit):

```
Agent-native developer utility hub — JWT decoder, JSON formatter, image converter, image resizer, background remover, LCOV viewer. Each tool: human UI + REST API + OpenAPI 3.1 + MCP server. Next.js 14, TypeScript monorepo.
```

---

## Topic Tags to Add (8–10)

Go to the repo → gear icon next to "About" → "Topics":

```
mcp
openapi
developer-tools
nextjs
typescript
jwt
json
image-processing
monorepo
api
```

---

## README Sections to Add or Improve

The current README is functional but needs the following sections added or expanded. Use the exact content below.

---

### Section: "Use via MCP" (add after the current "For AI agents" section)

````markdown
## Use via MCP

### HTTP transport (remote, no install)

Add to your MCP client config (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "quickhelp": {
      "url": "https://quickhelp.dev/mcp"
    }
  }
}
```

### Stdio transport (local, after cloning)

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

Build the server first:

```bash
pnpm install
pnpm --filter @quickhelp/tool-kit build
pnpm --filter @quickhelp/agent-sdk build
pnpm --filter @quickhelp/mcp build
```

### MCP tools registered

| Tool name | Description |
|---|---|
| `jwt-decoder` | Decode and verify JSON Web Tokens (HS256, RS256, ES256) |
| `json-formatter` | Pretty-print, minify, sort keys, or repair malformed JSON |
| `image-converter` | Convert images between PNG, JPEG, WebP, AVIF, TIFF, GIF |
| `image-resizer` | Resize, crop, rotate, and flip images |
| `lcov-viewer` | Parse LCOV files and return per-file coverage percentages |

Verify the server is up:

```bash
curl -X POST https://quickhelp.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```
````

---

### Section: "API" (add after "For AI agents" or after "Use via MCP")

````markdown
## API

All tools are available via REST. Base URL: `https://quickhelp.dev`

### JWT Decoder

```bash
curl -X POST https://quickhelp.dev/api/jwt-decoder \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  }'
```

Response:
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 },
  "signature": "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "valid_structure": true,
  "_attribution": "Decoded by quickhelp.dev/jwt-decoder"
}
```

### JSON Formatter

```bash
curl -X POST https://quickhelp.dev/api/json-formatter \
  -H "Content-Type: application/json" \
  -d '{"json":"{\"name\":\"Alice\",\"age\":30}","mode":"pretty","indent":2}'
```

Response:
```json
{
  "output": "{\n  \"name\": \"Alice\",\n  \"age\": 30\n}",
  "valid": true,
  "_attribution": "Formatted by quickhelp.dev/json-formatter"
}
```

### Image Converter

```bash
curl -X POST https://quickhelp.dev/api/image-converter \
  -H "Content-Type: application/json" \
  -d '{
    "image": "<base64-encoded-png>",
    "from": "png",
    "to": "webp"
  }'
```

Response:
```json
{
  "image": "<base64-encoded-webp>",
  "width": 800,
  "height": 600,
  "size": 45231,
  "format": "webp",
  "_attribution": "Converted by quickhelp.dev/image-converter"
}
```

Full OpenAPI 3.1 spec: `GET https://quickhelp.dev/openapi.json`

**Rate limit:** 30 requests per 60 seconds per IP. Free, no sign-up required.
````

---

### Section: "Agent discovery surfaces" (update the existing "For AI agents" section to include llms-full.txt)

````markdown
## For AI agents

```
GET  https://quickhelp.dev/openapi.json     # OpenAPI 3.1 — all tools
GET  https://quickhelp.dev/llms.txt         # llms.txt discovery
GET  https://quickhelp.dev/llms-full.txt    # full content dump for one-shot context loading
POST https://quickhelp.dev/mcp              # MCP HTTP transport (JSON-RPC 2.0)
```
````

---

### Section: "Tools" (update the existing table to include all 6 tools)

```markdown
## Tools

| Tool | UI | API | Description |
|---|---|---|---|
| JWT Decoder | `/jwt-decoder` | `POST /api/jwt-decoder` | Decode header/payload, verify HS256/RS256/ES256 signatures |
| JSON Formatter | `/json-formatter` | `POST /api/json-formatter` | Pretty-print, minify, sort keys, auto-repair |
| Image Converter | `/image-converter` | `POST /api/image-converter` | Convert between PNG/JPEG/WebP/AVIF/TIFF/GIF/SVG |
| Image Resizer | `/image-resizer` | `POST /api/image-resizer` | Resize, crop, rotate, flip (Canvas API, no upload) |
| Background Remover | `/background-remover` | browser-only | AI background removal via WebAssembly (no server) |
| LCOV Viewer | `/lcov-viewer` | `POST /api/lcov-viewer` | Parse .lcov files, return per-file coverage percentages |
```

---

## Should you add CONTRIBUTING.md?

**Yes** — it makes it easier for contributors to add tools and signals that contributions are welcome. Create `CONTRIBUTING.md` at the repo root with the following content:

````markdown
# Contributing to quickhelp.dev

## Adding a new tool

1. Run the tool scaffolder:
   ```bash
   pnpm create-tool <slug>
   ```
   This creates `packages/tools/<slug>/` with a `manifest.ts` stub.

2. Fill in `packages/tools/<slug>/src/manifest.ts`:
   - Set `id`, `slug`, `name`, `summary`, `description`, `category`
   - Define `inputSchema` and `outputSchema` using Zod
   - Implement the `handler` function — must be deterministic, no LLM calls in v1
   - Add at least one `examples` entry

3. Register the tool:
   - Import it in `apps/web/app/lib/registry.ts`
   - Import it in `apps/mcp/src/index.ts`

4. Test:
   ```bash
   pnpm dev
   # Visit http://localhost:3000/<slug>
   # Test the API: POST http://localhost:3000/api/<slug>
   ```

5. Open a PR with a description of what the tool does.

## Tool constraints

- All tools must be **deterministic** — same input, same output, every time
- No LLM-backed operations (cost-per-call without billing infrastructure)
- Handler must complete in under 5 seconds
- No server-side state — tools are stateless
- Browser-only tools (like background remover) are fine — declare them in the manifest and throw from the server-side handler

## Code style

- TypeScript strict mode
- `pnpm lint` must pass
- `pnpm typecheck` must pass
````

---

## Additional polish

- [ ] Add a social preview image (1280x640 px) with the quickhelp.dev logo and tagline — set in repo Settings → Social Preview
- [ ] Pin the repo to your GitHub profile if this is the main project you want to showcase
- [ ] Ensure the `homepage` field in `package.json` (root) is set to `https://quickhelp.dev`
- [ ] Add a GitHub Actions workflow badge to the README if CI is set up
- [ ] Set the repo's "Website" field (in the About section on GitHub) to `https://quickhelp.dev`

---
