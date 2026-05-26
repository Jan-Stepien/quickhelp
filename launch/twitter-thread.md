# X / Twitter Thread

---

**1/13**
I built quickhelp.dev — a utility hub where every tool has four interfaces at once: human UI, REST API, OpenAPI 3.1 spec, and MCP server entry.

Free. No sign-up. Built for humans and AI agents equally.

Here's how it works 🧵

---

**2/13**
The six tools live at the site right now:

• JWT Decoder
• JSON Formatter
• Image Converter (PNG/JPEG/WebP/AVIF/TIFF/GIF/SVG)
• Image Resizer & Cropper
• Background Remover (runs in your browser, no upload)
• LCOV Coverage Viewer

All free, all stateless, all deterministic.

---

**3/13**
Interface #1: the human UI.

Each tool gets a clean browser page at `/<slug>`.

Paste your JWT → decoded header and payload instantly.
Drop an image → converted or resized in seconds.
Upload an .lcov file → per-file coverage percentages.

No ads, no login wall.
quickhelp.dev/jwt-decoder

---

**4/13**
Interface #2: REST API.

Every tool is callable at `POST /api/<slug>`.

JSON in, JSON out. No auth required. Same logic as the UI — not a wrapper, the exact same handler.

```bash
curl -X POST https://quickhelp.dev/api/jwt-decoder \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGci..."}'
```

---

**5/13**
Interface #3: OpenAPI 3.1 schema.

One document covers every tool:
GET https://quickhelp.dev/openapi.json

Full request/response schemas, examples, error shapes. Import it into Postman, Insomnia, or feed it to an agent as context. It's generated from the same Zod schemas that validate the actual API.

---

**6/13**
Interface #4: MCP server.

POST https://quickhelp.dev/mcp is a live MCP HTTP endpoint (JSON-RPC 2.0).

Or clone the repo, build the stdio server, and add it to Claude Desktop:

```json
{
  "mcpServers": {
    "quickhelp": {
      "command": "node",
      "args": ["/path/to/apps/mcp/dist/index.js"]
    }
  }
}
```

---

**7/13**
Why does the MCP integration matter?

Once connected, Claude (or any MCP client) gets a native tool listing with fully typed input schemas.

Ask Claude to decode a JWT → it calls jwt-decoder directly.
Ask it to reformat JSON → json-formatter.

No custom prompt, no HTML scraping, typed outputs.

---

**8/13**
Agent discovery surfaces (beyond MCP):

GET /llms.txt — lightweight discovery doc
GET /llms-full.txt — full content dump for one-shot context loading
GET /openapi.json — full OpenAPI 3.1

Any agent that knows how to consume llms.txt or OpenAPI can find and use these tools automatically.

---

**9/13**
One hard design constraint I set for v1:

No LLM-backed tools.

Cost-per-call without billing = negative margin from day one. Every operation is deterministic. Same input → same output, always.

That makes these genuinely reliable for agents. No hallucination risk, no per-call spend, no surprises.

---

**10/13**
The background remover is the interesting exception.

It uses an AI model — but the model runs entirely in YOUR browser via WebAssembly (@imgly/background-removal).

Your image never leaves your device. Zero server cost. Still shows up in /openapi.json for discoverability.

---

**11/13**
The monorepo architecture:

Each tool exports a single `defineTool()` manifest.

From that one file the build auto-generates: the API route, the OpenAPI entry, the MCP tool definition, and the JSON-LD.

Adding a new tool is mostly filling in a manifest and writing a handler. Last one took ~2 hours.

---

**12/13**
Free tier: 30 req / 60 s per IP.

Responses include a small attribution watermark (`_attribution` field).

No sign-up, no API key for basic use. Paid keys to strip the watermark are on the roadmap — nothing to buy yet.

---

**13/13**
If you're building AI agents and need deterministic utilities callable via OpenAPI or MCP — give it a try.

If you're a human who just needs to decode a JWT right now — it does that too.

https://quickhelp.dev

OpenAPI: https://quickhelp.dev/openapi.json
llms.txt: https://quickhelp.dev/llms.txt

---
