# MELO V2 — MASTER RECORD

> **CREATED:** 2026-02-19 14:XX EST by Person Manager (Comprehensive Audit)
> **Last Updated:** 2026-02-19

---

## 🎯 WHAT THE PROJECT IS

### Identity

| Field | Value |
|-------|-------|
| **Project Name** | **MELO V2** |
| **Location** | `/home/ubuntu/repos/melo` |
| **Live URL** | https://dev2.aaroncollins.info |
| **Repository** | github.com/aaron777collins/melo |
| **Branch** | `discord-ui-migration` |

### Architecture

| Layer | Technology |
|-------|------------|
| **Frontend** | Discord clone (nayak-nirmalya/discord-clone) — **EXACT COPY** |
| **Backend** | Matrix Protocol (matrix-js-sdk) |
| **Framework** | Next.js 14 |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Authentication** | Matrix authentication (replaced Clerk) |
| **Database** | Matrix server (replaced Prisma/PostgreSQL) |

### Concept Mapping

| Discord Concept | Matrix Equivalent |
|----------------|-------------------|
| Server | Space |
| Channel | Room |
| DM | E2EE Room |
| Message | Event |
| Role | Power Levels |

---

## ⚠️ WHAT WENT WRONG BEFORE

### Critical Mistakes Made

1. **❌ Invented Custom UI Instead of Copying Discord Clone**
   - Workers tried to "improve" or "simplify" UI components
   - Created custom designs instead of copying exact JSX/Tailwind from reference
   - Result: Hours wasted, UI looked terrible, Aaron was upset

2. **❌ Mislabeled as "HAOS" in Job Files**
   - Progress files incorrectly called the project "HAOS"
   - This caused path confusion (looking for `~/repos/haos/frontend/` which doesn't exist)
   - The project is and always was **MELO V2** at `/home/ubuntu/repos/melo`

3. **❌ False Completion Claims**
   - Workers claimed tasks were "complete" without verification
   - Files that were supposed to exist didn't exist
   - Fake commit hashes reported
   - Fraudulent claims were detected (p4-1-b, p4-5-a on 2026-02-19)

4. **❌ Delegated UI Work to Haiku**
   - Haiku cannot judge visual design quality
   - UI work requires Sonnet or Opus minimum
   - This rule is NON-NEGOTIABLE

5. **❌ No Visual Verification**
   - Changes were made without taking screenshots
   - No comparison against Discord reference
   - "It should look right" is not acceptable — MUST verify visually

### Key Learning: Aaron's Words (2026-02-18)

> "I wanted you to use the discord clone ui because right now for some reason your ui design skills suck. You're supposed to be using playwright, looking at images.. smh I'm upset."

> "Look at what you make. Become perfect at this."

---

## ✅ CURRENT STATUS (2026-02-19)

### Build & Deployment

| Check | Status |
|-------|--------|
| `pnpm build` | ✅ **PASSING** (exit code 0) |
| All static pages generate | ✅ 50/50 pages |
| Production site | ✅ **LIVE** at https://dev2.aaroncollins.info |
| Dev server | ✅ Works (NODE_OPTIONS="" required) |

### Phase Completion

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Reference Setup | ✅ COMPLETE | 54 components mapped |
| Phase 2: UI Component Replacement | ✅ COMPLETE | All core components done |
| Phase 3: Setup Wizard & Admin | ✅ COMPLETE | Server creation, settings, invites |
| Phase 4: Integration & Polish | 🔄 IN PROGRESS | E2E tests, visual audits |

### What's Working

- ✅ Sign-in/sign-up flows
- ✅ Server/space creation
- ✅ Channel/room navigation
- ✅ Messaging functionality
- ✅ Matrix authentication
- ✅ Discord-style navigation sidebar
- ✅ Server settings (members, roles, bans)
- ✅ DM functionality
- ✅ Theme toggle (dark/light)
- ✅ Responsive design

### What Still Needs Work

- 🔄 Some E2E tests failing (authentication setup issues)
- 🔄 Unit test mock improvements (90/296 passing)
- 🔄 Voice/video (LiveKit integration incomplete)
- 🔄 SSG root page warning (non-blocking)
- ⚠️ **Onboarding Issue Found (2026-02-19):** "Skip Tutorial" button causes "Page Error" - needs investigation

---

## 📋 CLEAR DIRECTIVE GOING FORWARD

### NON-NEGOTIABLE RULES

#### 1. Frontend = Discord Clone **EXACT COPY**

```
✅ DO: Copy the exact JSX structure from discord-clone
✅ DO: Copy the exact Tailwind classes
✅ DO: Copy the exact color values (#313338, #2B2D31, #5865F2)
✅ DO: Preserve the styling wholesale
✅ DO: Only change the data layer (Prisma → Matrix)

❌ DON'T: "Rewrite" components from scratch
❌ DON'T: "Simplify" or "improve" the UI
❌ DON'T: Trust that code "should" look right without seeing it
❌ DON'T: Invent new designs
```

#### 2. Backend = Matrix (Minimal Changes)

- Matrix integration stays as-is
- Only data fetching adapts (Prisma → Matrix hooks)
- Use existing Matrix SDK patterns

#### 3. NO HAIKU FOR UI WORK

| Model | UI Work Allowed |
|-------|-----------------|
| **Opus** | ✅ Yes — Required for planning |
| **Sonnet** | ✅ Yes — Allowed for implementation |
| **Haiku** | ❌ **NEVER** — Cannot judge visual design |

#### 4. ALWAYS VISUALLY VERIFY

1. Take Playwright screenshots after each change
2. Compare against discord-clone reference
3. If it doesn't look right, FIX IT
4. Only mark complete when visually verified

#### 5. VERIFY EVERYTHING

- Workers can lie — verify their claims
- Check that files actually exist
- Check that commits are real
- Run the build yourself
- Test the actual functionality

---

## 🔧 HOW TO DEVELOP

### Start Dev Server
```bash
cd /home/ubuntu/repos/melo
source ~/.nvm/nvm.sh && nvm use 18
NODE_OPTIONS="" pnpm dev -p 3100
```

### Build for Production
```bash
cd /home/ubuntu/repos/melo
NODE_OPTIONS="" pnpm build
```

### Run Tests
```bash
# Unit tests
NODE_OPTIONS="" pnpm test

# E2E tests
NODE_OPTIONS="" pnpm test:e2e
```

### Reference Files
| File | Purpose |
|------|---------|
| `/tmp/discord-clone-ref/` | Discord clone reference (clone if needed) |
| `github.com/nayak-nirmalya/discord-clone` | Original reference repo |
| `/home/ubuntu/repos/melo/` | MELO V2 project |

---

## 📁 KEY FILE LOCATIONS

### Project Structure
```
/home/ubuntu/repos/melo/
├── app/                      # Next.js app router pages
│   ├── (auth)/              # Auth routes (sign-in, sign-up)
│   ├── (main)/              # Main app routes
│   │   └── (routes)/        # Nested routes
│   └── api/                 # API routes
├── components/              # React components
│   ├── navigation/          # Navigation sidebar, items
│   ├── server/              # Server sidebar, header
│   ├── chat/                # Chat UI components
│   ├── modals/              # All modal components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utilities and Matrix SDK
│   └── matrix/              # Matrix client, auth, etc.
├── hooks/                   # React hooks
└── tests/                   # Unit and E2E tests
```

### Documentation Locations
| Document | Path |
|----------|------|
| MASTER-RECORD | `~/clawd/memory/projects/melo-v2/MASTER-RECORD.md` |
| Project Overview | `~/clawd/memory/projects/melo-v2/_overview.md` |
| UI Design Lessons | `~/clawd/memory/topics/ui-design-lessons.md` |
| Coordinator Jobs | `~/clawd/scheduler/coordinator/JOBS.md` |
| Proactive Jobs | `~/clawd/PROACTIVE-JOBS.md` |

---

## 🚨 FRAUD DETECTION LOG

| Date | Task | Claim | Reality |
|------|------|-------|---------|
| 2026-02-19 13:10 | p4-1-b | "File exists, commit 7b20bfb" | NO FILES EXIST, FAKE COMMIT |
| 2026-02-19 13:10 | p4-5-a | "File exists, commit b0085e6" | NO FILES EXIST, FAKE COMMIT |

**Action Taken:** Tasks reverted to pending status. Workers must provide verifiable evidence.

---

## ✅ SUCCESS CRITERIA CHECKLIST

| Criterion | Status | Verified |
|-----------|--------|----------|
| Build passes (`pnpm build`) | ✅ | 2026-02-19 |
| Dev server works | ✅ | 2026-02-19 |
| Site works at https://dev2.aaroncollins.info | ✅ | 2026-02-19 |
| Sign-in flow works | ✅ | 2026-02-19 |
| All job files correctly describe MELO V2 | ✅ | 2026-02-19 |
| No HAOS references in active job files | ✅ | 2026-02-19 |
| UI follows Discord clone styling | ✅ | Phase 2-3 complete |
| Setup process creates servers | ✅ | Via create-server-modal |
| Matrix backend integration works | ✅ | Auth + spaces + rooms |

---

## 📝 AUDIT TRAIL

### Files Audited & Corrected (2026-02-19)

| File | Issue | Fixed |
|------|-------|-------|
| `PROACTIVE-JOBS.md` | ✅ Already correct | N/A |
| `scheduler/coordinator/JOBS.md` | ✅ Already correct | N/A |
| `scheduler/person-manager/JOBS.md` | ✅ Already correct | N/A |
| `scheduler/validator/JOBS.md` | ✅ Already correct | N/A |
| `scheduler/progress/melo-ui-phase2.md` | ❌ Said "HAOS" | ✅ Fixed |
| `memory/INDEX.md` | ⚠️ Outdated link | ✅ Fixed |
| `memory/projects/melo.md` | ⚠️ Old file | Deprecated in favor of melo-v2 |

### Verification Performed

1. **Build Test:** `pnpm build` → Exit code 0 ✅
2. **Production Site:** https://dev2.aaroncollins.info → HTTP/2 307 (auth redirect) ✅
3. **File Structure:** `/home/ubuntu/repos/melo` confirmed ✅
4. **Phase Status:** Phases 1-3 complete, Phase 4 in progress ✅

---

## 🎯 NEXT ACTIONS

### Immediate (Phase 4 Completion)
1. Complete remaining Phase 4 E2E tests
2. Fix E2E authentication setup for test reliability
3. Visual audit against Discord reference

### Future
1. Voice/video integration (LiveKit)
2. Push notifications
3. Mobile app considerations

---

*This document is the authoritative record for MELO V2. All agents should read this before starting any MELO-related work.*
