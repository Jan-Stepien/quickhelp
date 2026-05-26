# API Network Submission Steps

---

## 1. Postman Public API Network

**Goal:** Publish the quickhelp.dev OpenAPI spec as a public collection so it's discoverable in Postman's API Network.

**Submission URL:** https://www.postman.com/explore (after publishing, your workspace becomes searchable)

**Step-by-step:**

1. **Create a Postman account** at https://postman.com if you don't have one.

2. **Import the OpenAPI spec:**
   - Open Postman → click "Import" → "Link"
   - Paste: `https://quickhelp.dev/openapi.json`
   - Postman will generate a collection with one request per tool (jwt-decoder, json-formatter, image-converter, image-resizer, lcov-viewer, background-remover)

3. **Name the collection:** `quickhelp.dev — Developer Utility API`

4. **Add collection description** (paste this):
   ```
   Free, deterministic developer utilities via REST API.
   
   Tools: JWT Decoder, JSON Formatter, Image Converter, Image Resizer, Background Remover, LCOV Coverage Viewer.
   
   All tools return structured JSON. No auth required for the free tier (30 req/60s per IP).
   Full OpenAPI 3.1 spec: https://quickhelp.dev/openapi.json
   MCP server: https://quickhelp.dev/mcp
   Human UI: https://quickhelp.dev
   ```

5. **Set variables:**
   - Create a collection variable: `baseUrl` = `https://quickhelp.dev`
   - Update each request URL to use `{{baseUrl}}/api/<slug>`

6. **Add example responses** to each request (copy from the OpenAPI spec examples):
   - JWT Decoder: `{"header":{"alg":"HS256","typ":"JWT"},"payload":{"sub":"1234567890","name":"John Doe","iat":1516239022},"signature":"SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c","valid_structure":true}`
   - JSON Formatter: `{"output":"{\n  \"name\": \"Alice\",\n  \"age\": 30\n}","valid":true}`

7. **Publish the collection to Postman Public API Network:**
   - Go to the collection → "..." menu → "Share" → "Publish to API Network"
   - Add tags: `developer-tools`, `jwt`, `json`, `image`, `openapi`, `free`, `api`, `mcp`
   - Submit for review

8. **Publish the workspace** so the collection is publicly browsable at `https://www.postman.com/[your-username]/workspace/quickhelp-dev`

**Expected review time:** 1–5 business days for API Network listing
**Priority:** High — Postman has a large developer audience

---

## 2. RapidAPI Hub

**Goal:** List each quickhelp.dev tool (or the whole hub) on RapidAPI so developers can discover and subscribe.

**Submission URL:** https://rapidapi.com/provider (requires a RapidAPI Provider account)

**Step-by-step:**

1. **Create a Provider account** at https://rapidapi.com/provider

2. **Add a new API:**
   - API Name: `quickhelp-dev`
   - API Description:
     ```
     Deterministic developer utilities — JWT decoder, JSON formatter, image converter, image resizer, LCOV coverage viewer. Each endpoint accepts JSON and returns structured JSON. No API key required for the free tier.
     ```
   - Base URL: `https://quickhelp.dev`
   - Category: Tools & Utilities / Developer Tools

3. **Import the OpenAPI spec:**
   - In the API settings, choose "Import from URL"
   - URL: `https://quickhelp.dev/openapi.json`
   - RapidAPI will parse the paths and generate endpoint listings

4. **Pricing tiers to declare:**

   | Tier | Requests | Price |
   |---|---|---|
   | Free | 30 req/60s (shared IP limit) | $0 |
   | Basic (planned) | Higher rate limit, no watermark | TBD |

   For now, declare only the **Free** tier. Do not create paid tiers until the paid key system is live on quickhelp.dev.

5. **Endpoints to list** (from the OpenAPI spec):
   - `POST /api/jwt-decoder` — Decode and verify JSON Web Tokens
   - `POST /api/json-formatter` — Pretty-print or minify JSON
   - `POST /api/image-converter` — Convert images between formats
   - `POST /api/image-resizer` — Resize, crop, rotate, and flip images
   - `POST /api/lcov-viewer` — Parse LCOV files and return coverage percentages

6. **Add request/response examples** for each endpoint (copy from the OpenAPI `examples` fields)

7. **Set the authentication type to "No Auth"** for the free tier

8. **Publish the API** and submit for RapidAPI's review

**Expected review time:** 3–7 business days
**Priority:** Medium

---

## 3. APIs.guru (apis.guru / GitHub)

**Goal:** Submit the quickhelp.dev OpenAPI spec to the APIs.guru public registry, which is consumed by many API client generators and discovery tools.

**Submission URL:** https://github.com/APIs-guru/openapi-directory — submit a PR

**Step-by-step:**

1. **Fork the repository:** https://github.com/APIs-guru/openapi-directory

2. **Create the directory structure:**
   ```
   APIs/
     quickhelp.dev/
       v1/
         openapi.yaml
   ```

3. **Fetch and convert the OpenAPI spec:**
   ```bash
   curl https://quickhelp.dev/openapi.json | \
     npx js-yaml --from json --to yaml > openapi.yaml
   ```
   
   Or simply reference the JSON — APIs.guru accepts both YAML and JSON.

4. **Verify the spec is valid** before submitting:
   ```bash
   npx @apidevtools/swagger-parser validate openapi.yaml
   ```

5. **Create a PR** with:
   - Title: `Add quickhelp.dev developer utility API`
   - Body:
     ```
     Adding quickhelp.dev — a free, deterministic developer utility hub.
     
     - Live spec: https://quickhelp.dev/openapi.json
     - Homepage: https://quickhelp.dev
     - Tools: JWT decoder, JSON formatter, image converter, image resizer, LCOV viewer
     - Auth: None required (free tier, 30 req/60s per IP)
     - OpenAPI version: 3.1.0
     ```

6. **Requirements APIs.guru checks:**
   - Valid OpenAPI 3.x document (no `$ref` resolution errors)
   - Server URL must be live and return valid responses
   - The spec must accurately describe the actual API behaviour
   - Contact info in the spec's `info.contact` field is helpful

7. **Add contact info to your OpenAPI spec** if not already present — APIs.guru often requires it:
   ```json
   "info": {
     "contact": {
       "name": "Jan Stepien",
       "email": "jasiek.stepien@gmail.com",
       "url": "https://quickhelp.dev"
     }
   }
   ```

**Expected review time:** 3–14 days (open-source maintainer review)
**Priority:** Medium — APIs.guru is consumed by SwaggerHub, ReadMe, and other tooling

---

## 4. any-api.com

**Submission URL:** https://any-api.com (check for a "Submit API" or "Add your API" link in the footer/nav — the site's submission form URL changes occasionally)

**What to fill in:**
- API Name: quickhelp.dev
- Website: https://quickhelp.dev
- API Documentation URL: https://quickhelp.dev/openapi.json
- Short description: Free developer utility API — JWT decoder, JSON formatter, image converter, image resizer, LCOV viewer. OpenAPI 3.1, no auth, 30 req/60s free tier.
- Category: Tools / Utilities
- Authentication: None
- Format: JSON
- Protocol: HTTPS / REST

**Expected review time:** 1–7 days
**Priority:** Low

---

## Pre-submission checklist (all API directories)

- [ ] `GET https://quickhelp.dev/openapi.json` returns a valid, parseable OpenAPI 3.1 document
- [ ] The `info.title`, `info.description`, `info.version`, and `info.contact` fields are populated in the OpenAPI spec
- [ ] The `servers` array in the OpenAPI spec points to `https://quickhelp.dev`
- [ ] Each path has an `operationId`, a `summary`, and at least one example
- [ ] `POST https://quickhelp.dev/api/jwt-decoder` with a valid JWT body returns a 200 JSON response (verify endpoints are live before submitting)
- [ ] Rate limit behaviour (30 req/60s) is documented in the spec or in the API description

---
