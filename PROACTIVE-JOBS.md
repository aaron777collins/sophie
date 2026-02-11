# Proactive Jobs - HAOS v2 (Discord Clone + Matrix Backend)

> 🚨 **STRATEGIC PIVOT [2026-02-11]**
> Using Discord clone frontend + Matrix backend instead of Element reskinning
> Source: https://github.com/nayak-nirmalya/discord-clone

> 🔢 **RUN 1 TASK AT A TIME** — No resource conflicts

> 🧠 **MODEL:** Use **Sonnet** for implementation tasks

---

## Current Priority: HAOS v2 Phase 0 - Foundation

Phase 0 establishes the development environment and infrastructure.
Full task breakdown: ~/clawd/docs/haos-v2/TASK-BREAKDOWN.md

---

## Phase 0 Tasks (Ready to Execute)

### haos-0.1-monorepo-setup
- **Status:** pending
- **Min Model:** sonnet
- **Description:** Create monorepo structure with pnpm workspaces
- **Instructions:**
  1. Create new directory structure: `~/repos/haos-v2/`
  2. Create root `package.json` with pnpm workspaces config
  3. Create `pnpm-workspace.yaml` pointing to `apps/*` and `packages/*`
  4. Create `apps/web/package.json` with Next.js 14 dependencies
  5. Create `apps/web/next.config.js` with proper configuration
  6. Create `tsconfig.json` and `tsconfig.base.json` for TypeScript
  7. Set up path aliases (`@/` for apps/web/src)
  8. Add `.eslintrc.js` and `.prettierrc` for linting
  9. Add `.editorconfig` and `.gitignore`
  10. Verify: `pnpm install` succeeds, `pnpm dev` starts Next.js
  11. Create initial git commit
- **Success Criteria:**
  - `pnpm install` runs without errors
  - `pnpm dev` starts Next.js dev server
  - TypeScript compilation passes
- **Output:** Announce to Slack #aibot-chat when done

### haos-0.2-tailwind-setup
- **Status:** pending
- **Depends on:** haos-0.1-monorepo-setup
- **Min Model:** sonnet
- **Description:** Configure Tailwind CSS with Discord-like dark theme
- **Instructions:**
  1. Install Tailwind CSS, PostCSS, Autoprefixer in apps/web
  2. Create `apps/web/tailwind.config.ts` with Discord color palette:
     - Background: #313338, #2b2d31, #1e1f22
     - Brand: #5865F2 (blurple)
     - Text: #dbdee1 (light), #949ba4 (muted)
  3. Create `apps/web/app/globals.css` with Tailwind directives
  4. Add custom utility classes for Discord patterns
  5. Test: Create a simple page with Discord colors
- **Success Criteria:**
  - Tailwind classes apply in components
  - Dark theme matches Discord aesthetic

### haos-0.3-discord-clone-extraction
- **Status:** pending
- **Depends on:** haos-0.2-tailwind-setup
- **Min Model:** sonnet
- **Description:** Extract UI components from Discord clone repo
- **Instructions:**
  1. Clone https://github.com/nayak-nirmalya/discord-clone locally
  2. Copy `components/ui/*.tsx` to `apps/web/components/ui/`
  3. Copy `components/navigation/*.tsx` (strip Clerk imports)
  4. Copy `components/modals/*.tsx` (strip Prisma imports)
  5. Copy `components/chat/*.tsx` (strip database queries)
  6. Copy `lib/utils.ts` (cn function, etc.)
  7. Add TODO comments where Matrix integration needed
  8. Install required dependencies: @radix-ui/*, lucide-react, etc.
  9. Verify: `pnpm build` passes (components may have placeholders)
- **Success Criteria:**
  - All base UI components available
  - No Clerk/Prisma imports remain
  - Build passes

### haos-0.4-matrix-sdk-setup
- **Status:** pending
- **Depends on:** haos-0.1-monorepo-setup
- **Min Model:** sonnet
- **Description:** Set up Matrix JS SDK and environment configuration
- **Instructions:**
  1. Install `matrix-js-sdk` in apps/web
  2. Create `apps/web/.env.example` with:
     - NEXT_PUBLIC_MATRIX_HOMESERVER
     - LIVEKIT_API_KEY
     - LIVEKIT_API_SECRET
     - NEXT_PUBLIC_LIVEKIT_URL
  3. Create `apps/web/lib/matrix-client.ts` with client factory function
  4. Create `apps/web/types/matrix.ts` with common types
  5. Test: Import SDK and create client (don't connect yet)
- **Success Criteria:**
  - matrix-js-sdk installed and importable
  - Environment variables documented
  - Client factory function works

### haos-0.5-matrix-homeserver-verify
- **Status:** pending
- **Min Model:** sonnet
- **Description:** Verify Matrix homeserver on dev2 and create test accounts
- **Instructions:**
  1. Test connectivity: `curl https://matrix.dev2.aaroncollins.info/_matrix/client/versions`
  2. Check if CORS is configured for localhost development
  3. Create test user accounts if needed (via admin API)
  4. Create a test space with #general, #random rooms
  5. Document the Matrix homeserver URL and any required config
  6. Update `.env.local` with correct homeserver URL
- **Success Criteria:**
  - Can reach Matrix homeserver from dev machine
  - Test accounts exist
  - CORS allows localhost requests

### haos-0.6-cicd-pipeline
- **Status:** pending
- **Depends on:** haos-0.1-monorepo-setup
- **Min Model:** sonnet
- **Description:** Set up GitHub Actions CI/CD pipeline
- **Instructions:**
  1. Create `.github/workflows/build.yml`:
     - Run on PR and push to main
     - Install pnpm dependencies (with caching)
     - Run TypeScript type check
     - Run ESLint
     - Run build
  2. Set up branch protection rules (require CI pass)
  3. Optionally: Add preview deployment workflow
- **Success Criteria:**
  - CI runs on every PR
  - Build, lint, type-check all pass
  - Failed CI blocks merge

### haos-0.7-development-docs
- **Status:** pending
- **Depends on:** haos-0.3-discord-clone-extraction
- **Min Model:** sonnet
- **Description:** Create development documentation
- **Instructions:**
  1. Create `README.md` with project overview and quick start
  2. Create `docs/haos-v2/SETUP-GUIDE.md` with detailed setup steps
  3. Create `docs/haos-v2/ARCHITECTURE.md` with component structure
  4. Create `docs/haos-v2/CONVENTIONS.md` with coding standards
  5. Create `docs/haos-v2/MATRIX-PATTERNS.md` with SDK usage patterns
- **Success Criteria:**
  - New developer can set up in <30 min following guide
  - Architecture is documented
  - Coding conventions established

---

## Next Phase Preview: Phase 1 - Core Integration

After Phase 0 completes, Phase 1 tasks will be added:
- 1.1 Authentication Migration (Clerk → Matrix)
- 1.2 Real-Time Migration (Socket.io → Matrix sync)
- 1.3 Media Upload Migration (UploadThing → Matrix content)
- 1.4 Core UI Integration (Services for space/room/member/message)

---

## Completed Tasks

### impl-00-task-breakdown ✅
- Created: ~/clawd/docs/haos-v2/TASK-BREAKDOWN.md
- Summary: 307 atomic sub-tasks across 4 phases, ~600h estimated

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
