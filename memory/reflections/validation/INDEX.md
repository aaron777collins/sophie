# Improvement Validation Tracker

> Track whether improvements actually stuck — not just that we made them.

## How It Works

1. **When making an improvement:** Add entry to Active Validations with a check-by date (typically 7 days)
2. **During nightly reflection:** Check if any validations are due
3. **Assess each due validation:** Did the improvement work? Evidence?
4. **Move to Completed:** Log result and lessons learned

## Active Validations

| ID | Improvement | Made | Check By | Status |
|----|-------------|------|----------|--------|
| v001 | Example: Reduced verbosity in Slack | 2025-02-11 | 2025-02-18 | ⏳ pending |

## Completed Validations

| ID | Improvement | Result | Notes |
|----|-------------|--------|-------|
<!-- Add completed validations here -->

---

## Validation Criteria

### ✅ Success Indicators
- Same issue hasn't recurred
- Positive feedback received
- Behavior change is automatic now
- Metrics improved (if measurable)

### ❌ Failure Indicators  
- Same mistake happened again
- Had to consciously fight old habit
- Received same feedback again
- No observable change

### 🔄 Partial Success
- Improved but not fully resolved
- Works in some contexts, not others
- Needs refinement, not replacement

---

## What To Do With Results

| Result | Action |
|--------|--------|
| ✅ **Success** | Document what worked, reinforce the pattern |
| ❌ **Failed** | Root cause analysis — why didn't it stick? Try stronger fix |
| 🔄 **Partial** | Identify gaps, iterate on the improvement |

### When Improvements Fail

If an improvement didn't work:
1. **Don't just re-add the same fix** — it already failed
2. **Ask why:** Was the root cause wrong? Was the fix too weak?
3. **Escalate complexity:** Note → Guideline → Tool → Automation
4. **Create a pattern entry** in `memory/reflections/insights/`

---

## Entry Template

When adding a new validation:

```markdown
| vXXX | Brief description of improvement | YYYY-MM-DD | YYYY-MM-DD (+7d) | ⏳ pending |
```

When completing:

```markdown
| vXXX | Brief description | ✅ worked / ❌ failed / 🔄 partial | What we learned |
```
