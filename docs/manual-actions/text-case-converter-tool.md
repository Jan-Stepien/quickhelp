# Manual Actions — Text Case Converter

Tool slug: `text-case-converter`
Added: 2026-05-29

## Deploy

Live at: https://quickhelp.dev/text-case-converter (confirmed ~15s after push)

## Post-deploy verification

```bash
curl -s -X POST https://quickhelp.dev/api/text-case-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"myVariableName","to":"snake_case"}' | jq .
# Expected: { "output": "my_variable_name", "from_detected": "camelCase" }

curl -s -X POST https://quickhelp.dev/api/text-case-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"hello world example","to":"PascalCase"}' | jq .
# Expected: { "output": "HelloWorldExample" }
```

## Google Search Console

Request indexing for:
- `https://quickhelp.dev/text-case-converter`
- `https://quickhelp.dev/use-cases/camelcase-to-snake-case`
- `https://quickhelp.dev/use-cases/snake-case-to-camelcase`
- `https://quickhelp.dev/use-cases/to-kebab-case-for-css`
- `https://quickhelp.dev/use-cases/to-pascal-case-for-classes`

## IndexNow

```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. AdSense → Ads → By ad unit → Display → **Create new**
2. Name: `text-case-converter-mid`
3. Add ID to `apps/web/lib/ad-slots.ts`

## Cloudflare robots.txt (one-time)

Security → Bots → AI Crawlers → **Allow**
