# /new-tool

Scaffold, implement, and fully SEO-wire a new tool in the monorepo.

**Usage:** `/new-tool <idea>`

**Example:** `/new-tool base64 encoder/decoder`

---

## What this command does

1. Derives a slug and scaffolds `packages/tools/<slug>/`
2. Implements `manifest.ts` with full SEO content (whatIs, howToSteps, faq, useCases)
3. Wires the tool into the registry (web + MCP)
4. Updates `relatedTools` on existing tools that are conceptually related
5. Verifies every auto-generated surface updates correctly (sitemap, llms.txt, OpenAPI, use-cases)

---

## Instructions

Given the tool idea: **$ARGUMENTS**

---

### Step 1 — Scaffold

```bash
node tooling/create-tool/bin.js <slug>
```

Slug rules: lowercase, hyphenated, concise (e.g. `base64-encoder`, `url-parser`, `cron-parser`).

---

### Step 2 — Implement manifest

Edit `packages/tools/<slug>/src/manifest.ts`. Every field below is required unless marked optional.

#### Core fields

| Field | Requirement |
|---|---|
| `id`, `slug` | Same value, matches the directory name |
| `name` | Title-cased human name, ≤ 40 chars |
| `summary` | One sentence, ≤ 120 chars — shown in `/tools` list and `llms.txt` |
| `description` | 2–3 sentences. Used in OpenAPI and tool detail pages |
| `category` | `encoding` · `formatting` · `conversion` · `generation` · `validation` · `cryptography` · `network` · `text` · `datetime` · `other` |
| `inputSchema` | Zod schema; every field has `.describe()` |
| `outputSchema` | Zod schema; every field has `.describe()` |
| `examples` | ≥ 2 realistic examples with real-looking values |
| `handler` | Pure, deterministic; no network calls; < 5 s; no external paid APIs |
| `schemaOrg` | `{ name, description, url: "https://quickhelp.dev/<slug>" }` |
| `attribution` | `{ text: "Processed by quickhelp.dev/<slug>", url: "https://quickhelp.dev/<slug>" }` |

#### SEO content block (`content:`)

This block drives the server-rendered content on `/<slug>`, the use-cases pages, llms.txt, and JSON-LD. Quality gates must pass.

**`whatIs`** — 2–4 sentences. Must start with "X is …" or "X refers to …". Explains the concept, not just the tool. Target ≥ 120 words for the full page (whatIs + steps + faq combined).

**`howToSteps`** — exactly 3 steps. Each step `name` is a verb phrase; `text` is 1–2 sentences of specific instruction.

**`faq`** — exactly 3 items. Questions must be distinct from the howToSteps. Common patterns: privacy ("Is my data sent to a server?"), format support ("What formats are accepted?"), edge-case behavior.

**`relatedTools`** — array of slugs of tools on this site that a user of this tool would also use. Keep to 2–4. Must be slugs that exist in the registry.

**`useCases`** — ≥ 4 distinct use cases. Each targets a different user intent or workflow. Quality gates:
- `slug`: unique across all tools, lowercase-hyphenated
- `title`: starts with "How to …" — 50–70 chars
- `intent`: one sentence describing the user goal — 80–120 chars
- `intro`: 80–120 words; first sentence names the problem; last sentence names the tool
- `steps`: exactly 3 steps — specific to this use case, not generic
- `faq`: exactly 2 items — use-case-specific questions only

**Use case slug uniqueness:** Before finalising slugs, verify none already exist:
```bash
grep -r "slug:" packages/tools/*/src/manifest.ts | grep "use-case-slug-here"
```

---

### Step 3 — Wire into registry

**`apps/web/package.json`** — add to `dependencies`:
```json
"@quickhelp/tools-<slug>": "workspace:*"
```

**`apps/web/lib/registry.ts`** — add import + add to array:
```ts
import { <camelSlug> } from "@quickhelp/tools-<slug>";
// ...
export const registry: AnyTool[] = [..., <camelSlug>];
```

**`apps/mcp/package.json`** — add to `dependencies`:
```json
"@quickhelp/tools-<slug>": "workspace:*"
```

**`apps/mcp/src/index.ts`** — add import + add to registry array.

---

### Step 4 — Update related tools

For each slug listed in this tool's `relatedTools`, open that tool's `manifest.ts` and add the new tool's slug to its own `relatedTools` array. This creates bidirectional cross-links, which are rendered as internal links on tool pages.

---

### Step 5 — Install and verify

```bash
pnpm install
```

Verify the four auto-generated discovery surfaces update automatically (no manual edits needed — they read from the registry):

```bash
# Sitemap includes the new tool slug
curl http://localhost:3000/sitemap.xml | grep "<slug>"

# llms.txt includes the new tool
curl http://localhost:3000/llms.txt | grep "<slug>"

# OpenAPI includes the new tool endpoint
curl http://localhost:3000/openapi.json | grep '"/<slug>"'

# Use-cases pages render (one per useCases[] entry)
curl http://localhost:3000/use-cases/<first-use-case-slug>

# API endpoint returns correct output
curl -X POST http://localhost:3000/api/<slug> \
  -H 'Content-Type: application/json' \
  -d '<example input JSON>'
```

If any surface is missing, the cause is almost always a missed registry wire-up (Step 3).

---

### Step 6 — SEO quality check

Run these against the local dev server to confirm no regressions:

```bash
# Title length (30–60 chars) and description (120–160 chars)
# Verified automatically via buildMetadata() — check console for warnings

# Word count: whatIs + howToSteps + faq combined should be ≥ 400 words
# Count with:
echo "$(node -e "
const m = await import('./packages/tools/<slug>/src/manifest.ts');
const c = m.<camelSlug>.content;
const text = [c.whatIs, ...c.howToSteps.map(s=>s.text), ...c.faq.map(f=>f.question+' '+f.answer)].join(' ');
console.log(text.split(/\s+/).length + ' words');
")"
```

Schema validation — paste `http://localhost:3000/<slug>` into https://validator.schema.org/ and confirm 0 errors.

---

### Constraints

- Handler must be **stateless and deterministic** — same input always returns same output
- No network calls inside the handler
- No external paid APIs
- Must complete in < 5 seconds
- Use only Node.js built-ins or workspace-installed packages (`zod` always available)
- Never use LLM APIs (cost per call with no billing = negative margin)
