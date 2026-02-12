# Proactive Jobs - HAOS v2 (Discord Clone + Matrix Backend)

> 🚨 **STRATEGIC PIVOT [2026-02-11]**
> Using Discord clone frontend + Matrix backend instead of Element reskinning
> Source: https://github.com/nayak-nirmalya/discord-clone

> 🔢 **RUN 1 TASK AT A TIME** — No resource conflicts

> 🧠 **MODEL:** Use **Sonnet** for implementation tasks

---

## Current Priority: Phase 0 - Foundation

Task breakdown complete! Starting Phase 0 implementation.

See: `~/clawd/docs/haos-v2/TASK-BREAKDOWN.md` for full task list (94 tasks across 4 phases)

---

## Phase 0 Tasks (Ready to Execute)

### p0-1-a: Initialize Monorepo Structure ✅
- **Status:** completed
- **Completed:** 2026-02-11 12:16 PM EST
- **Summary:** Monorepo initialized with pnpm workspace. All 3 projects detected. Minor note: matrix-js-sdk dependency in pre-existing web app needs `onlyBuiltDependencies` config later.

### p0-1-b: Configure TypeScript ✅
- **Status:** completed
- **Completed:** 2026-02-11 12:32 PM EST
- **Summary:** Created tsconfig.base.json (strict mode, ES2022, path aliases), apps/web/tsconfig.json, packages/shared/tsconfig.json, and root tsconfig.json with project references. `pnpm exec tsc --noEmit` passes.

### p0-1-c: Configure ESLint & Prettier ✅
- **Status:** completed
- **Completed:** 2026-02-11 12:47 PM EST
- **Summary:** Created .eslintrc.js (TypeScript, React, Next.js rules), .prettierrc (with Tailwind plugin), .prettierignore, and added lint/format scripts. `pnpm lint` and `pnpm format:check` both pass.

### p0-5-a: Initialize Next.js 14 App ✅
- **Status:** completed
- **Completed:** 2026-02-11 1:00 PM EST
- **Summary:** Created Next.js 14 app structure with dark theme. `pnpm dev` runs on localhost:3000.

### p0-4-a: Clone Discord Clone Repository ✅
- **Status:** completed
- **Completed:** 2026-02-11 1:15 PM EST
- **Summary:** Discord clone repo cloned to /tmp/discord-clone-source. Working tree clean.

### p0-4-b: Audit Discord Clone Structure ✅
- **Status:** completed
- **Completed:** 2026-02-11 1:31 PM EST
- **Summary:** Created comprehensive inventory at `~/clawd/docs/haos-v2/DISCORD-CLONE-INVENTORY.md` documenting all components, hooks, utilities, and Matrix adaptation needs.

### p0-4-c: Copy UI Components to HAOS ✅
- **Status:** completed
- **Completed:** 2026-02-11 2:30 PM EST
- **Summary:** 19 shadcn/ui components copied to `apps/web/src/components/ui/` with index.ts barrel export. Imports use relative paths (`../../lib/utils`). Dependencies already present in Element Web package.json. `components.json` configured.
- **Note:** Build fails due to pre-existing monorepo resolution bug (unrelated to this task) - see p0-fix-build

### p0-fix-build: Fix Monorepo Build Resolution Bug ❌ ABANDONED
- **Status:** abandoned
- **Abandoned:** 2026-02-11 11:00 PM EST
- **Reason:** Intractable tech debt from Element Web fork. Multiple sub-agents hit the same wall (webpack resolution + yarn workspace hoisting + lodash alias conflicts). Strategic decision: focus on haos-v2 instead of fixing legacy code.
- **See:** `scheduler/progress/p0-fix-build.md` for full failure analysis
- **See:** `/home/ubuntu/repos/haos/DEPRECATED.md` for deprecation notice

### p0-4-e: Copy Styling and Tailwind Config ✅
- **Status:** completed
- **Completed:** 2026-02-11 9:19 PM EST
- **Summary:** Tailwind v3 configured with dark theme CSS variables. Used `.cjs` extensions for configs (ESM compatibility). JIT compiles in 246ms.

### p0-6-a: Create GitHub Actions Build Workflow
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** p0-1-a
- **Description:** CI that builds on every PR
- **Instructions:**
  1. Create `.github/workflows/build.yml`
  2. Workflow steps:
     - Checkout code
     - Setup Node.js 20
     - Setup pnpm
     - Install dependencies
     - Run lint
     - Run type-check
     - Run build
  3. Trigger on push to main and PRs
- **Success Criteria:**
  - Workflow file valid YAML
  - Would run on PR (can't test until repo on GitHub)
- **Files to Create:**
  - `/home/ubuntu/repos/haos/.github/workflows/build.yml`

### p0-7-a: Create Development Setup Guide
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** p0-5-a
- **Description:** Complete setup instructions for new devs
- **Instructions:**
  1. Create `docs/haos-v2/DEV-SETUP.md`
  2. Include sections:
     - Prerequisites (Node 20+, pnpm 8+)
     - Clone and install steps
     - Environment variable setup
     - Running dev server
     - Connecting to Matrix (dev2)
     - Troubleshooting common issues
- **Success Criteria:**
  - Doc is complete and accurate
  - A new dev could follow it
- **Files to Create:**
  - `~/clawd/docs/haos-v2/DEV-SETUP.md`

---

## Phase 0 Verification Tasks

### p0-verify: Phase 0 Completion Check
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** All p0-* tasks
- **Description:** Verify all Phase 0 milestones met
- **Instructions:**
  1. Run `pnpm install` — should succeed
  2. Run `pnpm dev` — should start Next.js
  3. Run `pnpm lint` — should pass
  4. Run `pnpm build` — should succeed
  5. Verify UI components render
  6. Document any issues found
  7. Update PROACTIVE-JOBS.md to add Phase 1 tasks
- **Success Criteria:**
  - All checks pass
  - Ready to start Phase 1

---

## Completed Tasks

### impl-00-task-breakdown ✅
- **Completed:** 2025-02-13
- **Deliverable:** `~/clawd/docs/haos-v2/TASK-BREAKDOWN.md`
- **Summary:** 94 atomic tasks across 4 phases, all with clear deliverables and success criteria

---

## Completed Audits

### audit-08-implementation-plan ✅
- Created: ~/clawd/docs/haos-v2/IMPLEMENTATION-PLAN.md
- Summary: Comprehensive 4-phase plan (15-20 weeks), all dependencies mapped

### audit-07-feature-gaps ✅
- Created: ~/clawd/docs/haos-v2/FEATURE-GAPS.md
- Summary: 85% features via Element, gaps identified (E2EE, federation, etc.)

### audit-06-livekit-integration ✅
- Created: ~/clawd/docs/haos-v2/LIVEKIT-INTEGRATION.md
- Summary: LiveKit already compatible with dev2 setup

### audit-01-frontend-analysis ✅
- Created: ~/clawd/docs/haos-v2/FRONTEND-AUDIT.md
- Summary: 53 components, 24 routes, clean Next.js 13 structure

### audit-02-backend-mapping ✅
- Created: ~/clawd/docs/haos-v2/BACKEND-MAPPING.md
- Summary: Prisma → Matrix mapping complete

### audit-03-auth-strategy ✅
- Created: ~/clawd/docs/haos-v2/AUTH-STRATEGY.md
- Summary: Clerk → Matrix auth migration planned

### audit-04-realtime-strategy ✅
- Created: ~/clawd/docs/haos-v2/REALTIME-STRATEGY.md
- Summary: Socket.io → Matrix sync migration planned (1709 lines)
- Covers: Messages, typing indicators, presence, read receipts

### audit-05-media-strategy ✅
- Created: ~/clawd/docs/haos-v2/MEDIA-STRATEGY.md
- Summary: UploadThing → Matrix content API migration (1519 lines)
- Covers: File uploads, thumbnails, avatars, security

---

## Completed Infrastructure (The Counsel & Circle)

### The Counsel ✅
- Spec: ~/clawd/docs/THE-COUNSEL.md
- Skill: ~/clawd/skills/counsel/SKILL.md
- Multi-agent voting for critical decisions

### The Circle ✅
- Spec: ~/clawd/docs/THE-CIRCLE.md
- Skill: ~/clawd/skills/circle/SKILL.md
- Multi-perspective thinking framework

---

## Archived (Low Priority)

All cog-* tasks archived - the core framework is done. Refinements can happen later.
