## Active Proactive Jobs

> **Last Updated:** 2026-02-16 12:00 EST  
> **Updated By:** Person Manager (noon check)

### 🚨 CRITICAL — Build Fix Required

#### build-fix-nextjs-errors
- **Status:** pending
- **Priority:** CRITICAL (blocks all deployment)
- **Model:** claude-sonnet-4-20250514
- **Description:** Fix Next.js build errors introduced by recent changes
- **Dependencies:** None (blocks everything else)
- **Issues to Fix:**
  1. `/api/og-preview` route uses `request.url` — add `export const dynamic = 'force-dynamic'`
  2. Event handlers passed to Client Components — add `"use client"` directive to affected components
- **Acceptance Criteria:**
  - [ ] `pnpm build` completes successfully with no errors
  - [ ] All static pages generate correctly
  - [ ] No "Event handlers cannot be passed to Client Component props" errors
  - [ ] Committed and pushed

### Current Priority Batch — Phase 11 & 12 Completion

#### p11-4-privacy-settings
- **Status:** awaiting-verification
- **Started:** 2026-02-16 11:02 EST
- **Priority:** HIGH
- **Model:** claude-sonnet-4-20250514
- **Description:** Privacy settings page with DM controls, blocking, visibility
- **Parent Phase:** p11 (User Experience)
- **Dependencies:** build-fix-nextjs-errors
- **Note:** Code committed (19b3cf7) but build currently failing
- **Acceptance Criteria:**
  - [x] Privacy settings page at /settings/privacy
  - [x] Block/unblock user management
  - [x] DM privacy controls
  - [x] Online status visibility toggle
  - [x] Matrix account data persistence
  - [ ] Build passes ⚠️ BLOCKED

#### p12-5-health-endpoints
- **Status:** awaiting-verification
- **Started:** 2026-02-16 11:02 EST
- **Priority:** HIGH
- **Model:** claude-sonnet-4-20250514
- **Description:** Health check, readiness, and liveness endpoints for production
- **Parent Phase:** p12 (Infrastructure)
- **Dependencies:** build-fix-nextjs-errors
- **Note:** Code committed (973be9b, 7cb073f) but build currently failing
- **Acceptance Criteria:**
  - [x] /api/health endpoint with system info
  - [x] /api/ready endpoint checking Matrix connectivity
  - [x] /api/live liveness probe
  - [x] Proper error handling
  - [ ] Build passes ⚠️ BLOCKED

## Task Queue (Next Up)

### Phase 10 Remaining (2 tasks)
| Task ID | Description | Priority |
|---------|-------------|----------|
| p10-13-server-templates | Create server from templates | MEDIUM |
| p10-14-server-discovery | Explore/search public servers | LOW |

### Phase 11 Remaining (5 tasks after p11-4)
| Task ID | Description | Priority |
|---------|-------------|----------|
| p11-7-appearance-themes | Theme customization and presets | MEDIUM (Stale - Needs Re-Evaluation) |
| p11-9-data-export | Export user data (GDPR) | MEDIUM |
| p11-10-account-deletion | Account deletion flow | MEDIUM |
| p11-11-help-support | Help/support integration | LOW |
| p11-15-onboarding | New user onboarding flow | MEDIUM |

### Phase 12 Remaining (10 tasks after p12-5)
| Task ID | Description | Priority |
|---------|-------------|----------|
| p12-2-background-jobs | Background job queue system | MEDIUM |
| p12-3-monitoring | Performance monitoring | MEDIUM |
| p12-6-logging | Structured logging infrastructure | MEDIUM |
| p12-7-db-optimization | Database query optimization | LOW |
| p12-8-cdn-assets | CDN and asset optimization | LOW |
| p12-10-cicd | CI/CD pipeline | HIGH |
| p12-11-docs-site | Documentation site | LOW |
| p12-12-api-docs | API documentation | MEDIUM |
| p12-14-load-testing | Load testing suite | LOW |
| p12-15-disaster-recovery | Backup and recovery | MEDIUM |

## Worker Status
- **Max Slots:** 2
- **Current:** 0/2 occupied
- **Queue:** build-fix-nextjs-errors (CRITICAL)

## Phase Progress Summary
| Phase | Status | Progress |
|-------|--------|----------|
| Phase 8 | ✅ COMPLETE | 3/3 |
| Phase 9 | ✅ COMPLETE | 8/8 |
| Phase 10 | 🔄 Near Complete | 12/14 (86%) |
| Phase 11 | 🔄 In Progress | 9/15 (60%) |
| Phase 12 | 🔄 In Progress | 5/16 (31%) |
| **TOTAL** | | **37/56 (66%)** |

## Notes
- [2026-02-16 12:00] **CRITICAL BUILD FAILURE** — Person Manager identified Next.js build errors blocking deployment
  - Error 1: `/api/og-preview` uses `request.url` (needs dynamic export)
  - Error 2: Event handlers passed to Client Components (need "use client")
  - Created CRITICAL priority build-fix task
  - p11-4 and p12-5 code is committed but awaiting build fix verification
- [2026-02-16 11:02] Sophie manually spawned workers - fixing Coordinator passivity issue
- [2026-02-16 11:02] Updated Coordinator IDENTITY.md with autonomous execution rules
