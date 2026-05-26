# Show HN: I built a utility hub where every tool is also an MCP server entry and has an OpenAPI spec

**Title:**
Show HN: I built a utility hub where every tool is also an MCP server and has an OpenAPI spec

---

**Body:**

quickhelp.dev is a collection of small, deterministic developer tools — each one exposes four interfaces:

1. **Human UI** — a browser page at `/<slug>` (e.g. `/jwt-decoder`)
2. **REST API** — `POST /api/<slug>`, JSON in, JSON out
3. **OpenAPI 3.1 schema** — `GET /openapi.json` covers every tool
4. **MCP server entry** — `POST /mcp` (HTTP transport) or stdio (`apps/mcp/dist/index.js`)

Current tools: JWT Decoder, JSON Formatter, Image Converter, Image Resizer & Cropper, Background Remover (browser-only, WebAssembly), and LCOV Coverage Viewer.

The design constraint I gave myself: **no LLM-backed tools in v1**. Every operation is deterministic — no per-call cost, no rate-limit surprises, predictable output. That makes the API genuinely useful for agents: an agent that needs to decode a JWT or reformat JSON can call `POST /api/jwt-decoder` and get a structured JSON response every time, for free, without parsing HTML.

Discovery surfaces for agents:
- `GET https://quickhelp.dev/openapi.json` — full OpenAPI 3.1
- `GET https://quickhelp.dev/llms.txt` — lightweight llms.txt
- `GET https://quickhelp.dev/llms-full.txt` — full content dump for one-shot context loading
- `POST https://quickhelp.dev/mcp` — JSON-RPC 2.0 MCP endpoint

Free tier: 30 req/60 s per IP. Responses include an attribution watermark. Paid keys to strip it are coming later; for now everything is free and requires no sign-up.

Stack: Next.js 14, Vercel, TypeScript monorepo with `pnpm` workspaces. Each tool lives in `packages/tools/<slug>` and exports a `defineTool()` manifest that auto-generates the REST route, OpenAPI schema entry, MCP tool definition, and JSON-LD.

Happy to answer questions about the MCP setup, the monorepo structure, or the agent-native design decisions.

https://quickhelp.dev

---

## Anticipated follow-up comment stubs

---

**Q: What's the latency like for an agent calling these over HTTP?**

A: Cold starts on Vercel are under 300 ms for most tools. Warm responses for text tools (JWT, JSON) are typically 50–150 ms end-to-end. The image tools are slower — conversion and resizing depend on sharp/libvips running on the Vercel serverless environment, usually 200–800 ms depending on image size. The MCP HTTP endpoint adds one JSON-RPC envelope round-trip on top of the underlying API call. I haven't optimised for sub-50 ms yet; the priority was correctness and structured output.

---

**Q: Is this actually free? What's the catch?**

A: Free tier is 30 requests per 60 seconds per IP, no sign-up required. The only "catch" is an attribution watermark in the JSON response (an `_attribution` field with a link back to quickhelp.dev). Paid keys to strip the watermark are planned but not launched yet. The background remover and image resizer run in the browser — those never touch my servers at all. I'm covering Vercel hosting costs myself for now; it's low enough that the free tier is sustainable.

---

**Q: Which MCP tools are registered? How do I add this to Claude Desktop?**

A: The MCP server registers five tools: `jwt-decoder`, `json-formatter`, `image-converter`, `image-resizer`, and `lcov-viewer`. (Background remover is browser-only, so it's not in the MCP server.) For Claude Desktop, clone the repo, run `pnpm --filter @quickhelp/mcp build`, then add to `claude_desktop_config.json`:

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

The HTTP MCP endpoint at `https://quickhelp.dev/mcp` is live for clients that support HTTP transport.

---

**Q: Why not just use jq / jwt.io / existing tools?**

A: Those are great for human use. The gap I'm filling is machine-readable, structured, consistent API access. `jwt.io` has no API. `jq` has no OpenAPI spec your agent can discover. The goal is that an AI agent can fetch `openapi.json`, find the tools it needs, and call them without any custom glue. MCP means Claude or any MCP-aware client gets a native tool listing with typed schemas — no prompt engineering required.

---

**Q: What tools are coming next?**

A: Short list: Base64 encoder/decoder, URL encoder/decoder, diff viewer, cron expression explainer, and a color converter. I'm also considering a Unix timestamp converter and a regex tester. The constraint stays the same: deterministic, no LLM cost per call, under 5 seconds. If you have a tool you'd want accessible via MCP or OpenAPI, reply here — I'm building based on actual demand.

---
