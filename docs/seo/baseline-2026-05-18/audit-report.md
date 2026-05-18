# SEO Baseline Audit — 2026-05-18

**Site:** http://localhost:3003 (quickhelp.dev)
**Audited with:** claude-seo parallel subagents (technical, schema/GEO, content/sitemap)

## Overall SEO Health Score: 91 / 100

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 22% | 97 |
| Content Quality | 23% | 95 |
| On-Page SEO | 20% | 88 |
| Schema / Structured Data | 10% | 92 |
| Performance (CWV) | 10% | 80 |
| AI Search Readiness | 10% | 92 |
| Images | 5% | 80 |

## GEO Readiness Score: 92 / 100

## Issues Found & Fixed

| Priority | Issue | Resolution |
|---|---|---|
| High (fixed) | Title template bug — all tool pages showed short titles without "| quickhelp.dev" suffix | Fixed: moved `title: { template }` after `...buildMetadata()` spread in layout.tsx |
| Medium | Homepage `Cache-Control: no-store` | Add ISR revalidation or cache header |
| Low | JWT Decoder title 27 chars (optimal 30-60) | Optional: expand title string |

## Passing Checks

- All 14 routes return HTTP 200
- Security headers: HSTS (max-age=63072000), X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy
- X-Robots-Tag: noindex on /api/* responses
- CORS (*) on /llms.txt, /openapi.json
- robots.txt allows: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, cohere-ai, CCBot, Bytespider
- Schema present: Organization + WebSite (home), SoftwareApplication + WebAPI + BreadcrumbList + FAQPage (tool pages), Article + BreadcrumbList (blog posts)
- SSR content rendering (curl confirms whatIs/howToSteps/faq in HTML)
- 71 URLs in sitemap covering all page types
- llms.txt (106 lines) and llms-full.txt (291 lines) accessible
- PWA manifest at /manifest.webmanifest

## Content Quality

| Page | Word Count | Status |
|---|---|---|
| JWT Decoder | 2,135 | ✅ PASS |
| JSON Formatter | 1,663 | ✅ PASS |
| Blog: How to decode JWT | 1,873 | ✅ PASS |
| Glossary: JWT | 1,370 | ✅ PASS |
| About | 1,246 | ✅ PASS |
| Contact | 982 | ✅ PASS |
| Changelog | 1,520 | ✅ PASS |
| Docs | 1,326 | ✅ PASS |

## Title Tags (post-fix)

| Page | Title | Length |
|---|---|---|
| / | quickhelp.dev — Developer Tools | 35 |
| /jwt-decoder | JWT Decoder \| quickhelp.dev | 27 |
| /json-formatter | JSON Formatter & Validator \| quickhelp.dev | 42 |
| /image-converter | Image Converter \| quickhelp.dev | 31 |
| /background-remover | Background Remover \| quickhelp.dev | 34 |

## Next Steps (from plan)

1. Implement /use-cases/[slug] programmatic SEO pages (in progress)
2. After production deploy: run `/seo drift baseline https://quickhelp.dev`
3. Apply for Google AdSense
4. Submit to GSC + Bing Webmaster
5. Submit to Smithery/Glama MCP directories
