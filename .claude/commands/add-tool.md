# /add-tool

Research, plan, and ship a new tool to quickhelp.dev — fully wired for SEO and AdSense.

**Usage:** `/add-tool`

---

## What this command does

1. Picks the best next tool to add (based on search demand, implementation cost, and category gap)
2. Implements it end-to-end using `/new-tool`
3. Commits and pushes
4. Deploys to Vercel and waits for the deployment to go live
5. Writes `docs/manual-actions/<slug>-tool.md` listing every human action needed to finish the launch

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

### Step 3 — Deploy to Vercel

After pushing, trigger a Vercel deployment and wait for it to go live:

```bash
# Trigger deployment (requires Vercel CLI logged in)
vercel deploy --prod 2>&1

# If Vercel CLI is not installed or not authenticated, push triggers auto-deploy.
# Monitor deployment status:
vercel ls --prod 2>&1 | head -5
```

If `vercel` CLI is not available, check deployment status via the GitHub integration — the push to `main` triggers Vercel automatically. Poll until the deployment is live:

```bash
# Poll until the new tool responds (replace <slug> with the actual slug)
until curl -sf -o /dev/null "https://quickhelp.dev/<slug>"; do
  echo "Waiting for deployment..."; sleep 15
done
echo "Live: https://quickhelp.dev/<slug>"
```

Once live, run the smoke tests:

```bash
curl -s -X POST https://quickhelp.dev/api/<slug> \
  -H 'Content-Type: application/json' \
  -d '<example input from manifest>' | jq .
```

Confirm the response matches the expected output from the manifest's first example.

### Step 4 — Write manual actions file

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

### Step 5 — Confirm

Report back with:
- The slug chosen and why
- Word count of the content block
- All surfaces the tool now appears on (UI / API / OpenAPI / MCP / sitemap)
- Vercel deployment URL (confirmed live)
- Path to the manual actions file
