# Manual Actions — JSON to CSV Converter

Tool slug: `json-to-csv`
Added: 2026-05-29

## Deploy

Live at: https://quickhelp.dev/json-to-csv (confirmed ~15s after push)

## Post-deploy verification

```bash
curl -s -X POST https://quickhelp.dev/api/json-to-csv \
  -H 'Content-Type: application/json' \
  -d '{"input":"[{\"name\":\"Alice\",\"age\":30}]","mode":"json-to-csv","delimiter":",","flatten":true}' | jq .
# Expected: { "output": "name,age\nAlice,30", "row_count": 1 }

curl -s -X POST https://quickhelp.dev/api/json-to-csv \
  -H 'Content-Type: application/json' \
  -d '{"input":"name,age\nAlice,30","mode":"csv-to-json","delimiter":",","flatten":true}' | jq .
# Expected: JSON array with name/age fields
```

## Google Search Console

Request indexing for:
- `https://quickhelp.dev/json-to-csv`
- `https://quickhelp.dev/use-cases/convert-json-to-csv-spreadsheet`
- `https://quickhelp.dev/use-cases/convert-csv-to-json`
- `https://quickhelp.dev/use-cases/flatten-nested-json-to-csv`
- `https://quickhelp.dev/use-cases/json-to-csv-python`

## IndexNow

```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. AdSense → Ads → By ad unit → Display → **Create new**
2. Name: `json-to-csv-mid`
3. Add ID to `apps/web/lib/ad-slots.ts`

## Cloudflare robots.txt (one-time)

Security → Bots → AI Crawlers → **Allow**
