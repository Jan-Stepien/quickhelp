# /add-tool

Research, plan, and ship a new tool to quickhelp.dev — fully wired for SEO and AdSense.

**Usage:** `/add-tool`

---

## What this command does

1. Picks the best next tool to add (based on search demand, implementation cost, and category gap)
2. Implements it end-to-end using `/new-tool`
3. Commits and pushes
4. Writes `docs/manual-actions/<slug>-tool.md` listing every human action needed to finish the launch

---

## Instructions

### Step 1 — Pick the tool

Look at the current registry to identify which categories are under-represented:

```bash
grep "category:" packages/tools/*/src/manifest.ts
```

Choose a tool that:
- Has clear search demand (people Google "X online free" or "X converter")
- Can be implemented with Node.js built-ins or a small npm package — **no external API calls, no LLM**
- Completes in < 5 seconds
- Is not already in the registry

Good candidates (in priority order):
- `hash-generator` — MD5/SHA-1/SHA-256/SHA-512 via Node.js `crypto` (cryptography gap)
- `url-encoder` — encodeURIComponent / decodeURIComponent + percent-encoding table (encoding gap)
- `color-converter` — HEX ↔ RGB ↔ HSL ↔ HSV (conversion gap, high visual search volume)
- `timestamp-converter` — Unix epoch ↔ ISO 8601 ↔ human-readable (datetime gap)
- `regex-tester` — test a regex against input, show matches and groups (validation gap)
- `diff-checker` — line-by-line diff of two text blocks (text gap)
- `markdown-to-html` — convert Markdown to HTML (formatting gap)
- `uuid-generator` — generate UUID v4 / v7 (generation gap)
- `text-case-converter` — camelCase / snake_case / kebab-case / PascalCase / SCREAMING_SNAKE (text gap)
- `json-to-csv` — convert flat JSON array to CSV and back (formatting gap)

Pick whichever is not yet in the registry and has the best search-volume-to-implementation ratio.

### Step 2 — Implement

Run `/new-tool <slug>` (use the Skill tool to invoke it) and follow all its steps through commit and push.

### Step 3 — Write manual actions file

Create `docs/manual-actions/<slug>-tool.md` with:

```markdown
# Manual Actions — <Tool Name>

Tool slug: `<slug>`
Added: <today's date>

## Deploy
[Vercel auto-deploys on push. Verify the tool appears at https://quickhelp.dev/<slug>]

## Post-deploy verification
[curl smoke tests for encode/decode or main operation]

## Google Search Console
[Request indexing for https://quickhelp.dev/<slug> and each use-case URL]

## IndexNow
[Run: node tooling/indexnow/submit.mjs]

## AdSense ad unit
[Steps to create the ad unit in AdSense console and add the ID to apps/web/lib/ad-slots.ts]

## Cloudflare robots.txt (if not yet done)
[Disable AI Crawler managed rules in Cloudflare dashboard]
```

### Step 4 — Confirm

Report back with:
- The slug chosen and why
- Word count of the content block
- All surfaces the tool now appears on (UI / API / OpenAPI / MCP / sitemap)
- Path to the manual actions file
