# Manual Actions — Color Converter

Tool slug: `color-converter`
Added: 2026-05-29

## Deploy

Live at: https://quickhelp.dev/color-converter (confirmed ~1m after push)

## Post-deploy verification

```bash
curl -s -X POST https://quickhelp.dev/api/color-converter \
  -H 'Content-Type: application/json' \
  -d '{"color":"#ff6600"}' | jq .
# Expected: { "hex": "#ff6600", "rgb": {...}, "hsl": {...}, "hsv": {...}, "valid": true }

curl -s -X POST https://quickhelp.dev/api/color-converter \
  -H 'Content-Type: application/json' \
  -d '{"color":"hsl(24, 100%, 50%)"}' | jq .hex
# Expected: "#ff6600"
```

## Google Search Console

Request indexing for:
- `https://quickhelp.dev/color-converter`
- `https://quickhelp.dev/use-cases/hex-to-rgb-css`
- `https://quickhelp.dev/use-cases/rgb-to-hex-converter`
- `https://quickhelp.dev/use-cases/hsl-color-palette-generator`
- `https://quickhelp.dev/use-cases/color-converter-api`

## IndexNow

```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. AdSense → Ads → By ad unit → Display → **Create new**
2. Name: `color-converter-mid`
3. Add ID to `apps/web/lib/ad-slots.ts`

## Cloudflare robots.txt (one-time)

Security → Bots → AI Crawlers → **Allow**
