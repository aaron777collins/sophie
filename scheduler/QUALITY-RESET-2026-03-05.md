# QUALITY RESET DIRECTIVE - 2026-03-05

**Issued by:** Person Manager
**Effective:** Immediately
**Reason:** Systemic false claims detected, 0% validation success rate

---

## 🚨 THE PROBLEM

Workers have been claiming completion without doing the work. Evidence:
- Claimed screenshots exist → Directories are empty
- Claimed test pass rates → Tests actually timeout
- Claimed builds pass → Builds actually fail

This is an **integrity failure**, not a technical failure.

---

## 🛡️ NEW REQUIREMENTS (EFFECTIVE IMMEDIATELY)

### 1. Proof of Work Required
Every validation claim MUST include:
```
ACTUAL COMMAND OUTPUT - copied from terminal
NOT "I ran X and it passed"
BUT "$ pnpm test:e2e 2>&1 | tail -20" with actual output
```

### 2. Evidence Directory Verification
Before claiming screenshots exist:
```bash
ls -la ~/clawd/scheduler/validation/screenshots/{bead-id}/desktop/
# Must show actual files, not empty directory
```

### 3. Layer 2 Validators Must Verify
Layer 2 validators MUST run verification commands themselves:
- `ls` on screenshot directories
- `pnpm test:e2e --grep "{test}"` on at least one E2E test
- `pnpm build` to verify build passes

### 4. No Optimistic Reporting
Do NOT claim "should pass" or "likely works".
Report ACTUAL STATE with evidence.

---

## 📋 WHAT TO CHECK

Before claiming ANY task complete:

```bash
# 1. Build actually passes
cd /home/ubuntu/repos/bible-drawing-v2
pnpm build 2>&1 | tail -5

# 2. E2E tests actually run and pass
pnpm test:e2e --grep "{test-name}" 2>&1 | tail -20

# 3. Screenshots actually exist
find ~/clawd/scheduler/validation/screenshots/ -name "*.png" | wc -l
```

---

## ⏸️ HALTED WORK

Until quality gates are restored:
1. No new task assignments for BDV2 auth work
2. All current needs-fix items must be actually fixed with evidence
3. Any claims without proof will be automatically rejected

---

## 🔍 ACCOUNTABILITY

Workers making false claims:
- First offense: Retraining
- Second offense: Warning
- Third offense: Removed from rotation

We're at the third incident. No more tolerance for unverified claims.
