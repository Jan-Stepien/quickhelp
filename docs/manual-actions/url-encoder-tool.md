# Manual Actions — URL Encoder / Decoder

Tool slug: `url-encoder`
Added: 2026-05-27

## Deploy

Live at: https://quickhelp.dev/url-encoder (confirmed, ~90s after push)

## Post-deploy verification

```bash
# Encode a query parameter value
curl -s -X POST https://quickhelp.dev/api/url-encoder \
  -H 'Content-Type: application/json' \
  -d '{"input":"hello world & more=stuff","mode":"encode-component"}' | jq .
# Expected: { "output": "hello%20world%20%26%20more%3Dstuff", "changed": true, ... }

# Decode
curl -s -X POST https://quickhelp.dev/api/url-encoder \
  -H 'Content-Type: application/json' \
  -d '{"input":"hello%20world%20%26%20more%3Dstuff","mode":"decode"}' | jq .
# Expected: { "output": "hello world & more=stuff", "changed": true, ... }

# Confirm in OpenAPI
curl -s https://quickhelp.dev/openapi.json | jq '.paths | keys | .[]' | grep url-encoder

# Confirm in sitemap
curl -s https://quickhelp.dev/sitemap.xml | grep url-encoder
```

## Google Search Console

1. Go to [GSC URL Inspection](https://search.google.com/search-console)
2. Request indexing for:
   - `https://quickhelp.dev/url-encoder`
   - `https://quickhelp.dev/use-cases/encode-url-query-parameter`
   - `https://quickhelp.dev/use-cases/decode-percent-encoded-url`
   - `https://quickhelp.dev/use-cases/encode-oauth-redirect-uri`
   - `https://quickhelp.dev/use-cases/fix-malformed-url-encoding`

## IndexNow (Bing + Yandex instant indexing)

Run after deploy:
```bash
node tooling/indexnow/submit.mjs
```

## AdSense ad unit

1. Google AdSense → Ads → By ad unit → Display ads → **Create new ad unit**
2. Name: `url-encoder-mid`
3. Type: Display, size: Responsive
4. Copy the numeric unit ID
5. Add to `apps/web/lib/ad-slots.ts`:
   ```ts
   "url-encoder-mid": "<numeric-id>",
   ```

## Cloudflare robots.txt (one-time, if not yet done)

Dashboard → `quickhelp.dev` → Security → Bots → AI Crawlers → set to **Allow**.

## Rich Results validation

- [Rich Results Test](https://search.google.com/test/rich-results?url=https://quickhelp.dev/url-encoder)
- Expected: SoftwareApplication, FAQPage, BreadcrumbList
