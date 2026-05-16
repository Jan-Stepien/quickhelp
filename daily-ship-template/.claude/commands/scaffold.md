Read SPEC.md carefully. Then build the complete application by modifying the template files.

## Rules
- Replace ALL placeholder content (marked with `// REPLACE` comments)
- Happy path only — no edge case handling unless it would break the app
- Mobile-first layout
- No auth, no database, localStorage only
- Use the existing lib/claude.ts and lib/stripe.ts wrappers — do not rewrite them

## What to build

### 1. app/layout.tsx
Update metadata: title, description, og tags from SPEC.md

### 2. app/page.tsx
Full landing page:
- Headline leads with the outcome from SPEC.md tagline
- "How it works" section matches the actual user flow
- CTA copy matches the output the user gets
- Remove placeholder copy entirely

### 3. app/app/page.tsx
The tool itself:
- Form fields match SPEC.md exactly (correct types, labels, placeholders)
- Loading state says something specific (not just "Generating…")
- Result display matches the output format from SPEC.md
- Upsell block only if SPEC.md has a paid tier — otherwise remove it

### 4. app/api/generate/route.ts
- Write a tight system prompt based on SPEC.md's "one feature"
- Destructure the correct form fields from the request body
- Construct a user message that uses all form fields
- Validate required fields

### 5. app/api/checkout/route.ts
- Only modify if SPEC.md has a paid tier
- If no paid tier: delete this file and remove the upsell block from app/page.tsx

### 6. app/thank-you/page.tsx
- Update copy to match what was just purchased

## After building
List every file you modified and one sentence on what changed.
Then tell me: `npm run dev` is ready. Open http://localhost:3000
