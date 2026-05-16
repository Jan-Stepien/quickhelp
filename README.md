# Agent-Native Tool Factory

A monorepo of small, deterministic utility tools — each with a human UI, REST API, OpenAPI schema, and MCP server entry.

## Structure

- `apps/web` — Next.js 14 toolhub (human UI + REST API + discovery surfaces)
- `apps/mcp` — MCP server (same registry, Cloudflare Worker)
- `packages/tool-kit` — `defineTool()` contract
- `packages/agent-sdk` — OpenAPI / llms.txt / MCP builders
- `packages/ui` — shared UI components
- `packages/seo` — MetaTags + JSON-LD
- `packages/analytics` — Cloudflare Web Analytics wrapper
- `packages/tools/*` — individual tools

## Getting started

```bash
pnpm install
pnpm dev
```

## Adding a tool

```bash
pnpm create-tool <slug>
```
