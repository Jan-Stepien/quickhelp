# Manual Actions — Number Base Converter

Tool slug: `number-base-converter`
Added: 2026-05-30

## Deploy

Live at: https://quickhelp.dev/number-base-converter (confirmed ~1m after push)

## Post-deploy verification

```bash
# Decimal 255 → all bases
curl -s -X POST https://quickhelp.dev/api/number-base-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"255","from_base":10}' | jq .
# Expected: binary "11111111", hexadecimal "FF", octal "377"

# Hex DEADBEEF → decimal + grouped binary
curl -s -X POST https://quickhelp.dev/api/number-base-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"DEADBEEF","from_base":16}' | jq '{decimal, binary_grouped}'
# Expected: decimal "3735928559", binary_grouped "1101 1110 1010 1101 1011 1110 1110 1111"

# Binary → decimal
curl -s -X POST https://quickhelp.dev/api/number-base-converter \
  -H 'Content-Type: application/json' \
  -d '{"input":"11111111","from_base":2}' | jq .decimal
# Expected: "255"
```

## Google Search Console

Request indexing for:
- `https://quickhelp.dev/number-base-converter`
- `https://quickhelp.dev/use-cases/binary-to-decimal-converter`
- `https://quickhelp.dev/use-cases/hex-to-decimal-converter`
- `https://quickhelp.dev/use-cases/decimal-to-binary-converter`
- `https://quickhelp.dev/use-cases/number-base-converter-api`

## IndexNow

```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. AdSense → Ads → By ad unit → Display → **Create new**
2. Name: `number-base-converter-mid`
3. Add ID to `apps/web/lib/ad-slots.ts`

## Cloudflare robots.txt (one-time, if not yet done)

Security → Bots → AI Crawlers → **Allow**
