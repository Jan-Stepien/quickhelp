# quickhelp.dev Growth Kit
> Ready-to-paste copy + step-by-step instructions for every launch action.
> Work through the sections in order — measurement and search foundation first, then distribution.

---

## ✅ Manual action checklist

Work through these in order. Tick each one off as you complete it.

### Week 1 — Foundation (do before posting anywhere)

- [ ] **Set Cloudflare Web Analytics token** → `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` in Vercel env (Production). Get token: Cloudflare Dashboard → Web Analytics → your site → "Manage site" → copy the beacon token (32-char hex string). Redeploy after adding.
- [ ] **Google Search Console verify** — instructions + copy in §GSC below.
- [ ] **Bing Webmaster Tools** — import from GSC (one click) — link in §Bing below.
- [ ] **Run IndexNow** after every deploy: `node tooling/indexnow/submit.mjs` from repo root.
- [ ] **Make GitHub repo public**: https://github.com/Jan-Stepien/no_work → Settings → Danger Zone → Change visibility → Public. (Secret scan done — safe.)
- [ ] **Set GitHub topics**: on the repo page → gear icon next to "About" → add: `developer-tools`, `mcp`, `mcp-server`, `nextjs`, `api`, `jwt`, `image-converter`, `ai-tools`.
- [ ] **Submit to Smithery** → https://smithery.ai/new → Connect GitHub repo. `smithery.yaml` is already in `apps/mcp/`.
- [ ] **Submit to Glama** → https://glama.ai/mcp/servers → Submit (or it auto-indexes after repo is public).
- [ ] **Submit to PulseMCP** → https://www.pulsemcp.com/submit → use MCP description below.
- [ ] **Submit to mcp.so** → https://mcp.so/submit → use MCP description below.
- [ ] **PR: Awesome MCP Servers** → https://github.com/punkpeye/awesome-mcp-servers → PR instructions in §MCP registries below.
- [ ] **Submit to There's An AI For That** → https://theresanaiforthat.com/submit/ → use directory copy below.
- [ ] **Submit to Futurepedia** → https://www.futurepedia.io/submit-tool → use directory copy below.
- [ ] **Submit to Uneed** → https://www.uneed.best/submit-a-tool → use directory copy below.
- [ ] **Submit to SaaSHub** → https://www.saashub.com/submit → use directory copy below.
- [ ] **Submit to AlternativeTo** → https://alternativeto.net → add as alternative to: JWT.io, jsonformatter.org, remove.bg, TinyPNG. Use short description below.
- [ ] **Submit to DevHunt** → https://devhunt.org/ → use directory copy below.

### Week 2–3 — Launch spikes (stagger across days)

- [ ] **Show HN post** (Tue–Thu 8–10am ET) → copy in §Show HN below. Reply to every comment first 2 hrs.
- [ ] **Reddit r/SideProject** → copy in §Reddit below.
- [ ] **Reddit r/webdev** → 1 day after r/SideProject → copy in §Reddit below.
- [ ] **Reddit r/programming** → 2 days after r/webdev → copy in §Reddit below.
- [ ] **Product Hunt** (schedule for Tue–Thu 12:01am PT) → full kit in §Product Hunt below.
- [ ] **dev.to article** → cross-post the PNG→WebP blog post with canonical URL → instructions in §dev.to below.
- [ ] **LinkedIn post** → copy in §LinkedIn below.
- [ ] **Re-run IndexNow** after each new blog post: `node tooling/indexnow/submit.mjs`

---

## §GSC — Google Search Console

**URL:** https://search.google.com/search-console

**Steps:**
1. Add property → URL prefix → `https://quickhelp.dev` → Continue.
2. Choose **HTML tag** verification method.
3. Copy the `content="..."` value (looks like `google-site-verification=AbCdEfGhIjKlMnOp12345678`).
4. In Vercel: Project → Settings → Environment Variables → add `NEXT_PUBLIC_GSC_VERIFICATION=<that value>` (Production) → Save → Redeploy.
5. Back in GSC: click **Verify**.
6. After verification: **Sitemaps** → add `https://quickhelp.dev/sitemap.xml` → Submit.
7. **URL Inspection** → paste `https://quickhelp.dev` → Request indexing. Repeat for `/jwt-decoder`, `/json-formatter`, `/image-converter`.

---

## §Bing — Bing Webmaster Tools

**URL:** https://www.bing.com/webmasters

**Steps:**
1. Sign in with Microsoft account.
2. Add site → `https://quickhelp.dev`.
3. Choose **Import from Google Search Console** (one click, fastest) — or use the `msvalidate.01` meta tag via `NEXT_PUBLIC_BING_VERIFICATION` env var.
4. Submit sitemap: `https://quickhelp.dev/sitemap.xml`.

> Bing powers DuckDuckGo, ChatGPT search, and Copilot — worth 15–25% of search traffic.

---

## §MCP registries — copy for submissions

### Short description (for form fields ≤160 chars)
```
15 free dev tools (JWT, JSON, Base64, image converter, hash, UUID, and more) — each with a UI, REST API, and MCP server. No auth, stateless, <5s.
```

### Full description (for Smithery / Glama / PulseMCP)
```
quickhelp.dev MCP server exposes 15 deterministic developer tools to any MCP-compatible AI agent:

• JWT Decoder — decode header + payload, optional signature verification
• JSON Formatter — pretty-print, minify, sort, validate, repair JSON
• Base64 Encoder/Decoder — standard and URL-safe variants
• Image Converter — PNG, JPEG, WebP, AVIF, TIFF, GIF, SVG
• Image Resizer — resize by pixel dimensions or percentage
• Background Remover — AI-powered (ONNX Runtime Web)
• Hash Generator — MD5, SHA-1, SHA-256, SHA-512
• UUID Generator — v1, v3, v4, v5, v7
• URL Encoder/Decoder — percent-encoding
• Timestamp Converter — Unix epoch ↔ ISO 8601
• JSON to CSV — flatten JSON arrays to spreadsheet rows
• Text Case Converter — camelCase, snake_case, kebab-case, UPPER_CASE
• Color Converter — HEX ↔ RGB ↔ HSL ↔ HSV
• Number Base Converter — binary, octal, decimal, hex
• LCOV Viewer — parse and summarise coverage reports

Hosted HTTP endpoint (no install): POST https://quickhelp.dev/mcp
npx install: npx -y quickhelp-mcp
Free tier: 30 req/60s, watermarked output. All tools are stateless, privacy-first (image processing in-browser), and respond in <5s.
```

### Awesome MCP Servers PR
Fork https://github.com/punkpeye/awesome-mcp-servers and add this line under the "Tools" or "Developer Tools" section:

```markdown
- [quickhelp.dev](https://github.com/Jan-Stepien/no_work) - 15 free deterministic developer tools (JWT decoder, image converter, Base64, hash, UUID, JSON formatter, and more). Hosted HTTP endpoint at https://quickhelp.dev/mcp or `npx quickhelp-mcp` for stdio.
```

---

## §Directory — copy for tool directories

### Short (60 chars max)
```
15 free dev tools: UI, API & MCP for every tool
```

### Medium (160 chars)
```
15 free developer tools — JWT, JSON, Base64, image converter, background remover, hash, UUID, and more. Each has a browser UI, REST API, and MCP server entry.
```

### Long (300 chars)
```
quickhelp.dev gives developers 15 deterministic utility tools — JWT decoder, image converter, background remover, Base64 encoder, JSON formatter, hash generator, UUID generator, URL encoder, colour converter, and more. Each tool works as a browser app, a REST API endpoint, and an MCP tool for AI agents. Free, no sign-up, no uploads to a server.
```

### Tags (for all directories)
```
developer-tools, jwt, json, base64, image-converter, background-remover, hash, uuid, api, mcp, free-tools, browser-tools, ai-tools, open-source
```

### Category (choose closest match per directory)
- Primary: **Developer Tools** / **Utilities**
- Secondary: **AI Tools** / **Productivity**

### AlternativeTo — add as alternative to:
- JWT.io (JWT Decoder)
- JSONFormatter.org (JSON Formatter)
- remove.bg (Background Remover)
- TinyPNG (Image Converter)
- OnlineHashTools (Hash Generator)

---

## §Show HN

**URL:** https://news.ycombinator.com/submit

**Best time:** Tuesday, Wednesday, or Thursday between 8–10am US Eastern time.

**Title (exact, 80 chars max):**
```
Show HN: quickhelp.dev – 15 dev tools, each with a browser UI, REST API, and MCP server
```

**Body (paste into the URL field as the content, or as your first comment if title+URL only):**
```
I built quickhelp.dev — a hub of 15 small, deterministic developer tools. Each one has three interfaces:

1. A browser UI that runs entirely client-side (image processing uses WebAssembly — nothing is uploaded)
2. A REST API endpoint (POST /api/<slug>, JSON in/out, OpenAPI 3.1 at /openapi.json)
3. An MCP server entry so Claude, Cursor, and other AI agents can call any tool directly

Tools: JWT decoder (with optional signature verification), JSON formatter/validator, Base64 encoder/decoder (standard + URL-safe), image converter (PNG/JPEG/WebP/AVIF/TIFF/GIF/SVG), AI background remover (ONNX Runtime Web), hash generator (MD5/SHA-256/SHA-512), UUID generator (v4 + v7), URL encoder, timestamp converter, JSON→CSV, text case converter, colour converter (HEX/RGB/HSL/HSV), number base converter, LCOV coverage viewer.

The MCP endpoint is at https://quickhelp.dev/mcp — no install required, just add it to your Claude Desktop or Claude Code config. Or use npx -y quickhelp-mcp for stdio.

Free, no sign-up, no account. Source on GitHub.

Happy to answer questions about the architecture (single Next.js app, Turborepo monorepo, tools auto-register into all four discovery surfaces).
```

**First comment to post immediately after submitting:**
```
A few things I'm curious what HN thinks about:

1. The "single domain aggregation" idea — one /openapi.json, one /mcp, one /llms.txt so agents resolve capability discovery in one request instead of visiting many domains. Does this matter in practice or is it over-engineering?

2. Browser-side image processing: the background remover uses ONNX Runtime Web (u2net model). Inference takes 3–8s in the browser — is that too slow, or is the privacy benefit worth it?

3. Tool suggestions? I have 15 tools. What utility tools do you reach for most often that don't exist here?
```

---

## §Reddit

### r/SideProject (post this first — most lenient, "what I built" format works)

**Title:**
```
I built a hub of 15 free developer tools where every tool also has a REST API and MCP server
```

**Body:**
```
Hey r/SideProject — built this over the past few months: quickhelp.dev

It's a collection of 15 small utility tools for developers. The angle is that every tool has three interfaces:

- A browser UI (image processing runs in WebAssembly — nothing uploaded)
- A REST API (POST /api/<tool-slug>, JSON in/out, full OpenAPI 3.1 spec)
- An MCP tool entry (so AI agents like Claude/Cursor can call them directly)

Tools: JWT decoder, JSON formatter, Base64 encoder/decoder, image converter (PNG/JPEG/WebP/AVIF), background remover (AI, browser-only), hash generator, UUID v4/v7, URL encoder, timestamp converter, JSON→CSV, text case, colour converter, number base converter, LCOV viewer.

Free, no sign-up. The MCP server is live at quickhelp.dev/mcp.

Would love feedback — especially on what's missing or what's broken.
```

---

### r/webdev (1–2 days after r/SideProject)

**Title:**
```
I made every tool on my dev-tools site available as both a REST API and an MCP server — here's how it works
```

**Body:**
```
quickhelp.dev started as "just some browser tools" but I wanted every tool to be usable by both humans and AI agents without duplicating the implementation.

The architecture: each tool is a `defineTool()` manifest in a separate package. That manifest contains the Zod input/output schema, examples, content, and the handler function. The Next.js app, the OpenAPI generator, the llms.txt builder, and the MCP server all read from the same registry — so adding a tool means writing one file and it auto-appears everywhere.

Live examples:
- Browser: quickhelp.dev/jwt-decoder
- API: `curl -X POST https://quickhelp.dev/api/jwt-decoder -H 'Content-Type: application/json' -d '{"token":"..."}'`
- MCP: POST quickhelp.dev/mcp with `{"method":"tools/call","params":{"name":"jwt-decoder","arguments":{"token":"..."}}}`

15 tools live: JWT, JSON formatter, Base64, image converter, background remover (ONNX), hash, UUID v4/v7, URL encoder, timestamp, JSON→CSV, text case, colour, number base, LCOV viewer.

Free, open source. Thoughts on the architecture welcome.
```

---

### r/programming (2–3 days after r/webdev)

**Title:**
```
How I built a single-domain tool hub where one manifest auto-registers each tool into a UI, REST API, OpenAPI spec, and MCP server
```

**Body:**
```
I've been thinking about the "single domain aggregation" problem for AI agent tool discovery. When agents need to find "which service does X", they check /openapi.json, /llms.txt, or an MCP endpoint. If you split tools across multiple apps or domains, you fragment that authority and make agents do many lookups.

My approach: quickhelp.dev — one Next.js app, 15 tools, one domain. Each tool is a `defineTool()` call that exports a Zod schema + handler. The registry auto-generates:
- The browser UI (form fields derived from the input schema)
- `POST /api/<slug>` endpoints (validates with the same schema)
- `/openapi.json` (all tools in one document)
- `/llms.txt` (single-file discovery for LLMs)
- MCP tools (one server covers all 15)

No per-tool wiring — add a package, it appears everywhere.

The MCP server is both a hosted HTTP endpoint (quickhelp.dev/mcp) and an npx stdio server (npx -y quickhelp-mcp). Claude Desktop / Claude Code users can point at either.

Source: github.com/Jan-Stepien/no_work
```

---

## §Product Hunt

**URL:** https://www.producthunt.com/posts/new

**Best day:** Tuesday, Wednesday, or Thursday — launch at 12:01am PT for a full 24h cycle.

**Tagline (60 chars):**
```
15 dev tools — each with a browser UI, API & MCP server
```

**Description (260 chars):**
```
quickhelp.dev: 15 free developer tools (JWT decoder, JSON formatter, image converter, Base64, hash generator, UUID, background remover, and more). Every tool runs in your browser, has a REST API, and is available as an MCP tool for AI agents. No sign-up.
```

**Topics:** Developer Tools · API · Artificial Intelligence · Productivity

**Gallery images spec:**
- Image 1 (hero): screenshot of /jwt-decoder with a decoded token visible
- Image 2: screenshot of /image-converter showing a PNG→WebP conversion
- Image 3: terminal screenshot of `claude mcp add --transport http quickhelp https://quickhelp.dev/mcp`
- Image 4: the /tools page showing all 15 tools in the grid

**First comment (post immediately after launch goes live):**
```
Hey Product Hunt! 👋

I built quickhelp.dev to solve a specific frustration: every time I needed a quick JWT decode, image resize, or Base64 encode, I'd open a different site — and none of them had an API I could call from code or scripts.

So I built one where every tool has three interfaces:
🖥 Browser UI — runs client-side, nothing uploaded
⚡ REST API — POST /api/<tool>, full OpenAPI 3.1 spec
🤖 MCP server — Claude/Cursor can call any tool directly

The MCP endpoint is live at https://quickhelp.dev/mcp — add it to Claude Desktop with one JSON snippet, or run `claude mcp add --transport http quickhelp https://quickhelp.dev/mcp` in Claude Code.

15 tools today, adding more based on what people actually use. What tool should I build next?
```

---

## §dev.to cross-post

**URL:** https://dev.to/new

**Instructions:**
1. Go to https://dev.to/new
2. Paste the title: **"How to convert PNG to WebP online (and when to use AVIF instead)"**
3. Add tags: `webdev`, `beginners`, `images`, `tutorial`
4. Paste the intro paragraph + first 2–3 sections of the blog post (quickhelp.dev/blog/png-to-webp-conversion-guide).
5. Add at the top of the post (before any content):
   ```
   This article was originally published at quickhelp.dev/blog/png-to-webp-conversion-guide
   ```
6. In dev.to settings for this post → **Canonical URL** → paste `https://quickhelp.dev/blog/png-to-webp-conversion-guide`
7. Publish.

> The canonical URL tells Google the original is on quickhelp.dev, so the SEO credit flows to your domain, not dev.to.

---

## §LinkedIn

**Post (copy and paste):**
```
I shipped quickhelp.dev — a hub of 15 free developer tools where every tool has three interfaces:

🖥 Browser UI — runs entirely in your browser (image processing uses WebAssembly, nothing uploaded)
⚡ REST API — POST /api/<tool-slug>, full OpenAPI 3.1 spec at /openapi.json
🤖 MCP server — AI agents (Claude, Cursor, Continue) can call any tool directly via Model Context Protocol

Tools include: JWT decoder, JSON formatter/validator, Base64 encoder/decoder (with URL-safe variant), image converter (PNG/JPEG/WebP/AVIF), AI background remover, SHA-256 hash generator, UUID v4/v7, URL encoder, timestamp converter, and more.

The MCP endpoint is live: add https://quickhelp.dev/mcp to your Claude Desktop config and all 15 tools become available to the AI in one step.

Free, no sign-up. Happy to answer questions about the architecture or tool ideas.

👉 quickhelp.dev
```

---

## §X / Twitter (if you create @quickhelpdev)

**Launch tweet:**
```
quickhelp.dev — 15 free dev tools, each with a browser UI, REST API, and MCP server

• JWT decoder
• Image converter (PNG/WebP/AVIF)  
• Background remover (AI, runs in browser)
• Base64, hash, UUID, JSON formatter + more

MCP: quickhelp.dev/mcp
API: quickhelp.dev/openapi.json

Free, no account 👇
```

**Thread reply (adds context):**
```
Every tool is a single manifest file (defineTool()). Adding a new tool means writing one package — it auto-appears in the UI, API, OpenAPI spec, llms.txt, and MCP server.

No per-tool wiring. That's the whole architecture.

Open source: github.com/Jan-Stepien/no_work
```

---

## Notes on timing + sequencing

- **Never post to two subreddits the same day** — Reddit flags accounts that cross-post immediately.
- **Product Hunt works best with upvote coordination** — share the PH link with friends/colleagues on launch morning (not the night before).
- **Show HN peaks in comments within 2 hours** — be at your keyboard ready to reply.
- **Bing IndexNow** covers Bing, Yandex, Seznam — run after every meaningful content update: `node tooling/indexnow/submit.mjs`
- **After 1 week:** query Cloudflare Analytics (I can do this via MCP) to see which channel drove real traffic, then double down on it.
