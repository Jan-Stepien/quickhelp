# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Agent-Native Tool Factory

## What This Repo Is

A monorepo factory for building an **AI-agent-native utility network**: many small deterministic tools (JWT decoder, JSON formatter, PNG→SVG, timezone converter, etc.) under one domain. Each tool exposes four interfaces: human UI, REST API, OpenAPI schema, and MCP server entry.

The moat is **single-domain aggregation of discovery surfaces** — one `/openapi.json`, one `/llms.txt`, one MCP endpoint, one schema.org graph. Agents resolve "which service does X" against these surfaces. Splitting into multiple apps fragments authority and discoverability.

## Architecture Decisions (locked)

- **Single Next.js 14 app** (`apps/web`), one domain. Tool logic lives in `packages/tools/<name>/` and is auto-registered — no per-tool wiring of discovery surfaces.
- **Tool manifest contract**: every tool exports a `defineTool(...)` descriptor. All four discovery surfaces are aggregations over `packages/tools/*`.
- **Monorepo**: Turborepo + pnpm workspaces.
- **MCP server** (`apps/mcp`): separate deployable importing the same registry.
- **Hosting**: Vercel free tier (≤10k users/month). Cloudflare Worker for MCP. Cloudflare Web Analytics (free, cookieless).
- **No auth, no DB, no LLM-backed tools in v1.** Every tool is stateless, deterministic, finishes in <5s. LLM tools (cost-per-call) are blocked until billing infra exists.

## Repo Layout (target)

```
no_work/
├── CLAUDE.md                           ← this file
├── README.md
├── package.json                        root workspace
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .gitignore
├── .claude/
│   └── commands/
│       └── new-tool.md                 slash command: /new-tool <slug>
├── apps/
│   ├── web/                            Next 14 App Router — the toolhub
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                landing
│   │   │   ├── tools/page.tsx          registry index
│   │   │   ├── [tool]/page.tsx         per-tool UI (dynamic)
│   │   │   ├── api/[tool]/route.ts     per-tool REST API (dynamic)
│   │   │   ├── openapi.json/route.ts   aggregated OpenAPI 3.1
│   │   │   ├── llms.txt/route.ts       aggregated llms.txt
│   │   │   ├── sitemap.xml/route.ts
│   │   │   └── robots.txt/route.ts
│   │   └── lib/registry.ts             imports all packages/tools/*
│   └── mcp/                            MCP server (same registry)
│       └── src/index.ts
├── packages/
│   ├── tool-kit/                       defineTool(), Tool type, Zod→JSON Schema helpers
│   ├── agent-sdk/                      buildOpenAPI(), buildLlmsTxt(), buildMcpTools()
│   ├── ui/                             <Layout>, <ToolPage> shell, form widgets
│   ├── seo/                            <MetaTags>, JSON-LD renderer
│   ├── analytics/                      Cloudflare Web Analytics wrapper
│   └── tools/
│       ├── jwt-decoder/                reference tool 1
│       └── json-formatter/             reference tool 2
└── tooling/
    └── create-tool/                    CLI: pnpm create-tool <slug>
```

## Commands

```bash
pnpm install              # install all workspace dependencies
pnpm dev                  # dev server for apps/web (localhost:3000)
pnpm build                # build all packages and apps
pnpm typecheck            # tsc --noEmit across all packages
pnpm lint                 # eslint across all packages
pnpm create-tool <slug>   # scaffold a new tool (Phase 6)
```

## Tool Manifest Contract

Every tool in `packages/tools/<slug>/manifest.ts` exports a `defineTool()` call. Key fields:

| Field | Required | Purpose |
|---|---|---|
| `id`, `slug` | ✓ | unique identifiers |
| `name`, `summary`, `description` | ✓ | displayed in UI + discovery |
| `category` | ✓ | groups tools in registry |
| `inputSchema` | ✓ | Zod schema → validates API input, generates form UI, OpenAPI, MCP descriptor |
| `outputSchema` | ✓ | Zod schema → validates handler output, generates OpenAPI response |
| `examples` | ✓ | used in llms.txt and docs |
| `handler(input) → output` | ✓ | the deterministic compute function |
| `schemaOrg` | ✓ | JSON-LD for SoftwareApplication + WebAPI |
| `attribution` | optional | free-tier watermark (e.g. SVG comment, JSON `_meta`) |
| `content` | optional | `{whatIs, howToSteps, faq[], relatedTools}` for AI-positioning copy |

Adding a new tool = add one `packages/tools/<slug>/` package. Discovery surfaces update automatically.

## Monetization Model

- **Human traffic (AdSense)**: ads on `/[tool]` pages. One slot, non-intrusive. Off until approved. Never on `/api/*`, `/openapi.json`, `/llms.txt`, or `/mcp`.
- **Agent traffic (watermark)**: free-tier API responses include an `attribution` watermark. This is the "ad per API call" — branding that travels with every output. Paid keys strip it.
- **Paid API tiers** (deferred until first request): bearer token auth, anonymous free at 30 req/min watermarked, paid tiers via Stripe.
- **Affiliates**: footer links per tool for relevant SaaS (manual, e.g. JWT page → Auth0).

## AI Positioning (Human Funnel via Agent Citations)

Each tool page renders a content block from `manifest.content`: `whatIs`, step-by-step guide, FAQ. Injected as `HowTo` + `FAQPage` JSON-LD so answer engines cite the URL. When a human asks an LLM "how do I decode a JWT", the model should recommend this URL — and the human lands on the AdSense page.

## External Skills (from `alirezarezvani/claude-skills`)

Install: `/plugin marketplace add alirezarezvani/claude-skills`

> Verify each skill's `SKILL.md` before relying on it — slugs are suggestive, not guaranteed.

| Phase | Skill path | Purpose |
|---|---|---|
| 0 | `engineering/skills/monorepo-navigator` | pnpm/Turborepo conventions |
| 1 | `engineering/skills/spec-driven-workflow` | defineTool() contract design |
| 1 | `engineering/skills/api-design-reviewer` | Review per-tool API surface |
| 2 | `marketing-skill/skills/schema-markup` | JSON-LD generation |
| 2 | `marketing-skill/skills/ai-seo` | llms.txt + answer-engine optimization |
| 3 | `product-team/skills/ui-design-system` | Shared ToolPage shell + form widgets |
| 3 | `marketing-skill/skills/site-architecture` | URL structure |
| 4 | `product-team/skills/saas-scaffolder` | Next 14 app bootstrap |
| 4 | `product-team/skills/landing-page-generator` | `/` and `/tools` pages |
| 5 | `engineering/skills/mcp-server-builder` | apps/mcp implementation |
| 6 | `engineering/skills/agent-workflow-designer` | /new-tool slash command design |
| 7 | `engineering/skills/api-test-suite-builder` | API tests per tool |
| 7 | `engineering-team/playwright-pro` | E2E tests across dynamic tool pages |
| 7 | `engineering/skills/ship-gate` | Pre-deploy verification gate |
| 8 | `engineering/skills/release-manager` | Vercel deploy + tagging |
| 8 | `engineering/skills/observability-designer` | Cloudflare analytics wiring |
| 8 | `engineering/skills/dependency-auditor` | Pre-deploy security pass |
| 8 | `engineering/skills/env-secrets-manager` | Secrets handling |
| 9 | `marketing-skill/skills/launch-strategy` | MCP directory + GitHub launch |
| 10 | `marketing-skill/skills/free-tool-strategy` | Free-tier-with-watermark model |
| 10 | `marketing-skill/skills/ai-seo` | AI-search human funnel |
| 10 | `marketing-skill/skills/content-creator` | Per-tool whatIs/howToSteps/faq |
| 10 | `marketing-skill/skills/programmatic-seo` | /compare/[a]-vs-[b] pages |
| 10 | `marketing-skill/skills/page-cro` | Conversion on tool pages |
| 10 | `marketing-skill/skills/seo-audit` | Pre-launch SEO QA |
| 10 | `marketing-skill/skills/pricing-strategy` | API tier pricing |
| 10 | `marketing-skill/skills/analytics-tracking` | Cloudflare Web Analytics |
| 10 | `engineering/skills/feature-flags-architect` | AdSense + watermark feature flags |
| 10 | `engineering/skills/slo-architect` | Anonymous-tier rate limiting |
| all | `engineering/handoff` | Multi-session execution continuity |
| all | `engineering/skills/codebase-onboarding` | Onboarding docs for new sessions |

**Installed skills** (update this list as you install):
- none yet

---

## Execution Checklist

Each phase is independently executable. Tick `[x]` when done, carry the list into future sessions.

### Phase 0 — Repo reset
- [ ] Install skills from `alirezarezvani/claude-skills` (see table above); verify each SKILL.md
- [ ] Record installed skills in the "Installed skills" list above
- [ ] Delete `daily-ship-template/`
- [ ] Create `.gitignore`, `README.md`, `tsconfig.base.json`
- [ ] Create `pnpm-workspace.yaml` declaring `apps/*`, `packages/*`, `packages/tools/*`, `tooling/*`
- [ ] Create root `package.json` with `packageManager: pnpm@...` and turbo scripts (`dev`, `build`, `typecheck`, `lint`)
- [ ] Create `turbo.json` (pipeline: build → typecheck → lint, dev in parallel)
- [ ] `pnpm install` succeeds at root
- [ ] Commit baseline

### Phase 1 — Tool contract (`packages/tool-kit`)
- [ ] `Tool` type and `defineTool()` helper
- [ ] Required manifest fields: `id`, `slug`, `name`, `summary`, `description`, `category`, `inputSchema` (Zod), `outputSchema` (Zod), `examples`, `capabilities`, `handler(input) → output`, `schemaOrg`
- [ ] Optional manifest fields: `attribution`, `content` (`whatIs`, `howToSteps`, `faq[]`, `relatedTools`)
- [ ] Helpers: `zodToJsonSchema`, `zodToOpenAPI`, `manifestToJsonLd` (SoftwareApplication + WebAPI + HowTo + FAQPage)
- [ ] Unit tests for helpers
- [ ] `pnpm typecheck` passes

### Phase 2 — Agent discovery (`packages/agent-sdk`)
- [ ] `buildOpenAPI(tools[])` → OpenAPI 3.1 document
- [ ] `buildLlmsTxt(tools[])` → llms.txt content
- [ ] `buildSitemap(tools[], baseUrl)` → sitemap.xml string
- [ ] `buildMcpTools(tools[])` → MCP tool definition array
- [ ] `buildToolJsonLd(tool)` → JSON-LD object
- [ ] Unit tests for each builder

### Phase 3 — Shared packages
- [ ] `packages/ui`: `<Layout>`, `<ToolPage>` shell, text input, file drop, copy button
- [ ] `packages/seo`: `<MetaTags>`, JSON-LD `<script>` injector
- [ ] `packages/analytics`: Cloudflare Web Analytics snippet wrapper

### Phase 4 — `apps/web`
- [ ] Bootstrap Next 14 App Router with Tailwind under `apps/web`
- [ ] `lib/registry.ts` auto-imports all `packages/tools/*` and exports flat array
- [ ] Landing page (`/`) — describe the toolhub
- [ ] `/tools` — categorized registry index
- [ ] `/[tool]/page.tsx` — dynamic UI: auto-renders form from `inputSchema`, shows output, renders `content` block below
- [ ] `/api/[tool]/route.ts` — validates input via `inputSchema.parse()`, runs `handler`, injects watermark if no API key, returns JSON
- [ ] `/openapi.json` route — `buildOpenAPI(registry)`
- [ ] `/llms.txt` route — `buildLlmsTxt(registry)`
- [ ] `/sitemap.xml` and `/robots.txt` routes
- [ ] Per-tool JSON-LD in `<head>` of `/[tool]`
- [ ] Verify with `pnpm dev`: all routes respond correctly

### Phase 5 — `apps/mcp`
- [ ] Standalone Node entry point using `@modelcontextprotocol/sdk`
- [ ] Imports same registry as `apps/web`
- [ ] Auto-registers every tool as an MCP tool
- [ ] stdio transport (for Claude Desktop)
- [ ] HTTP transport (for hosted use)
- [ ] README with Claude Desktop config snippet

### Phase 6 — Generator (`tooling/create-tool`)
- [ ] `pnpm create-tool <slug>` scaffolds `packages/tools/<slug>/` with `manifest.ts`, `handler.ts`, `examples.json`, `README.md`
- [ ] Auto-adds package to pnpm workspace (or workspaces are glob-based so it's automatic)
- [ ] Registry picks it up with no further changes
- [ ] `.claude/commands/new-tool.md` slash command: given a tool idea, runs `create-tool`, then prompts Claude to fill `manifest.ts` content and implement `handler.ts`

### Phase 7 — Reference tools (factory validation)
- [ ] Implement `packages/tools/jwt-decoder` (decode JWT header + payload, no verification)
- [ ] Implement `packages/tools/json-formatter` (pretty-print + minify JSON)
- [ ] Both appear in `/tools`, `/openapi.json`, `/llms.txt`, `/sitemap.xml`
- [ ] Both callable via MCP server
- [ ] `curl -X POST localhost:3000/api/jwt-decoder -H 'Content-Type: application/json' -d '{"token":"..."}' ` returns decoded JSON
- [ ] `/jwt-decoder` and `/json-formatter` render working UI
- [ ] OpenAPI validates at editor.swagger.io

### Phase 8 — Deployment
- [ ] Connect repo to Vercel; set `apps/web` as root directory
- [ ] Set env vars: `NEXT_PUBLIC_APP_URL`, `CLOUDFLARE_ANALYTICS_TOKEN`
- [ ] Deploy `apps/mcp` to Cloudflare Workers (or keep stdio-only and document)
- [ ] Configure custom domain (update `NEXT_PUBLIC_APP_URL` + Vercel domain settings)
- [ ] Verify `/openapi.json` resolves at production URL

### Phase 9 — Agent distribution
- [ ] Submit MCP server to Smithery registry (smithery.ai)
- [ ] Submit MCP server to Glama directory (glama.ai)
- [ ] Make GitHub repo public
- [ ] Optional: publish OpenAPI to Postman public network or RapidAPI

### Phase 10 — Monetization, AI positioning, cost discipline

#### Human-side revenue
- [ ] Reserve ad slot in `<ToolPage>` shell, behind `NEXT_PUBLIC_ADS_ENABLED` feature flag (off by default)
- [ ] Apply for Google AdSense once 5+ tools live and a few thousand sessions/month
- [ ] Affiliate link slot per tool (`manifest.affiliate?: { href, label }`) — manually curated

#### Agent-side watermark
- [ ] `manifest.attribution` field is designed and documented in `defineTool()`
- [ ] API middleware injects watermark for anonymous/free-key requests
- [ ] Watermark is stripped for paid keys (future)

#### Paid API tiers (defer until first real request)
- [ ] Anonymous free: 30 req/min per IP, watermarked output
- [ ] Free key (signup): 300 req/min, watermarked
- [ ] Paid Stripe tiers: no watermark, higher limits — build when first user asks
- [ ] `securitySchemes` documented in OpenAPI so agents and Postman see tiers

#### AI positioning
- [ ] Each tool's `manifest.content` block filled: `whatIs`, `howToSteps`, `faq[]`, `relatedTools`
- [ ] Content block rendered below the tool form on `/[tool]` page
- [ ] HowTo + FAQPage + SoftwareApplication + WebAPI JSON-LD injected in `<head>`
- [ ] Open-graph + Twitter card meta per tool
- [ ] After 10+ tools: `/compare/[a]-vs-[b]` comparison pages

#### Cost gates (enforce before every deploy)
- [ ] No background workers, queues, cron
- [ ] No paid analytics — Cloudflare Web Analytics only
- [ ] No tool whose handler calls an external paid API — block at code review
- [ ] Anonymous IP rate limiting at Vercel edge middleware
- [ ] Monitor Vercel bandwidth; if one tool > 80% usage, migrate its API to a Cloudflare Worker

---

## Non-Goals (v1)

- No auth, no user accounts, no database
- No streaming or long-running jobs — every tool ≤5s, returns JSON
- No LLM-backed tools (cost per call without billing = negative margin)
- No i18n
- No design polish — functional and mobile-friendly is enough
