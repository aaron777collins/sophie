# Person Manager Jobs

> **CEO Role:** This agent ALWAYS runs. Check system health every time.

## 🔴 CRITICAL: MELO v2 Security & Testing Overhaul

**[2026-02-17 16:18 EST] Aaron's Direct Order:**
> "I can't even seem to login when using the site.. it just kinda breaks after logging in. Make playwright tests to actually validate everything works (end to end flows). Also for our system if we are self hosting and intending on using it in private mode (like we are) we probably want to ensure only accounts hosted from our home server (the same server we are running) are allowed to login to it. In fact, the private mode should be by default! We can maybe allow folks from other servers if we invite them in, but it should be invite only you feel me? What I meant is that I don't want randoms logging into my home server, only those that are invited by admins in private mode. Of course that should be configurable. Go audit this. Also go audit if everything is e2ee. I want you to audit the whole thing, identify what is missing, and make a plan to fix it all (DETAILED). Then queue it all up and spawn the person manager to get it going."

**Audit Complete:** `/home/ubuntu/repos/melo/MELO-V2-COMPREHENSIVE-AUDIT.md`

### Critical Issues Identified

| Issue | Priority | Status |
|-------|----------|--------|
| Login breaks after authentication | P0 | ❌ NOT STARTED |
| No private mode (anyone can login) | P0 | ❌ NOT STARTED |
| E2E Playwright tests missing for critical flows | P0 | ❌ NOT STARTED |
| E2EE not default for all rooms | P1 | ❌ NOT STARTED |
| Admin invite system missing | P1 | ❌ NOT STARTED |

### Implementation Phases

#### Phase A: Login Fix & Investigation (P0) — 1-2 days
- [ ] Reproduce and debug "breaks after login" issue
- [ ] Add detailed logging for login flow
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Add error boundary for graceful degradation

#### Phase B: Private Mode Implementation (P0) — 2-3 days
- [ ] Create `lib/matrix/access-control.ts` module
- [ ] Add environment variables (MELO_PRIVATE_MODE, MELO_ALLOWED_HOMESERVER)
- [ ] Modify `app/api/auth/login/route.ts` for access control
- [ ] Update sign-in page UI for private mode
- [ ] Add private mode indicator

#### Phase C: E2E Playwright Tests (P0) — 2-3 days
- [ ] Create test fixtures for authenticated state
- [ ] Write post-login validation tests
- [ ] Write private mode enforcement tests
- [ ] Write E2EE verification tests
- [ ] Write full flow tests (login → create server → send message)

#### Phase D: E2EE Default Enforcement (P1) — 1-2 days
- [ ] Update `components/modals/initial-modal.tsx` for encryption
- [ ] Update all server templates to `encrypted: true`
- [ ] Update DM creation for encryption
- [ ] Add FORCE_E2EE environment variable

#### Phase E: Admin Invite System (P1) — 1-2 days
- [ ] Create `lib/matrix/admin-invites.ts`
- [ ] Create `app/api/admin/invites/route.ts`
- [ ] Create admin invite management UI

**Total Estimated Effort:** 8-12 days

---

## Managed Agents

### Coordinator
- **Jobs File:** `scheduler/coordinator/JOBS.md`
- **Identity:** `scheduler/coordinator/IDENTITY.md`
- **Status:** ✅ ACTIVE — Needs new tasks from audit
- **Last Checked:** 2026-02-17 16:18 EST
- **Note:** Full security/testing overhaul required per Aaron's order

### Task Managers (Proactive Scheduler)
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Identity:** `scheduler/task-managers/IDENTITY.md`
- **Status:** ⚠️ NEEDS UPDATE with new audit tasks
- **Last Checked:** 2026-02-17 16:18 EST

---

## Active Projects

### MELO v2 Security & Testing Overhaul (NEW - CRITICAL)
- **Priority:** 🔴 CRITICAL (Aaron's direct order)
- **Status:** AUDIT COMPLETE, IMPLEMENTATION NEEDED
- **Audit Document:** `/home/ubuntu/repos/melo/MELO-V2-COMPREHENSIVE-AUDIT.md`
- **Location:** ~/repos/melo
- **Build Status:** ✅ PASSING (44 pages, exit 0)
- **Deployment:** Live at dev2.aaroncollins.info

### MELO Original Phase Work (PAUSED)
- **Status:** PAUSED — Security/testing takes priority
- **Previous Progress:** 48% complete
- **Note:** Resume after critical security work complete

---

## Immediate Actions Required

1. **Update Coordinator Jobs** with Phase A-E breakdown
2. **Update PROACTIVE-JOBS.md** with detailed tasks
3. **Spawn workers** for parallel tracks:
   - Track 1: Login fix investigation (Sonnet)
   - Track 2: Private mode implementation (Sonnet)
   - Track 3: Playwright test creation (Sonnet)

---

## Recent Actions

- [2026-02-17 16:20 EST] **COMPREHENSIVE AUDIT COMPLETED** by Sophie
- [2026-02-17 16:18 EST] **AARON'S CRITICAL ORDER** — Security/testing overhaul
- [2026-02-17 16:13 EST] Prior status reported: Phase 5-6 in progress
- [2026-02-15 14:00 EST] Previous reconciliation completed

---

## Next Steps

1. Person Manager reviews audit and confirms approach
2. Update Coordinator JOBS.md with phase breakdown
3. Update PROACTIVE-JOBS.md with detailed tasks
4. Begin parallel execution of P0 items
5. Report progress to Slack #aibot-chat
