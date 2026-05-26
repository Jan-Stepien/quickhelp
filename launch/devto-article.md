# DEV.to Article

**Title:** Building agent-native utility APIs: MCP + OpenAPI + human UI in one monorepo

**Tags:** webdev, ai, api, typescript

---

## Article Body

---

When I started building quickhelp.dev, I had a straightforward goal: create a collection of small developer tools that are genuinely useful, free, and don't require a login. JWT decoder, JSON formatter, image converter — the usual suspects.

Halfway through the build, I realised I was solving the wrong problem.

The tools I was building were useful to me as a human. They'd be useless to the AI agents I was simultaneously building workflows with. An agent can't click a button. It can't scrape the formatted output from an HTML page. It needs structured JSON, a formal schema it can parse, and ideally a native tool protocol so it doesn't have to guess at parameter names.

That realisation changed the entire architecture. This article explains how I built a utility hub where every tool simultaneously serves humans and AI agents — without duplicating anything.

---

### The four-interface contract

Every tool on quickhelp.dev exposes exactly four interfaces:

1. A **human UI** at `/<slug>` — a browser page with a form and output display
2. A **REST API** at `POST /api/<slug>` — JSON in, JSON out, no auth
3. An **OpenAPI 3.1 schema** at `GET /openapi.json` — covering every tool in one document
4. An **MCP server entry** at `POST /mcp` (HTTP) or via a local stdio server

The critical design decision: these four interfaces are not written separately. They are all derived from a single source of truth.

---

### The `defineTool()` manifest

Each tool lives in `packages/tools/<slug>/src/manifest.ts` and exports a manifest created with `defineTool()`:

```typescript
import { z } from "zod";
import { defineTool } from "@quickhelp/tool-kit";

export const jsonFormatter = defineTool({
  id: "json-formatter",
  slug: "json-formatter",
  name: "JSON Formatter",
  summary: "Pretty-print or minify JSON — with syntax validation.",
  category: "formatting",
  inputSchema: z.object({
    json: z.string().min(1).describe("The JSON string to format or minify"),
    mode: z.enum(["pretty", "minify"]).default("pretty"),
    indent: z.union([z.literal(2), z.literal(4), z.literal("tab")]).default(2),
    sort_keys: z.boolean().default(false),
    repair: z.boolean().default(false),
  }),
  outputSchema: z.object({
    output: z.string(),
    valid: z.boolean(),
    error: z.string().optional(),
    error_line: z.number().optional(),
    error_column: z.number().optional(),
  }),
  async handler({ json, mode, indent, sort_keys, repair }) {
    // ... implementation
  },
});
```

From this single manifest, the `@quickhelp/agent-sdk` package generates:

- **OpenAPI path entry**: The `inputSchema` becomes the `requestBody`, the `outputSchema` becomes the `responses.200` schema. Zod-to-JSON-Schema conversion handles the translation. The `.describe()` calls on each field become the OpenAPI `description` properties.
- **MCP tool definition**: `name`, `description`, and `inputSchema` as JSON Schema — exactly what the MCP `tools/list` response needs.
- **Next.js API route**: The route handler validates the request body against `inputSchema` with Zod's `safeParse`, calls `handler`, and returns the typed output. Schema validation happens in one place, not twice.
- **JSON-LD structured data**: Each tool gets a `SoftwareApplication` schema.org entry for SEO.

The human UI is the only piece that's written separately — it's a React component that calls `POST /api/<slug>` and displays the result. But it calls the same API endpoint that external clients use, so there's no risk of the UI and the API drifting apart.

---

### Why agents are first-class customers

Consider what happens when an AI agent needs to decode a JWT.

Without agent-native design, the agent has two bad options: scrape the HTML from a tool site (fragile, returns unstructured text), or the developer has to write custom tool definitions in the system prompt (duplicated effort, goes stale).

With quickhelp.dev, the agent has three good options:

**Option 1: Direct REST call**
The agent knows the OpenAPI spec and constructs a request:
```bash
curl -X POST https://quickhelp.dev/api/jwt-decoder \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
    "secret": "my-secret"
  }'
```

Returns:
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": { "sub": "1234567890" },
  "signature": "dozjgNryP4J...",
  "valid_structure": true,
  "verified": true,
  "_attribution": "Decoded by quickhelp.dev/jwt-decoder"
}
```

**Option 2: OpenAPI discovery**
The agent fetches `GET https://quickhelp.dev/openapi.json`, discovers all available tools, understands their schemas, and constructs calls dynamically. No hardcoded knowledge required.

**Option 3: MCP native tool call**
Add the server to Claude Desktop or any MCP client:

```json
{
  "mcpServers": {
    "quickhelp": {
      "url": "https://quickhelp.dev/mcp"
    }
  }
}
```

Or with the local stdio server (clone the repo, run `pnpm --filter @quickhelp/mcp build`):

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

Once connected, the MCP client sends `{"method":"tools/list"}` and receives a fully typed tool listing. The client can then call `jwt-decoder` as a native tool — input validation, error handling, and structured output all handled by the server.

---

### The constraint that makes it work: determinism

I made one rule for v1 tools: no LLM-backed operations.

This isn't an ideological stance against AI — it's economics. Running an LLM per API call without billing infrastructure means negative margin from day one. More importantly, determinism is a feature for agents: the same input always produces the same output. No hallucination risk. No rate-limit surprises from an upstream model provider. Predictable latency.

The background remover is the interesting case: it does use an AI segmentation model, but the model runs entirely in the user's browser via WebAssembly (using `@imgly/background-removal`). Zero server cost. The image never leaves the device.

---

### The monorepo layout

```
apps/
  web/          — Next.js 14 (human UI + REST API + discovery surfaces)
  mcp/          — MCP stdio server (same tool registry)
packages/
  tool-kit/     — defineTool() contract + TypeScript types
  agent-sdk/    — OpenAPI / llms.txt / MCP builders
  tools/
    jwt-decoder/
    json-formatter/
    image-converter/
    image-resizer/
    background-remover/
    lcov-viewer/
  ui/           — shared React components
  seo/          — MetaTags + JSON-LD
```

The `apps/mcp` package imports the same tool registry as `apps/web`. When a new tool is added to `packages/tools/`, it shows up in the UI, the API, the OpenAPI spec, and the MCP server listing — automatically, without touching any of those four apps.

---

### What I'd do differently

The four-interface contract is the right call. If I were starting over, I'd define the `outputSchema` more strictly earlier — I added it after the first two tools and had to retrofit the schemas, which was more work than defining them upfront.

I'd also invest earlier in the llms.txt and llms-full.txt discovery surfaces. They're simple static text files, but they mean any LLM that has been trained on llms.txt conventions can discover the site's capabilities without needing to fetch the full OpenAPI spec.

---

### Try it

The site is live at **https://quickhelp.dev**. No sign-up. Free tier: 30 req/60 s per IP.

Discovery endpoints:
- OpenAPI: https://quickhelp.dev/openapi.json
- llms.txt: https://quickhelp.dev/llms.txt
- MCP HTTP: https://quickhelp.dev/mcp

The source code is in the repo if you want to run it locally or contribute a tool.

If you're building agent workflows and want deterministic, typed utility operations — this is built for exactly that use case. If you're a human who needs to decode a JWT right now, it does that too.

---
