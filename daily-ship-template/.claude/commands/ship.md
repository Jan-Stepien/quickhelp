Run the full Daily Ship pipeline for this idea: $ARGUMENTS

You will complete all three phases in sequence. Be decisive — make product decisions without asking unless something is truly ambiguous.

---

## Phase 1: Spec (run /spec logic)

Generate SPEC.md as described in the spec command. Make opinionated choices:
- Default to free + one-time payment (not subscription) unless the idea clearly needs recurring billing
- Default to plain text output unless PDF/download adds obvious value
- Default to 2-3 form fields — remove anything that isn't strictly necessary

Print: "SPEC complete. One feature: [feature]. Paid: [yes/no at $X]."

---

## Phase 2: Build (run /scaffold logic)

Build the complete app by modifying template files. Follow all scaffold rules.
Do not ask for confirmation — build it.

Print: "Build complete. Files modified: [list]."

---

## Phase 3: Launch copy (run /launch logic)

Generate LAUNCH.md with all platform copy.

Print: "Launch copy ready in LAUNCH.md."

---

## Phase 4: Ship checklist

Print this checklist with your specific values filled in:

```
SHIP CHECKLIST
==============
[ ] cp .env.local.example .env.local
[ ] Add CLAUDE_API_KEY to .env.local
[ ] Add STRIPE_SECRET_KEY to .env.local       (if paid)
[ ] Create Stripe product → paste price ID    (if paid)
[ ] npm install
[ ] npm run dev → test the happy path
[ ] vercel login                               (first time only)
[ ] vercel link
[ ] vercel env add CLAUDE_API_KEY
[ ] vercel env add STRIPE_SECRET_KEY          (if paid)
[ ] git add -A && git commit -m "init: [app name]"
[ ] git push origin main
[ ] Post to: r/[primary subreddit] — copy in LAUNCH.md
```

---

Total time target: 6-8 hours from running this command to first Reddit post.
