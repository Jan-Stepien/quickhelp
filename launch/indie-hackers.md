# Indie Hackers Launch Post

**Title:** I shipped quickhelp.dev — a utility hub where every tool has a human UI, a REST API, an OpenAPI spec, and an MCP server entry

---

**Body:**

I've been building web apps for a while, and I kept hitting the same wall: I'd reach for a one-off developer tool — decode a JWT, reformat some JSON, convert an image — and end up on a site that was either ad-heavy, required a login, or had no API. And then, as I started building more AI-assisted tooling, I realised none of those sites were useful to my agents either. They were built purely for humans clicking around.

That frustration turned into quickhelp.dev.

**The idea**

One site. Small, deterministic tools. Each tool exposes four interfaces simultaneously: a human-friendly browser UI, a REST API, an OpenAPI 3.1 schema, and an MCP server entry. The design principle is that humans and AI agents are equal first-class customers.

I gave myself one hard constraint for v1: no LLM-backed tools. Cost-per-call without billing infrastructure means negative margin from day one. Every operation had to be deterministic — the same input always produces the same output, no API keys, no per-call spend.

**The build**

The monorepo is TypeScript with pnpm workspaces. Each tool lives in `packages/tools/<slug>` and exports a `defineTool()` manifest. That single manifest auto-generates:

- The Next.js API route (`POST /api/<slug>`)
- The OpenAPI schema entry (aggregated at `/openapi.json`)
- The MCP tool definition (served at `/mcp` or via stdio)
- JSON-LD structured data for SEO

It took longer than I expected to get the four-interface contract right, but now adding a new tool is mostly filling in a manifest file and writing the handler function. The last tool I added — the LCOV coverage viewer — took about two hours from zero to deployed.

**The agent-native angle**

This is the part I find most interesting. Most utility sites are built for humans and grudgingly expose an API later. I flipped that: I built the machine-readable surfaces first, then wrapped a human UI around them.

The site publishes `GET /llms.txt`, `GET /llms-full.txt`, and `GET /openapi.json`. Any MCP-aware client (Claude, Cursor, etc.) can add the server via the HTTP endpoint at `https://quickhelp.dev/mcp` or by running the local stdio server from the repo. Once connected, the agent gets native tool listings with fully typed input/output schemas — no prompt engineering, no HTML scraping.

**Current state**

Six tools live: JWT Decoder, JSON Formatter, Image Converter, Image Resizer & Cropper, Background Remover (browser-only, runs via WebAssembly — your image never leaves your device), and LCOV Coverage Viewer.

Free tier: 30 req/60 s per IP, no sign-up. Responses include a small attribution watermark. Paid keys to strip it are on the roadmap; for now everything is free.

Deployed on Vercel. Covering costs myself. Revenue is zero. The goal right now is to validate whether "agent-native utility hub" is a distribution advantage as MCP adoption grows — and to keep shipping tools.

If you've wanted a developer tool with a real API and an OpenAPI spec, I'd love your feedback.

https://quickhelp.dev

---
