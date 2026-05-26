# Reddit Posts

---

## r/SideProject

**Title:** I built quickhelp.dev — developer utility tools that also expose an OpenAPI spec and MCP server so AI agents can use them too

**Body:**

Been building this on nights and weekends for a few months. The frustration that started it: I needed a JWT decoder with an actual API (not just a browser paste box), and I couldn't find one that was free, had no login wall, and returned structured JSON.

So I built one. And then kept going.

quickhelp.dev currently has six tools:

- **JWT Decoder** — decode header/payload, optionally verify HS256/RS256/ES256 signatures
- **JSON Formatter** — pretty-print, minify, sort keys, auto-repair malformed JSON
- **Image Converter** — PNG, JPEG, WebP, AVIF, TIFF, GIF, SVG → any output format via sharp
- **Image Resizer & Cropper** — resize, crop, rotate, flip; browser UI uses Canvas (no upload)
- **Background Remover** — AI background removal entirely in your browser via WebAssembly
- **LCOV Coverage Viewer** — parse `.lcov` files and get per-file coverage percentages as JSON

Each tool has: a human browser UI, a `POST /api/<slug>` REST endpoint, an entry in `/openapi.json`, and an MCP server tool listing at `/mcp`.

Free, no sign-up, 30 req/60 s per IP. Responses have a small attribution watermark; paid keys to strip it are coming.

The part I find most interesting to build is making the tools useful to AI agents — every tool is discoverable via `GET /openapi.json` and `GET /llms.txt`, and a Claude Desktop config snippet is in the README.

Happy to answer questions about the tech stack (TypeScript monorepo, Next.js 14, Vercel) or the MCP setup.

https://quickhelp.dev

---

## r/webdev

**Title:** I built a developer tool hub where every tool simultaneously exposes a human UI, REST API, OpenAPI 3.1 spec, and MCP server entry — here's how the monorepo is structured

**Body:**

I've been thinking about what it means to build a utility API that's genuinely useful to both humans and AI agents, and I ended up building quickhelp.dev to explore the idea.

The core architecture decision: every tool is defined in a single `defineTool()` manifest that auto-generates all four interfaces. No duplication.

```ts
// packages/tools/jwt-decoder/src/manifest.ts
export const jwtDecoder = defineTool({
  id: "jwt-decoder",
  slug: "jwt-decoder",
  name: "JWT Decoder",
  category: "encoding",
  inputSchema: z.object({
    token: z.string().min(10),
    secret: z.string().optional(),
    algorithm: z.enum(["HS256", "RS256", "ES256", ...]).default("HS256"),
  }),
  outputSchema: z.object({
    header: z.record(z.unknown()),
    payload: z.record(z.unknown()),
    signature: z.string(),
    valid_structure: z.boolean(),
    verified: z.boolean().optional(),
  }),
  async handler({ token, secret, algorithm }) { ... },
});
```

From that manifest, the monorepo auto-generates:

- A Next.js API route at `POST /api/jwt-decoder`
- An entry in the aggregated `GET /openapi.json` (OpenAPI 3.1)
- An MCP tool definition (served at `POST /mcp` or via the stdio server in `apps/mcp/`)
- JSON-LD structured data for SEO

Discovery surfaces for agents:
- `GET https://quickhelp.dev/openapi.json`
- `GET https://quickhelp.dev/llms.txt`
- `GET https://quickhelp.dev/llms-full.txt`
- `POST https://quickhelp.dev/mcp` (JSON-RPC 2.0, MCP HTTP transport)

Current tools: JWT Decoder, JSON Formatter, Image Converter, Image Resizer & Cropper, Background Remover (browser-only WebAssembly), LCOV Coverage Viewer.

Stack: Next.js 14, pnpm workspaces, TypeScript, Zod for schema validation, sharp for image processing, jose for JWT crypto, `@imgly/background-removal` for the WASM background removal.

Free, no sign-up: https://quickhelp.dev

---

## r/selfhosted

**Title:** quickhelp.dev — free developer tool API (JWT decoder, JSON formatter, image converter, etc.) you can call from scripts or self-hosted agents

**Body:**

Not self-hosted in the sense that you run it yourself (though the repo is open and you can), but it's a free, no-auth REST API for common developer tasks that might be useful if you're running self-hosted AI agents or automation pipelines.

Current tools available via API:

| Tool | Endpoint | What it does |
|---|---|---|
| JWT Decoder | `POST /api/jwt-decoder` | Decode header/payload, verify HS256/RS256/ES256 |
| JSON Formatter | `POST /api/json-formatter` | Pretty-print, minify, sort keys, repair |
| Image Converter | `POST /api/image-converter` | Convert between PNG/JPEG/WebP/AVIF/TIFF/GIF |
| Image Resizer | `POST /api/image-resizer` | Resize, crop, rotate, flip images |
| LCOV Viewer | `POST /api/lcov-viewer` | Parse .lcov files, return per-file coverage % |

All return structured JSON. Full OpenAPI 3.1 spec at `GET https://quickhelp.dev/openapi.json` — import it into your agent, your HTTP client, or Postman.

Example call:

```bash
curl -X POST https://quickhelp.dev/api/json-formatter \
  -H "Content-Type: application/json" \
  -d '{"json":"{\"name\":\"Alice\",\"age\":30}","mode":"pretty","indent":2}'
```

Rate limit: 30 req/60 s per IP, free, no sign-up. Responses include a small `_attribution` field.

The site also exposes an MCP endpoint at `https://quickhelp.dev/mcp` if you're running MCP-aware agents (Claude, Cursor, etc.).

If the rate limit is an issue, the source is available and you could run it yourself on Vercel or any Node.js host.

https://quickhelp.dev

---

## r/programming

**Title:** Agent-native API design: making every tool discoverable via OpenAPI, llms.txt, and MCP from a single manifest definition

**Body:**

I've been thinking about what "agent-native" actually means in practice, beyond the buzzword. I built quickhelp.dev as a working answer to that question, and I want to share the architectural decision that made it possible.

The core insight: an AI agent needs three things that most APIs don't provide together:

1. **Machine-readable schema discovery** — not just docs, but a formal OpenAPI spec the agent can parse to understand what parameters a tool takes and what it returns
2. **Structured, predictable output** — JSON with typed fields, not HTML to scrape or prose to parse
3. **Native tool protocol support** — MCP (Model Context Protocol) so clients like Claude get a proper tool listing with validated input schemas, not a "here's a curl example, figure it out" prompt

The solution was a `defineTool()` contract that every tool must satisfy:

```ts
interface ToolManifest<TInput, TOutput> {
  id: string;
  slug: string;
  name: string;
  category: string;
  inputSchema: ZodSchema<TInput>;   // becomes OpenAPI + MCP inputSchema
  outputSchema: ZodSchema<TOutput>; // becomes OpenAPI response schema
  handler: (input: TInput) => Promise<TOutput>;
  examples: Array<{ title: string; input: TInput; output: TOutput }>;
}
```

From that single definition, a build-time agent-sdk generates:

- The OpenAPI 3.1 path entry (input schema → `requestBody`, output schema → `responses.200`)
- The MCP tool definition (`name`, `description`, `inputSchema` as JSON Schema)
- The `llms.txt` and `llms-full.txt` discovery documents
- The Next.js API route handler (validates input with Zod, calls handler, serialises output)
- JSON-LD structured data

The result: adding a new tool requires writing exactly one manifest file. The four interfaces (human UI, REST API, OpenAPI, MCP) are derived automatically. No interface drift between the docs and the implementation — the schema IS the implementation.

The hard constraint I set: no LLMs in v1 tools. Every tool is deterministic. This makes the API genuinely reliable for agents: same input → same output, no per-call spend, no hallucination risk.

Currently live: JWT Decoder, JSON Formatter, Image Converter, Image Resizer, Background Remover (browser-only WASM), LCOV Viewer.

https://quickhelp.dev — OpenAPI at https://quickhelp.dev/openapi.json

---
