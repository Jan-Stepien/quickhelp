# Manual Actions — Unix Timestamp Converter

Tool slug: `timestamp-converter`
Added: 2026-05-29

## Deploy

Live at: https://quickhelp.dev/timestamp-converter (confirmed ~75s after push)

## Post-deploy verification

```bash
# Unix seconds to date
curl -s -X POST https://quickhelp.dev/api/timestamp-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"1716998400","mode":"to-date"}' | jq .
# Expected: iso8601 = "2024-05-29T16:00:00.000Z", valid = true

# ISO date to Unix
curl -s -X POST https://quickhelp.dev/api/timestamp-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"2024-05-29T16:00:00Z","mode":"to-timestamp"}' | jq .
# Expected: unix_seconds = 1716998400

# Milliseconds auto-detect
curl -s -X POST https://quickhelp.dev/api/timestamp-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"1716998400000","mode":"auto"}' | jq .
# Expected: unix_seconds = 1716998400

# Check OpenAPI
curl -s https://quickhelp.dev/openapi.json | jq '.paths | keys | .[]' | grep timestamp

# Check sitemap
curl -s https://quickhelp.dev/sitemap.xml | grep timestamp-converter
```

## Google Search Console

1. Go to [GSC URL Inspection](https://search.google.com/search-console)
2. Request indexing for:
   - `https://quickhelp.dev/timestamp-converter`
   - `https://quickhelp.dev/use-cases/convert-unix-timestamp-to-date`
   - `https://quickhelp.dev/use-cases/convert-date-to-unix-timestamp`
   - `https://quickhelp.dev/use-cases/check-jwt-expiry-timestamp`
   - `https://quickhelp.dev/use-cases/debug-log-timestamp`

## IndexNow (Bing + Yandex)

```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. Google AdSense → Ads → By ad unit → Display ads → **Create new ad unit**
2. Name: `timestamp-converter-mid`
3. Type: Display, size: Responsive
4. Add unit ID to `apps/web/lib/ad-slots.ts`:
   ```ts
   "timestamp-converter-mid": "<numeric-id>",
   ```

## Cloudflare robots.txt (one-time, if not yet done)

Dashboard → `quickhelp.dev` → Security → Bots → AI Crawlers → **Allow**

## Rich Results validation

- [Rich Results Test](https://search.google.com/test/rich-results?url=https://quickhelp.dev/timestamp-converter)
- Expected: SoftwareApplication, FAQPage, BreadcrumbList
