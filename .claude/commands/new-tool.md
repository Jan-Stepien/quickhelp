# /new-tool

Scaffold and implement a new tool in the monorepo.

**Usage:** `/new-tool <idea>`

**Example:** `/new-tool base64 encoder/decoder`

---

## What this command does

1. **Derives a slug** from the idea (e.g. `base64-encoder`)
2. **Runs `pnpm create-tool <slug>`** to scaffold `packages/tools/<slug>/`
3. **Fills in `manifest.ts`** — summary, description, inputSchema, outputSchema, examples, schemaOrg, content
4. **Implements `handler`** — the deterministic compute function
5. **Wires up the tool** — adds it to `apps/web/lib/registry.ts` and `apps/web/package.json`, and `apps/mcp/src/index.ts`
6. **Runs `pnpm install`** to link the workspace

---

## Instructions

Given the tool idea: **$ARGUMENTS**

Follow these steps:

### Step 1 — Derive slug and run scaffold
- Pick a concise, lowercase, hyphenated slug
- Run: `node tooling/create-tool/bin.js <slug>`

### Step 2 — Implement the manifest
Edit `packages/tools/<slug>/src/manifest.ts`:
- `name`: human-readable name
- `summary`: one-line description (for `/tools` list and llms.txt)
- `description`: 2-3 sentences explaining what the tool does
- `category`: pick from: encoding, formatting, conversion, generation, validation, cryptography, network, text, datetime, other
- `inputSchema`: Zod schema for all inputs (include `.describe()` on each field)
- `outputSchema`: Zod schema for the output
- `examples`: 2+ realistic examples (title, input, output)
- `handler`: pure, deterministic function — no network calls, no external APIs, must finish in <5s
- `schemaOrg`: name, description, url
- `attribution`: `{ text: "Processed by quickhelp.dev/<slug>", url: "https://quickhelp.dev/<slug>" }`
- `content.whatIs`: 2-3 sentences explaining what the tool is for
- `content.howToSteps`: 3 steps explaining how to use it
- `content.faq`: 2-3 common questions with answers
- `content.relatedTools`: array of slugs of related tools

### Step 3 — Wire it up
1. Add `"@quickhelp/tools-<slug>": "workspace:*"` to `apps/web/package.json` dependencies
2. Add `"@quickhelp/tools-<slug>": "workspace:*"` to `apps/mcp/package.json` dependencies
3. Import and add to `apps/web/lib/registry.ts`
4. Import and add to `apps/mcp/src/index.ts`

### Step 4 — Install and verify
```bash
pnpm install
```

Then verify:
```bash
curl -X POST http://localhost:3000/api/<slug> -H 'Content-Type: application/json' -d '<example input>'
```

### Constraints
- Handler must be **stateless and deterministic** — same input always gives same output
- No network calls inside handler
- No external paid APIs
- Must finish in < 5 seconds
- Use only Node.js built-ins or already-installed packages (zod is always available)
