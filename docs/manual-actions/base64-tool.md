# Manual Actions — Base64 Encoder / Decoder

Tool slug: `base64`
Added: 2026-05-26

## Deploy

1. **Merge and deploy** the current branch to Vercel. The tool auto-registers across all surfaces:
   - UI: `https://quickhelp.dev/base64`
   - REST API: `POST https://quickhelp.dev/api/base64`
   - OpenAPI: listed in `/openapi.json`
   - MCP: registered in `/mcp` server
   - Sitemap: listed in `/sitemap.xml`

## Post-deploy verification

```bash
# Smoke-test encode
curl -s -X POST https://quickhelp.dev/api/base64 \
  -H 'Content-Type: application/json' \
  -d '{"input":"Hello, World!","mode":"encode","charset":"standard"}' | jq .

# Expected: { "output": "SGVsbG8sIFdvcmxkIQ==", "valid": true, ... }

# Smoke-test decode
curl -s -X POST https://quickhelp.dev/api/base64 \
  -H 'Content-Type: application/json' \
  -d '{"input":"SGVsbG8sIFdvcmxkIQ==","mode":"decode","charset":"standard"}' | jq .

# Expected: { "output": "Hello, World!", "valid": true, ... }

# Check OpenAPI includes base64
curl -s https://quickhelp.dev/openapi.json | jq '.paths | keys | .[]' | grep base64

# Check sitemap includes base64
curl -s https://quickhelp.dev/sitemap.xml | grep base64
```

## Google Search Console

1. Go to [GSC URL Inspection](https://search.google.com/search-console)
2. Paste `https://quickhelp.dev/base64` → click **Request Indexing**
3. Also request indexing for the two use-case URLs listed in the sitemap:
   - `https://quickhelp.dev/base64/encode-string-to-base64`
   - `https://quickhelp.dev/base64/decode-base64-string`

## IndexNow (Bing + Yandex instant indexing)

Run after deploy:
```bash
node tooling/indexnow/submit.mjs
```
This submits all sitemap URLs (including the new `/base64` page) to Bing and Yandex.

## Cloudflare robots.txt fix (blocks all AI crawlers — required for indexing)

> This is a one-time fix that benefits ALL tools, not just base64.

1. Cloudflare dashboard → `quickhelp.dev` → **Security → Bots**
2. Find **AI Crawlers** / **AI Audit** managed rule
3. Set to **Allow** (or disable the managed block)
4. Verify: `curl -sL https://quickhelp.dev/robots.txt` should no longer show `Disallow: /` for GPTBot, ClaudeBot, etc.

## AdSense

After all content is deployed and robots.txt is fixed:
- AdSense console → **Sites** → `quickhelp.dev` → **Request Review**

## Rich Results validation

Check the base64 tool page passes structured data validation:
- [Rich Results Test](https://search.google.com/test/rich-results?url=https://quickhelp.dev/base64)
- Should show: **SoftwareApplication**, **FAQPage**, **BreadcrumbList**
