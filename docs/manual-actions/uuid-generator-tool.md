# Manual Actions — UUID Generator

Tool slug: `uuid-generator`
Added: 2026-05-29

## Deploy

Live at: https://quickhelp.dev/uuid-generator (confirmed ~45s after push)

## Post-deploy verification

```bash
# Generate 3 hyphenated UUIDs
curl -s -X POST https://quickhelp.dev/api/uuid-generator \
  -H 'Content-Type: application/json' \
  -d '{"count":3,"format":"hyphenated"}' | jq .
# Expected: array of 3 valid UUID v4 strings

# Compact format
curl -s -X POST https://quickhelp.dev/api/uuid-generator \
  -H 'Content-Type: application/json' \
  -d '{"count":1,"format":"compact"}' | jq .
# Expected: 32-character hex string, no hyphens

# Validate a UUID
curl -s -X POST https://quickhelp.dev/api/uuid-generator \
  -H 'Content-Type: application/json' \
  -d '{"count":1,"format":"hyphenated","validate":"550e8400-e29b-41d4-a716-446655440000"}' | jq .
# Expected: { "is_valid": true, "validated_version": "v4" }

# Check OpenAPI and sitemap
curl -s https://quickhelp.dev/openapi.json | jq '.paths | keys | .[]' | grep uuid
curl -s https://quickhelp.dev/sitemap.xml | grep uuid-generator
```

## Google Search Console

1. [GSC URL Inspection](https://search.google.com/search-console)
2. Request indexing for:
   - `https://quickhelp.dev/uuid-generator`
   - `https://quickhelp.dev/use-cases/generate-uuid-v4-online`
   - `https://quickhelp.dev/use-cases/validate-uuid-format`
   - `https://quickhelp.dev/use-cases/uuid-vs-auto-increment`
   - `https://quickhelp.dev/use-cases/uuid-as-idempotency-key`

## IndexNow

```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. Google AdSense → Ads → By ad unit → Display ads → **Create new ad unit**
2. Name: `uuid-generator-mid`
3. Type: Display, size: Responsive
4. Add unit ID to `apps/web/lib/ad-slots.ts`:
   ```ts
   "uuid-generator-mid": "<numeric-id>",
   ```

## Cloudflare robots.txt (one-time, if not yet done)

Dashboard → `quickhelp.dev` → Security → Bots → AI Crawlers → **Allow**

## Rich Results validation

- [Rich Results Test](https://search.google.com/test/rich-results?url=https://quickhelp.dev/uuid-generator)
- Expected: SoftwareApplication, FAQPage, BreadcrumbList
