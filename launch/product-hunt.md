# Product Hunt Launch Kit

---

## Tagline (60 chars max)

```
Utility tools with a human UI, REST API, OpenAPI & MCP
```
(55 characters)

Alternative options:
```
Developer tools built for humans and AI agents equally
```
(54 characters)

```
6 dev tools, each with UI + API + OpenAPI + MCP server
```
(55 characters)

---

## Description (260 chars)

```
Free, stateless developer tools — JWT decoder, JSON formatter, image converter, image resizer, background remover, LCOV viewer. Each tool has a human UI, REST API, OpenAPI 3.1 spec, and MCP server entry. No sign-up. Agent-native from day one.
```
(243 characters)

---

## First Comment — Maker Story (500 words)

Hey Product Hunt! Jan here, the builder behind quickhelp.dev.

I started this project out of a specific frustration: every time I reached for a quick developer utility — decoding a JWT to check a claim, reformatting a JSON blob I got from an API, converting an image format — I landed on sites that were either buried in ads, required a login for basic features, or had no API at all. Fine for a one-off human task. Useless if you're trying to automate anything.

Then I started building AI-assisted workflows. Agents hit the same wall harder. They can't click through an ad-heavy UI. They need structured JSON output. They need an OpenAPI spec to know what parameters to send. They need an MCP tool listing so Claude or Cursor can invoke the tool natively without custom prompt engineering.

So I built quickhelp.dev around a single principle: **humans and AI agents are equal first-class customers of every tool**.

Each of the six tools on the site exposes four interfaces simultaneously:

- **Human UI** at `/<slug>` — a clean, fast browser page
- **REST API** at `POST /api/<slug>` — JSON in, JSON out, no auth required
- **OpenAPI 3.1 schema** at `GET /openapi.json` — every tool, machine-readable
- **MCP server entry** at `POST /mcp` — or run the stdio server locally

I put one hard constraint on v1: no LLM-backed tools. Cost-per-call without billing infrastructure means negative margin from day one. Every operation is deterministic — the same input always produces the same output, instantly, for free. That predictability is what makes these tools genuinely useful to agents: no hallucination risk, no per-call spend, no surprises.

The technical side: it's a TypeScript monorepo (Next.js 14, Vercel, pnpm workspaces). Each tool exports a `defineTool()` manifest that auto-generates the API route, the OpenAPI entry, the MCP tool definition, and the JSON-LD for SEO. Adding a new tool is mostly just filling in that manifest and writing the handler.

A few details I'm proud of:

- The **background remover** runs entirely in your browser via WebAssembly (using `@imgly/background-removal`). Your image never leaves your device. It still shows up in the OpenAPI spec and MCP registry for discoverability, but the heavy lifting is client-side.
- The **LCOV coverage viewer** parses `.lcov` files and returns per-file line/function/branch coverage percentages as structured JSON — something CI pipelines can consume directly via the API.
- The **image converter** handles PNG, JPEG, WebP, AVIF, TIFF, GIF, and SVG via sharp, up to 3 MB input, and returns the converted image as base64 with dimensions and file size in the same response.

Free tier is 30 requests per 60 seconds per IP. Responses include a small attribution watermark. Paid keys to strip it are on the roadmap.

I'd love feedback on which tools you'd most want to see added next, and whether the MCP integration is set up in a way that's actually useful to your workflow.

https://quickhelp.dev — try it without signing up.

---

## Gallery Caption Suggestions (5 items)

1. **Homepage** — "Utility tools for humans and agents — each with four interfaces out of the box."
2. **JWT Decoder** — "Decode any JWT instantly: header, payload, signature. Optionally verify with your HMAC secret or PEM public key."
3. **For AI Agents section** — "Every tool is discoverable at /openapi.json, /llms.txt, and /mcp — no custom glue required."
4. **JSON Formatter** — "Pretty-print, minify, sort keys, or auto-repair malformed JSON — with exact line/column error reporting."
5. **OpenAPI spec** — "One OpenAPI 3.1 document covers all six tools — import into Postman, feed to an agent, or use with any OpenAPI client."

---

## Topics / Tags to Select

- Developer Tools
- Productivity
- API
- Artificial Intelligence
- Open Source
- No-Code / Low-Code (for the human UI angle)
- SaaS

---
