# Proactive Jobs - HAOS v2 (Matrix-Powered Discord Clone)

> 🚨 **STRATEGIC PIVOT [2026-02-11]**
> Abandoned: Reskinning Element Web (too complex, fighting architecture)
> New Approach: Discord clone frontend + Matrix backend
> Source: https://github.com/nayak-nirmalya/discord-clone

> 🔢 **RUN 1 TASK AT A TIME**
> - Only 1 task `in-progress` at a time (avoid browser/resource conflicts)
> - Each task completes fully before next starts
> - Use browser tools properly: zoomclick, browser action

> 📝 **FULL COMPLETION STANDARD**
> - "Done" means **PRODUCTION READY**
> - If you struggle with browser, use Opus and read TOOLS.md for zoomclick instructions

---

## Current Task (In-Progress)

(None - starting fresh)

---

## Phase 1: Comprehensive Audit (Sequential)

### audit-01-frontend-analysis
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** in-progress
- **Started:** 2026-02-11 00:30 EST
- **Description:** Analyze Discord clone frontend structure
- **Instructions:**
  1. Read all files in /home/ubuntu/repos/discord-clone-reference/
  2. Document every component in components/
  3. Document all routes in app/
  4. Document all API routes
  5. List all third-party dependencies
  6. Create /home/ubuntu/clawd/docs/haos-v2/FRONTEND-AUDIT.md with findings
  7. Send Slack summary when complete

### audit-02-backend-mapping
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Map Discord clone backend → Matrix equivalents
- **Instructions:**
  1. Read prisma/schema.prisma - document all models
  2. For EACH model, identify Matrix equivalent:
     - Server → Matrix Space
     - Channel → Matrix Room
     - Member → Room membership
     - Message → Matrix event
     - etc.
  3. Read all API routes in app/api/ and pages/api/
  4. Map each API to Matrix SDK calls
  5. Create /home/ubuntu/clawd/docs/haos-v2/BACKEND-MAPPING.md
  6. Send Slack summary when complete

### audit-03-auth-strategy
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan auth migration from Clerk → Matrix
- **Instructions:**
  1. Document all Clerk usage in the codebase (grep for @clerk)
  2. Document Matrix login/auth flow
  3. Plan migration:
     - Matrix login page
     - Session management
     - User profile from Matrix
  4. Create /home/ubuntu/clawd/docs/haos-v2/AUTH-STRATEGY.md
  5. Send Slack summary when complete

### audit-04-realtime-strategy
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan Socket.io → Matrix sync migration
- **Instructions:**
  1. Document all Socket.io usage (grep for socket)
  2. Document Matrix sync API and event streaming
  3. Plan migration:
     - Real-time messages via Matrix sync
     - Typing indicators
     - Presence (online/offline)
     - Room state changes
  4. Create /home/ubuntu/clawd/docs/haos-v2/REALTIME-STRATEGY.md
  5. Send Slack summary when complete

### audit-05-media-strategy
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan file uploads migration
- **Instructions:**
  1. Document UploadThing usage
  2. Document Matrix content API (mxc:// URLs)
  3. Plan migration:
     - File upload to Matrix homeserver
     - Image/video attachments
     - Avatar uploads
  4. Create /home/ubuntu/clawd/docs/haos-v2/MEDIA-STRATEGY.md
  5. Send Slack summary when complete

### audit-06-livekit-integration
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Verify LiveKit compatibility (already have it!)
- **Instructions:**
  1. Document how Discord clone uses LiveKit
  2. Document our existing LiveKit setup (dev2)
  3. Verify they're compatible
  4. Plan any adjustments needed
  5. Create /home/ubuntu/clawd/docs/haos-v2/LIVEKIT-INTEGRATION.md
  6. Send Slack summary when complete

### audit-07-feature-gap-analysis
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Identify features in Discord clone vs what we need
- **Instructions:**
  1. List ALL features in the Discord clone
  2. List features we want that are missing:
     - E2E encryption (Matrix has this)
     - Federation (Matrix has this)
     - Private mode
     - Roles/permissions (more granular)
  3. Prioritize missing features
  4. Create /home/ubuntu/clawd/docs/haos-v2/FEATURE-GAPS.md
  5. Send Slack summary when complete

### audit-08-self-hosting-plan
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan self-hosting infrastructure
- **Instructions:**
  1. Document required services:
     - Synapse (Matrix homeserver)
     - PostgreSQL
     - LiveKit
     - HAOS frontend (Next.js)
  2. Create Docker Compose stack plan
  3. Plan private federation mode
  4. Create /home/ubuntu/clawd/docs/haos-v2/SELF-HOSTING-PLAN.md
  5. Send Slack summary when complete

### audit-09-migration-existing-code
- **Type:** audit
- **Min Model:** opus
- **Priority:** high
- **Status:** pending
- **Description:** Determine what to keep from current HAOS work
- **Instructions:**
  1. Review /home/ubuntu/repos/haos/apps/web/src/haos/
  2. Identify reusable code:
     - Matrix SDK integration patterns
     - Voice/video components
     - Any useful utilities
  3. List code to port to new HAOS v2
  4. Create /home/ubuntu/clawd/docs/haos-v2/MIGRATION-FROM-V1.md
  5. Send Slack summary when complete

### audit-10-final-implementation-plan
- **Type:** planning
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Create comprehensive implementation plan
- **Instructions:**
  1. Read ALL audit documents created (audit-01 through audit-09)
  2. Create implementation phases:
     - Phase 1: Project setup + Matrix SDK integration
     - Phase 2: Auth system (Matrix login)
     - Phase 3: Core messaging (Matrix rooms/events)
     - Phase 4: Real-time sync
     - Phase 5: Voice/video (LiveKit)
     - Phase 6: File uploads
     - Phase 7: Advanced features
     - Phase 8: Self-hosting
  3. Break each phase into atomic tasks
  4. Estimate time for each task
  5. Create /home/ubuntu/clawd/docs/haos-v2/IMPLEMENTATION-PLAN.md
  6. Create new PROACTIVE-JOBS.md with all implementation tasks
  7. Send Slack summary: "Audit complete! Implementation plan ready."

---

## Archived Tasks (Old HAOS v1 - Deprioritized)

All previous haos-* tasks are archived. The Element Web approach was too complex.
We're pivoting to the Discord clone + Matrix backend approach.

### haos-phase5-notifications (ARCHIVED)
- **Status:** archived
- **Reason:** Pivoting to HAOS v2 approach

### haos-phase7-ux-refinements (ARCHIVED)
- **Status:** archived
- **Reason:** Pivoting to HAOS v2 approach

(All other haos-* tasks archived - see git history for details)

---

## Notes

**Why the pivot?**
- Element Web's architecture is deeply entangled
- Discord clone is clean Next.js 13 with shadcn/ui
- Easier to swap backend than reskin complex frontend
- We keep Matrix's killer features: E2EE, federation, self-hosting

**What we're keeping:**
- Matrix/Synapse homeserver
- LiveKit for voice/video
- E2E encryption capabilities
- Federation support
- Private mode concept

**What we're replacing:**
- Element Web frontend → Discord clone frontend
- Element's React components → shadcn/ui components
- Element's complex state → Zustand + React Query
