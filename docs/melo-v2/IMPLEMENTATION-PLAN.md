# MELO v2 Implementation Plan

**Version:** 1.0  
**Date:** 2025-02-13  
**Status:** Final Audit Synthesis  
**Based On:** All MELO v2 audit documents

---

## Executive Summary

### What We're Building

MELO v2 is a **Discord-styled Matrix client** built on Element Web 1.12.9. It combines:
- **Discord's familiar UI/UX** (servers, channels, message layout)
- **Matrix's protocol strengths** (federation, E2EE, decentralization)
- **MELO-specific features** (self-hosting, privacy controls, enterprise options)

### Why This Approach

| Approach | Effort | Risk | Features |
|----------|--------|------|----------|
| ❌ Build from scratch | 12+ months | High | Limited |
| ❌ Fork Discord | Impossible | N/A | No Matrix |
| ✅ **Reskin Element Web** | 4-5 months | Low | Full Matrix + E2EE |

Element Web already provides **85%+ of required features**. Our work is primarily:
1. **UI reskinning** — Discord-style components over Matrix data
2. **Integration adapters** — Bridging Discord clone patterns to Matrix
3. **Self-host tooling** — Configuration and deployment simplification

### Key Metrics

| Metric | Value |
|--------|-------|
| **Total Effort** | 15-20 weeks (4-5 months) |
| **Team Size** | 2-3 developers |
| **Phases** | 4 major phases |
| **Features Already Done** | 85%+ (via Element Web) |
| **Main Risk** | UI/UX polish, not functionality |

---

## Table of Contents

1. [Phase Overview](#phase-overview)
2. [Phase 0: Foundation](#phase-0-foundation)
3. [Phase 1: Core Integration](#phase-1-core-integration)
4. [Phase 2: UI Reskin](#phase-2-ui-reskin)
5. [Phase 3: Polish & Admin](#phase-3-polish--admin)
6. [Phase 4: Production Readiness](#phase-4-production-readiness)
7. [Task Dependencies](#task-dependencies)
8. [Risk Assessment](#risk-assessment)
9. [Success Criteria](#success-criteria)
10. [Team & Resource Allocation](#team--resource-allocation)
11. [Technical Decisions](#technical-decisions)

---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MELO V2 IMPLEMENTATION ROADMAP                       │
└─────────────────────────────────────────────────────────────────────────────┘

  PHASE 0          PHASE 1           PHASE 2           PHASE 3        PHASE 4
  Foundation       Core Integration   UI Reskin         Polish         Production
  (2 weeks)        (6-8 weeks)       (3-4 weeks)       (3-4 weeks)    (2 weeks)
  ─────────        ───────────       ──────────        ──────────     ──────────
  
  ┌─────────┐     ┌─────────────┐   ┌─────────────┐   ┌──────────┐   ┌─────────┐
  │ Dev     │────>│ Auth        │──>│ Server      │──>│ Settings │──>│ Docs    │
  │ Setup   │     │ Migration   │   │ Sidebar     │   │ UI       │   │ Deploy  │
  └─────────┘     └─────────────┘   └─────────────┘   └──────────┘   └─────────┘
       │               │                  │                 │              │
       ▼               ▼                  ▼                 ▼              ▼
  ┌─────────┐     ┌─────────────┐   ┌─────────────┐   ┌──────────┐   ┌─────────┐
  │ Matrix  │────>│ Real-time   │──>│ Channel     │──>│ Role     │──>│ Perf    │
  │ Infra   │     │ Sync        │   │ Sidebar     │   │ Editor   │   │ Testing │
  └─────────┘     └─────────────┘   └─────────────┘   └──────────┘   └─────────┘
       │               │                  │                 │              │
       ▼               ▼                  ▼                 ▼              ▼
  ┌─────────┐     ┌─────────────┐   ┌─────────────┐   ┌──────────┐   ┌─────────┐
  │ LiveKit │────>│ Core UI     │──>│ Message     │──>│ Audit    │──>│ GA      │
  │ Config  │     │ Integration │   │ Display     │   │ Log UI   │   │ Release │
  └─────────┘     └─────────────┘   └─────────────┘   └──────────┘   └─────────┘
                       │                  │                 │
                       ▼                  ▼                 ▼
                 ┌─────────────┐   ┌─────────────┐   ┌──────────┐
                 │ Media       │──>│ User        │──>│ Discovery│
                 │ Uploads     │   │ Cards       │   │ UI       │
                 └─────────────┘   └─────────────┘   └──────────┘
```

### Phase Summary Table

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| **0: Foundation** | 2 weeks | Dev environment, infrastructure | Working dev stack, Matrix homeserver |
| **1: Core Integration** | 6-8 weeks | Auth, sync, Matrix adapters | Functional Matrix-backed app |
| **2: UI Reskin** | 3-4 weeks | Discord-style components | Visual Discord clone over Matrix |
| **3: Polish & Admin** | 3-4 weeks | Settings, admin, UX | Complete admin experience |
| **4: Production** | 2 weeks | Docs, deployment, testing | Production-ready release |

---

## Phase 0: Foundation

**Duration:** 2 weeks  
**Goal:** Development environment ready, all infrastructure running

### Tasks

| Task | Description | Effort | Owner |
|------|-------------|--------|-------|
| 0.1 Dev environment setup | Monorepo structure, pnpm, TypeScript config | 2 days | Lead |
| 0.2 Matrix homeserver | Synapse on dev2, test accounts | 2 days | DevOps |
| 0.3 LiveKit configuration | Environment vars, JWT service connection | 0.5 days | DevOps |
| 0.4 Element Web fork | Clone, build, verify baseline | 1 day | Lead |
| 0.5 Discord clone extraction | Copy relevant components to MELO repo | 2 days | Frontend |
| 0.6 CI/CD pipeline | GitHub Actions for build/test | 1 day | DevOps |
| 0.7 Development docs | Setup guide, architecture overview | 2 days | Lead |

### Environment Configuration

```bash
# Required environment variables
NEXT_PUBLIC_MATRIX_HOMESERVER=https://matrix.melo.local
MATRIX_ADMIN_TOKEN=syt_xxx  # For admin operations

# LiveKit (existing dev2 setup)
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=LiveKit2026SecretKeyForMatrix
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.dev2.aaroncollins.info

# Build configuration
NODE_ENV=development
```

### Milestone: Phase 0 Complete ✓

- [ ] `pnpm install` works, no errors
- [ ] Local dev server starts (`pnpm dev`)
- [ ] Can connect to Matrix homeserver
- [ ] LiveKit test call succeeds
- [ ] CI builds pass

---

## Phase 1: Core Integration

**Duration:** 6-8 weeks  
**Goal:** Matrix-backed application with all data flowing through Matrix

### 1.1 Authentication Migration (2-3 weeks)

**Replace Clerk with Matrix native authentication**

| Task | Description | Effort |
|------|-------------|--------|
| 1.1.1 MatrixAuthProvider | Core auth context, session management | 3 days |
| 1.1.2 Login page | Matrix-style login form | 2 days |
| 1.1.3 Registration page | Matrix registration with validation | 2 days |
| 1.1.4 Session persistence | Cookie/localStorage token storage | 2 days |
| 1.1.5 Server-side auth | `getMatrixSession()`, `requireAuth()` | 2 days |
| 1.1.6 Middleware | Route protection | 1 day |
| 1.1.7 Remove Clerk | Clean out all Clerk imports | 1 day |

**Key Files to Create:**
```
components/providers/matrix-auth-provider.tsx
lib/matrix-auth.ts
lib/matrix-cookies.ts
app/(auth)/sign-in/page.tsx
app/(auth)/sign-up/page.tsx
middleware.ts
```

**Key Files to Delete:**
```
lib/current-profile.ts
lib/current-profile-pages.ts  
lib/initial-profile.ts
```

### 1.2 Real-Time Migration (2-3 weeks)

**Replace Socket.io with Matrix sync**

| Task | Description | Effort |
|------|-------------|--------|
| 1.2.1 MatrixProvider | Sync state management, room tracking | 3 days |
| 1.2.2 useRoomMessages hook | Real-time messages with Matrix timeline | 3 days |
| 1.2.3 useTypingIndicator hook | Matrix `m.typing` integration | 1 day |
| 1.2.4 usePresence hook | Matrix presence state | 1 day |
| 1.2.5 useReadReceipts hook | Matrix `m.receipt` integration | 1 day |
| 1.2.6 Connection status | Sync state indicator component | 0.5 days |
| 1.2.7 Remove Socket.io | Clean out Socket.io server and client | 1 day |

**Key Files to Create:**
```
providers/matrix-provider.tsx
hooks/use-matrix-client.ts
hooks/use-room-messages.ts
hooks/use-typing-indicator.ts
hooks/use-presence.ts
hooks/use-read-receipts.ts
components/connection-indicator.tsx
```

**Key Files to Delete:**
```
components/providers/socket-provider.tsx
hooks/use-chat-socket.ts
pages/api/socket/  (entire directory)
```

### 1.3 Media Upload Migration (1 week)

**Replace UploadThing with Matrix content repository**

| Task | Description | Effort |
|------|-------------|--------|
| 1.3.1 useMediaUpload hook | Upload with progress, cancellation | 2 days |
| 1.3.2 useMxcUrl hook | mxc:// to HTTP URL conversion | 0.5 days |
| 1.3.3 MatrixImage component | Image display with thumbnails | 1 day |
| 1.3.4 FileUpload component | Dropzone with Matrix upload | 1 day |
| 1.3.5 MessageAttachment component | File/image display in messages | 0.5 days |
| 1.3.6 Remove UploadThing | Clean out UploadThing config and deps | 0.5 days |

**Key Files to Create:**
```
hooks/useMediaUpload.ts
hooks/useMxcUrl.ts
components/matrix-image.tsx
components/file-upload.tsx
components/message-attachment.tsx
```

### 1.4 Core UI Integration (2 weeks)

**Connect Discord UI components to Matrix data**

| Task | Description | Effort |
|------|-------------|--------|
| 1.4.1 Space service | Create/join/leave spaces (servers) | 2 days |
| 1.4.2 Room service | Create/manage rooms (channels) | 2 days |
| 1.4.3 Member service | Membership, roles, power levels | 2 days |
| 1.4.4 Message service | Send/edit/delete with Matrix | 2 days |
| 1.4.5 DM service | Direct message rooms | 1 day |
| 1.4.6 Invite service | Invite codes → Matrix invites | 1 day |

**Key Files to Create:**
```
services/matrix-space.ts
services/matrix-room.ts
services/matrix-member.ts
services/matrix-message.ts
services/matrix-dm.ts
services/matrix-invite.ts
```

### Milestone: Phase 1 Complete ✓

- [ ] Can register/login with Matrix credentials
- [ ] Real-time messages work via Matrix sync
- [ ] File uploads store in Matrix content repo
- [ ] Can create/join spaces and rooms
- [ ] Direct messages work
- [ ] No Clerk, Socket.io, or UploadThing dependencies remain

---

## Phase 2: UI Reskin

**Duration:** 3-4 weeks  
**Goal:** Discord-style visual experience over Matrix data

### 2.1 Navigation Components (1 week)

| Task | Description | Effort |
|------|-------------|--------|
| 2.1.1 Server sidebar | Space list with Discord-style icons | 2 days |
| 2.1.2 Server icon | Space avatar with fallback initial | 0.5 days |
| 2.1.3 Add server button | Create space modal trigger | 0.5 days |
| 2.1.4 User button | Profile menu in sidebar | 1 day |
| 2.1.5 Quick switcher | Ctrl+K command palette | 1 day |

### 2.2 Channel Components (1 week)

| Task | Description | Effort |
|------|-------------|--------|
| 2.2.1 Channel sidebar | Room list grouped by type | 2 days |
| 2.2.2 Channel categories | Collapsible sections | 1 day |
| 2.2.3 Channel item | Room with type icon, actions | 1 day |
| 2.2.4 Member list | Room members with roles | 1 day |

### 2.3 Message Components (1 week)

| Task | Description | Effort |
|------|-------------|--------|
| 2.3.1 Message list | Timeline with infinite scroll | 2 days |
| 2.3.2 Message item | Discord-style message layout | 1 day |
| 2.3.3 Message input | Composer with emoji, attachments | 1 day |
| 2.3.4 Message actions | Edit, delete, react, reply | 1 day |

### 2.4 Modals (1 week)

| Task | Description | Effort |
|------|-------------|--------|
| 2.4.1 Create server modal | Space creation wizard | 1 day |
| 2.4.2 Server settings modal | Space settings tabs | 1 day |
| 2.4.3 Channel modals | Create/edit channel dialogs | 1 day |
| 2.4.4 Invite modal | Invite link with copy | 0.5 days |
| 2.4.5 Member management modal | Role assignment, kick | 1 day |

### Milestone: Phase 2 Complete ✓

- [ ] Server sidebar looks like Discord
- [ ] Channel list has categories and icons
- [ ] Messages display Discord-style
- [ ] All modals follow Discord patterns
- [ ] Navigation feels like Discord

---

## Phase 3: Polish & Admin

**Duration:** 3-4 weeks  
**Goal:** Complete admin experience, polished UX

### 3.1 Settings UI (1 week)

| Task | Description | Effort |
|------|-------------|--------|
| 3.1.1 User settings | Profile, appearance, privacy | 2 days |
| 3.1.2 Server settings | General, roles, moderation | 2 days |
| 3.1.3 Channel settings | Permissions, topic, slowmode | 1 day |

### 3.2 Role Management (1 week)

| Task | Description | Effort |
|------|-------------|--------|
| 3.2.1 Role editor | Visual role creation/editing | 2 days |
| 3.2.2 Permission matrix | Checkboxes for all permissions | 2 days |
| 3.2.3 Role assignment | Drag-drop or select UI | 1 day |

### 3.3 Admin Features (1 week)

| Task | Description | Effort |
|------|-------------|--------|
| 3.3.1 Audit log UI | Visual log viewer with filters | 2 days |
| 3.3.2 Moderation tools | Ban, kick, mute UI | 2 days |
| 3.3.3 Server discovery | Browse/search public servers | 1 day |

### 3.4 Onboarding (0.5 week)

| Task | Description | Effort |
|------|-------------|--------|
| 3.4.1 First-run experience | Welcome flow, create first server | 2 days |
| 3.4.2 Server templates | Pre-configured server options | 1 day |

### 3.5 LiveKit Polish (0.5 week)

| Task | Description | Effort |
|------|-------------|--------|
| 3.5.1 Voice channel UI | Join/leave voice rooms | 1 day |
| 3.5.2 Video call styling | MELO-themed call UI | 1 day |
| 3.5.3 Screen share polish | Better screen share UX | 0.5 days |

### Milestone: Phase 3 Complete ✓

- [ ] All settings pages functional
- [ ] Role editor works like Discord
- [ ] Audit log shows all actions
- [ ] New users get guided onboarding
- [ ] Voice/video calls work smoothly

---

## Phase 4: Production Readiness

**Duration:** 2 weeks  
**Goal:** Production-quality release

### 4.1 Documentation (0.5 week)

| Task | Description | Effort |
|------|-------------|--------|
| 4.1.1 User guide | End-user documentation | 1 day |
| 4.1.2 Admin guide | Server administration docs | 1 day |
| 4.1.3 Self-host guide | Docker, config, deployment | 1 day |

### 4.2 Performance (0.5 week)

| Task | Description | Effort |
|------|-------------|--------|
| 4.2.1 Bundle optimization | Code splitting, lazy loading | 1 day |
| 4.2.2 Sync optimization | Efficient Matrix sync filtering | 1 day |
| 4.2.3 Image optimization | Thumbnail sizes, caching | 0.5 days |

### 4.3 Testing (0.5 week)

| Task | Description | Effort |
|------|-------------|--------|
| 4.3.1 E2E tests | Critical user flows | 2 days |
| 4.3.2 Load testing | Concurrent users, message throughput | 1 day |

### 4.4 Deployment (0.5 week)

| Task | Description | Effort |
|------|-------------|--------|
| 4.4.1 Docker images | Production Docker builds | 1 day |
| 4.4.2 Helm charts | Kubernetes deployment | 1 day |
| 4.4.3 Release automation | Version tagging, changelog | 0.5 days |

### Milestone: Phase 4 Complete ✓

- [ ] Documentation complete
- [ ] Performance meets targets
- [ ] E2E tests pass
- [ ] Docker images published
- [ ] v1.0.0 released

---

## Task Dependencies

### Critical Path

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CRITICAL PATH                                  │
│                                                                        │
│  Phase 0 ─────► Auth ─────► Sync ─────► Core UI ─────► Sidebars ────►│
│  (2 wks)       (3 wks)     (3 wks)     (2 wks)        (1 wk)          │
│                                                                        │
│  Total Critical Path: 11 weeks                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Parallel Work Opportunities

| Track A (Backend) | Track B (Frontend) | Track C (DevOps) |
|-------------------|-------------------|------------------|
| Auth migration | UI component extraction | CI/CD setup |
| Matrix services | Styling/theming | Docker builds |
| Media upload | Modal components | Documentation |

### Dependency Matrix

| Task | Depends On |
|------|------------|
| Auth migration | Phase 0 complete |
| Sync migration | Auth migration |
| Media upload | Auth migration |
| Core UI integration | Auth + Sync |
| Server sidebar | Core UI integration |
| Channel sidebar | Core UI integration |
| Message display | Core UI integration |
| Settings UI | Sidebars |
| Role editor | Settings UI |

---

## Risk Assessment

### High Risk

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Matrix SDK complexity | Schedule slip | Medium | Use Element's abstractions, not raw SDK |
| Performance issues with sync | Poor UX | Low | Use sync filters, lazy loading |
| E2EE integration issues | Security concerns | Low | Element already handles this well |

### Medium Risk

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| UI/UX polish takes longer | Delayed release | Medium | Prioritize core flows, defer nice-to-haves |
| Federation edge cases | Bugs in production | Medium | Test with multiple homeservers |
| LiveKit compatibility | Voice/video issues | Low | Already tested on dev2, minor changes only |

### Low Risk

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Dependency updates break build | Dev slowdown | Low | Lock versions, renovate bot |
| Team availability | Schedule slip | Low | Document everything, knowledge sharing |

---

## Success Criteria

### Phase 0 Success

| Criteria | Measurement |
|----------|-------------|
| Dev environment works | All devs can run local build |
| Matrix connected | Test messages send/receive |
| CI/CD operational | Green builds on PRs |

### Phase 1 Success

| Criteria | Measurement |
|----------|-------------|
| Auth works | Login/logout/register functional |
| Real-time works | Messages appear < 500ms |
| No legacy deps | Zero Clerk/Socket.io/UploadThing code |

### Phase 2 Success

| Criteria | Measurement |
|----------|-------------|
| Looks like Discord | Side-by-side comparison passes |
| Navigation intuitive | New user can find features |
| Responsive | Works on mobile viewport |

### Phase 3 Success

| Criteria | Measurement |
|----------|-------------|
| Admin complete | All settings accessible |
| Moderation works | Can ban/kick/mute |
| Onboarding smooth | First-run < 2 min to first message |

### Phase 4 Success

| Criteria | Measurement |
|----------|-------------|
| Docs complete | All features documented |
| Performance good | < 3s initial load, < 100ms message send |
| Production ready | Docker image runs without config errors |

### Overall v1.0 Success

| Criteria | Measurement |
|----------|-------------|
| Feature parity | All Discord clone features work |
| Matrix-native | Federation, E2EE work correctly |
| Self-hostable | One-command Docker deployment |
| Stable | No crashes in 24h stress test |

---

## Team & Resource Allocation

### Recommended Team

| Role | Count | Responsibilities |
|------|-------|------------------|
| **Lead Developer** | 1 | Architecture, Matrix integration, code review |
| **Frontend Developer** | 1-2 | UI components, styling, React work |
| **DevOps/Infrastructure** | 0.5 | CI/CD, Docker, deployment, Matrix server |

### Phase Allocation

| Phase | Lead | Frontend | DevOps |
|-------|------|----------|--------|
| 0: Foundation | 60% | 20% | 80% |
| 1: Integration | 80% | 40% | 20% |
| 2: UI Reskin | 20% | 90% | 10% |
| 3: Polish | 40% | 60% | 20% |
| 4: Production | 30% | 20% | 80% |

### Skill Requirements

**Must Have:**
- React/TypeScript expertise
- Matrix protocol familiarity (can learn)
- WebSocket/real-time experience

**Nice to Have:**
- Element Web codebase knowledge
- WebRTC/LiveKit experience
- Docker/Kubernetes experience

---

## Technical Decisions

### Already Decided (From Audits)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Base** | Element Web 1.12.9 | 85% features done, proven at scale |
| **Auth** | Matrix native | Self-contained, no external deps |
| **Real-time** | Matrix sync | Native to protocol, federation ready |
| **Media** | Matrix content repo | No external service, federated |
| **Voice/Video** | LiveKit via MatrixRTC | Already configured on dev2 |
| **E2EE** | Matrix Megolm/Olm | Industry standard, Element implements |

### To Be Decided

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **State Management** | Zustand vs Redux vs React Query | Zustand (Discord clone uses it) |
| **Styling** | Tailwind vs CSS Modules vs styled-components | Tailwind (Discord clone uses it) |
| **Component Library** | Radix vs shadcn/ui vs custom | Radix (Discord clone uses it) |
| **Build Tool** | Next.js vs Vite | Keep Next.js (Discord clone stack) |
| **Monorepo** | Turborepo vs Nx vs pnpm workspaces | pnpm workspaces (simpler) |

### Custom Matrix State Events

| Event Type | Purpose | State Key |
|------------|---------|-----------|
| `io.melo.server` | Server metadata (inviteCode, ownerId) | `''` |
| `io.melo.channel` | Channel type (TEXT/AUDIO/VIDEO) | `''` |
| `io.melo.channel_order` | Channel ordering in space | `''` |
| `io.melo.member_role` | Display role name | `{userId}` |
| `io.melo.profile` | Extended profile data | Account data |

---

## Quick Reference

### File Structure (Target)

```
melo-v2/
├── apps/
│   └── web/                      # Next.js frontend
│       ├── app/                  # Next.js app router
│       │   ├── (auth)/          # Auth routes
│       │   ├── (main)/          # Main app routes
│       │   └── api/             # API routes
│       ├── components/
│       │   ├── ui/              # Base UI components (Radix)
│       │   ├── navigation/      # Sidebar components
│       │   ├── server/          # Server (space) components
│       │   ├── chat/            # Message components
│       │   ├── modals/          # Modal dialogs
│       │   └── providers/       # React context providers
│       ├── hooks/               # Custom React hooks
│       ├── services/            # Matrix service layer
│       └── lib/                 # Utilities
├── packages/
│   └── matrix-adapter/          # Matrix SDK wrapper (optional)
├── docs/                        # Documentation
└── docker/                      # Docker configuration
```

### Key Commands

```bash
# Development
pnpm install                     # Install dependencies
pnpm dev                         # Start dev server
pnpm build                       # Production build
pnpm test                        # Run tests

# Docker
docker compose up -d             # Start all services
docker compose logs -f melo      # View logs
docker compose down              # Stop services
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_MATRIX_HOMESERVER=https://matrix.example.com
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.example.com

# Optional
MATRIX_ADMIN_TOKEN=syt_xxx       # For admin operations
NEXT_PUBLIC_BRAND_NAME=MELO      # Custom branding
```

---

## Appendix: Audit Document References

| Document | Key Findings |
|----------|-------------|
| [FRONTEND-AUDIT.md](./FRONTEND-AUDIT.md) | 53 components, 5 hooks, 16 API routes |
| [BACKEND-MAPPING.md](./BACKEND-MAPPING.md) | Prisma → Matrix entity mapping |
| [AUTH-STRATEGY.md](./AUTH-STRATEGY.md) | Clerk → Matrix auth migration |
| [REALTIME-STRATEGY.md](./REALTIME-STRATEGY.md) | Socket.io → Matrix sync migration |
| [MEDIA-STRATEGY.md](./MEDIA-STRATEGY.md) | UploadThing → Matrix content repo |
| [LIVEKIT-INTEGRATION.md](./LIVEKIT-INTEGRATION.md) | LiveKit already compatible |
| [FEATURE-GAPS.md](./FEATURE-GAPS.md) | 85% features via Element, gaps identified |

---

*Document generated: 2025-02-13*  
*MELO v2 Audit Complete*
