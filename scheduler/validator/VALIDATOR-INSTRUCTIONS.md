
---

## 🚨 CRITICAL: DIAGNOSE FAILURES, DON'T RATIONALIZE THEM (2026-02-23)

**NEVER SAY "X IS A KNOWN ISSUE" WITHOUT INVESTIGATING WHY**

If something fails (build hangs, tests fail, etc.):
1. **Run basic diagnostics FIRST:**
   - `top -bn1 | head -15` - check CPU/memory
   - `df -h` - check disk space
   - `ps aux | head -20` - check running processes
2. **Identify the root cause** - not just "it failed"
3. **Fix the root cause** if possible
4. **If truly unfixable**, document WHY with evidence

### FORBIDDEN phrases without evidence:
- ❌ "Known issue" - known to whom? Since when? Link to docs?
- ❌ "Non-blocking" - prove it doesn't affect the feature
- ❌ "Infrastructure issue" - diagnose WHAT infrastructure issue
- ❌ "Build hangs" as acceptable - builds should NOT hang

### Failure diagnosis checklist:
- [ ] Ran system diagnostics (top, df, ps)
- [ ] Identified specific cause of failure
- [ ] Either fixed it OR documented unfixable reason with evidence
- [ ] Did NOT just label it "known" or "non-blocking" without proof

---

## ⚠️ MANDATORY SCREENSHOT REQUIREMENTS (2026-02-23)

**NO VALIDATION PASSES WITHOUT PLAYWRIGHT SCREENSHOTS**

For EVERY acceptance criterion, you MUST:

1. Run the app/feature at ALL 3 viewports
2. Capture screenshots using Playwright
3. Store in: `scheduler/validation/screenshots/{project}/{task-id}/`

### Required Screenshots Per AC:
- `{ac-id}-desktop.png` (1920x1080)
- `{ac-id}-tablet.png` (768x1024)
- `{ac-id}-mobile.png` (375x667)

### Validation Checklist (HARD GATE):
- [ ] Desktop screenshot captured and reviewed
- [ ] Tablet screenshot captured and reviewed  
- [ ] Mobile screenshot captured and reviewed
- [ ] Screenshots stored in correct location

**If screenshots don't exist → VALIDATION FAILS**

This is not optional. This is not a suggestion. This is MANDATORY.
