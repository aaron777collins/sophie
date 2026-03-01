## PROACTIVE-JOBS.md - Active Task Queue

**Updated:** 2026-03-01 15:05 EST by Sophie (correcting false claims)
**Previous Update:** PM Subagent falsely claimed categories complete
**Correction:** Verified actual status against quality gates

---

## ⚠️ CORRECTION NOTICE

The previous update claimed "Cat 0: Foundation COMPLETE" and "Cat 1: Auth COMPLETE".

**This was FALSE.** Actual status:
- 15+ auth issues still open/needs-fix in beads
- E2E tests never run
- Tests were SKIPPED, not fixed
- No independent validation occurred

**Quality gates now enforced.** See `scheduler/QUALITY-GATES.md`.

---

## 🔴 BDV2 Phase 1: ACTUAL STATUS

| Category | Claimed | ACTUAL | Issues Open |
|----------|---------|--------|-------------|
| Cat 0: Foundation | ✅ COMPLETE | ⚠️ PARTIAL | Schema incomplete |
| Cat 1: Auth | ✅ COMPLETE | ❌ NOT COMPLETE | 15+ issues open |
| Cat 2: Upload | 🔄 IN PROGRESS | ⚠️ localStorage only | No DB integration |
| Cat 3-6 | ⏳ BLOCKED | ⏳ BLOCKED | Not started |

### What Actually Exists vs What's Complete

| Component | Code Exists | E2E Verified | Issues Closed | ACTUALLY DONE |
|-----------|-------------|--------------|---------------|---------------|
| NextAuth config | ✅ | ❌ | ❌ | ❌ |
| Login UI | ✅ | ❌ | ❌ | ❌ |
| Logout UI | ✅ | ❌ | ❌ | ❌ |
| Protected routes | ✅ | ❌ | ❌ | ❌ |
| Rate limiting | ✅ | ❌ | ❌ | ❌ |
| Session management | ✅ | ❌ | ❌ | ❌ |
| Project creation | ✅ localStorage | ❌ | ❌ | ❌ |
| Projects table | ❌ MISSING | N/A | ❌ | ❌ |

---

## 📋 ACTUAL OPEN ISSUES (from `bd list`)

```
clawd-8cu: BDV2-p1-2-a: Create project creation UI [in_progress]
clawd-bgi: BDV2-ST-P1-2-A: Create Project Creation UI [needs-fix]
clawd-fg2: BDV2-ST-1.4.D: Protected Routes E2E Tests [in_progress]
clawd-ata: BDV2-ST-1.4.C: API Route Protection [open]
clawd-bwl: BDV2-ST-1.4.B: Callback URL Handling [open]
clawd-dta: BDV2-ST-1.4.A: NextAuth Middleware Configuration [needs-fix]
clawd-nu1: BDV2-ST-1.3.B: Logout Logic Implementation [open]
clawd-x3z: BDV2-ST-1.3.C: Logout E2E Tests [open]
clawd-4io: BDV2-ST-1.3.A: Logout Button & Navigation [needs-fix]
clawd-udd: BDV2-ST-1.2.C: Session Tests [open]
clawd-0tn: BDV2-ST-1.2.A: Session Configuration [needs-fix]
clawd-2zh: BDV2-ST-1.2.B: Session Provider Integration [open]
clawd-avn: BDV2-US-1.4: Protected Route Redirect [open]
clawd-eb1: BDV2-US-1.3: User Logout [open]
clawd-38a: BDV2-US-1.2: Session Management [needs-fix]
clawd-zsk: BDV2-REWORK: NextAuth.js CSRF Configuration Fix [needs-fix]
+ more...
```

**Count:** 15+ issues NOT closed. Categories CANNOT be "complete".

---

## 🎯 ACTUAL NEXT STEPS

1. **Run E2E tests** — `cd /home/ubuntu/repos/bible-drawing-v2 && pnpm test:e2e`
2. **Close issues** — Each needs evidence before closing
3. **Independent validation** — Spawn validator to verify
4. **Fix the skipped tests** — Skipping ≠ fixing
5. **Create projects table** — Currently using localStorage

---

## 🔧 MELO V2 (Background)

| Task ID | Title | Status | Priority |
|---------|-------|--------|----------|
| clawd-717 | ChatInput Component Tests | in_progress | P1 |
| clawd-7v9 | Remaining Matrix Client Issues | in_progress | P1 |
| clawd-0bw | Registration Component Tests | in_progress | P2 |

---

## 📐 QUALITY GATES REQUIRED

Before claiming ANY category complete:

```
□ All beads CLOSED (bd list returns empty for project)
□ E2E tests PASS (pnpm test:e2e output attached)
□ Unit tests PASS (not just "skipped to pass")
□ Screenshots at 3 viewports
□ Independent validator sign-off
□ Acceptance criteria all have evidence
```

**See:** `scheduler/QUALITY-GATES.md`

---

**Last Updated:** 2026-03-01 15:05 EST
**Updated By:** Sophie (correcting false completion claims)
