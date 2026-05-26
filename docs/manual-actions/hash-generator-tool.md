# Manual Actions — Hash Generator

Tool slug: `hash-generator`
Added: 2026-05-26

## Deploy

Vercel auto-deploys on push. Verify the tool appears at:
- UI: `https://quickhelp.dev/hash-generator`
- REST API: `POST https://quickhelp.dev/api/hash-generator`
- OpenAPI: listed in `/openapi.json`
- MCP: registered in `/mcp` server
- Sitemap: listed in `/sitemap.xml`

## Post-deploy verification

```bash
# SHA-256 hex
curl -s -X POST https://quickhelp.dev/api/hash-generator \
  -H 'Content-Type: application/json' \
  -d '{"input":"Hello, World!","algorithm":"sha256","encoding":"hex"}' | jq .
# Expected: { "hash": "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986d", ... }

# MD5
curl -s -X POST https://quickhelp.dev/api/hash-generator \
  -H 'Content-Type: application/json' \
  -d '{"input":"Hello, World!","algorithm":"md5","encoding":"hex"}' | jq .
# Expected: { "hash": "65a8e27d8879283831b664bd8b7f0ad4", ... }

# Confirm it appears in OpenAPI
curl -s https://quickhelp.dev/openapi.json | jq '.paths | keys | .[]' | grep hash

# Confirm it appears in sitemap
curl -s https://quickhelp.dev/sitemap.xml | grep hash-generator
```

## Google Search Console

1. [GSC URL Inspection](https://search.google.com/search-console)
2. Request indexing for:
   - `https://quickhelp.dev/hash-generator`
   - `https://quickhelp.dev/use-cases/verify-sha256-checksum`
   - `https://quickhelp.dev/use-cases/generate-md5-hash-online`
   - `https://quickhelp.dev/use-cases/sha256-api-authentication`
   - `https://quickhelp.dev/use-cases/sha512-vs-sha256-comparison`

## IndexNow (Bing + Yandex instant indexing)

Run after deploy:
```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. Google AdSense → Ads → By ad unit → Display ads → **Create new ad unit**
2. Name: `hash-generator-mid`
3. Type: Display, size: Responsive
4. Copy the numeric unit ID
5. Add to `apps/web/lib/ad-slots.ts`:
   ```ts
   "hash-generator-mid": "<numeric-id>",
   ```
6. Wire it in `apps/web/app/hash-generator/page.tsx` (if a custom page exists — otherwise the dynamic `[tool]/page.tsx` handles it)

## Cloudflare robots.txt (one-time, if not yet done)

Cloudflare dashboard → `quickhelp.dev` → Security → Bots → AI Crawlers → set to **Allow**.
Verify: `curl -sL https://quickhelp.dev/robots.txt` should not show `Disallow: /` for GPTBot/ClaudeBot.

## Rich Results validation

- [Rich Results Test](https://search.google.com/test/rich-results?url=https://quickhelp.dev/hash-generator)
- Expected: SoftwareApplication, FAQPage, BreadcrumbList

## AdSense review (after all content deployed)

AdSense console → Sites → `quickhelp.dev` → **Request Review**
