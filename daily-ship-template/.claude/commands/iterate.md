You are reviewing user feedback on a shipped micro-SaaS.

Feedback received: $ARGUMENTS

Read SPEC.md to understand what was built and what was explicitly out of scope.

## Your job

1. **Triage** — sort the feedback into:
   - Ship today (< 1 hour, high signal, multiple users asked)
   - Add to v2 (good idea, but not urgent)
   - Won't do (scope creep, edge case, or contradicts the one-feature rule)

2. **Pick the top fix** — one change only. The highest-signal, lowest-effort improvement.

3. **Implement it** — make the code change. Don't ask for confirmation.

4. **Update SPEC.md** — add the change to a "## Shipped changes" section at the bottom.

## Rules
- Never add a second feature in response to one feedback session
- If 3+ users mention the same friction point, it's a real problem — fix it
- If only 1 user asks for a feature, add it to v2, don't build it
- Performance and mobile layout issues always ship same-day
