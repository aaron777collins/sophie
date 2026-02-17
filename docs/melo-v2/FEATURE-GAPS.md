# MELO v2 Feature Gap Analysis

**Audit Task:** `audit-07-feature-gaps`  
**Date:** 2025-02-11  
**Status:** Complete

---

## Executive Summary

MELO v2 is built on **Element Web 1.12.9**, a full-featured Matrix client. This gives us the vast majority of required features out of the box. The Discord clone reference adds UI/UX patterns that need Matrix integration. This document identifies what's already available, what's missing, and what needs to be built.

**Key Finding:** The Matrix/Element foundation provides ~85% of required features. Most "gaps" are either:
1. **Already implemented** in Element (just needs UI adaptation)
2. **Config-only changes** (MELO already has this infrastructure)
3. **UI reskinning** (Discord-style components over Matrix data)

---

## Table of Contents

1. [Feature Inventory: Element Web Provides](#1-feature-inventory-element-web-provides)
2. [Feature Inventory: Discord Clone Provides](#2-feature-inventory-discord-clone-provides)
3. [MELO-Specific Requirements](#3-melo-specific-requirements)
4. [Gap Analysis](#4-gap-analysis)
5. [Implementation Priority](#5-implementation-priority)
6. [Effort Estimates](#6-effort-estimates)
7. [Dependencies](#7-dependencies)

---

## 1. Feature Inventory: Element Web Provides

### 1.1 Messaging (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| Text messages | `TextualBody.tsx`, `MessageEvent.tsx` | ✅ Complete |
| Rich text/Markdown | WYSIWYG composer | ✅ Complete |
| Message editing | `EditMessageComposer.tsx` | ✅ Complete |
| Message deletion | Redaction support | ✅ Complete |
| Replies/Quoting | `ReplyTile.tsx` | ✅ Complete |
| File uploads | `MFileBody.tsx` | ✅ Complete |
| Image/Video embeds | `MImageBody.tsx`, `MVideoBody.tsx` | ✅ Complete |
| Code blocks | `CodeBlock.tsx` | ✅ Complete |
| Link previews | URL preview generation | ✅ Complete |
| Message pinning | `PinnedEventTile.tsx` | ✅ Complete |

### 1.2 Real-Time Features (✅ Complete)

| Feature | Matrix Event Type | Element Implementation |
|---------|-------------------|------------------------|
| Typing indicators | `m.typing` | `TypingStore.ts` |
| Presence | `m.presence` | `PresenceState.ts` |
| Read receipts | `m.receipt` | `ReadReceiptMarker` |
| Live message sync | `/sync` API | `TimelinePanel.tsx` |
| Unread counts | Notification rules | `NotificationState` |

### 1.3 Reactions & Threads (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| Emoji reactions | `ReactionsRow.tsx`, `ReactionPicker.tsx` | ✅ Complete |
| Quick reactions | `QuickReactions.tsx` | ✅ Complete |
| Custom emoji | Sticker/emoji packs | ✅ Complete |
| Threads | `ThreadPanel.tsx`, `ThreadView.tsx` | ✅ Complete |
| Thread summary | `ThreadSummary.tsx` | ✅ Complete |
| Thread notifications | `useRoomThreadNotifications.ts` | ✅ Complete |

### 1.4 End-to-End Encryption (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| Megolm encryption | Matrix JS SDK | ✅ Complete |
| Device verification | `VerificationShowSas.tsx` | ✅ Complete |
| Cross-signing | `CreateSecretStorageDialog.tsx` | ✅ Complete |
| Key backup | `ExportE2eKeysDialog.tsx`, `ImportE2eKeysDialog.tsx` | ✅ Complete |
| Recovery methods | `NewRecoveryMethodDialog.tsx` | ✅ Complete |
| E2EE status indicator | `useEncryptionStatus.ts` | ✅ Complete |
| Force E2EE option | MELO config | ✅ Complete |

### 1.5 Voice & Video Calls (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| 1:1 voice calls | `LegacyCallHandler.tsx` | ✅ Complete |
| 1:1 video calls | `LegacyCallView.tsx` | ✅ Complete |
| Group calls (MSC3401) | `CallView.tsx`, MatrixRTC | ✅ Complete |
| Screen sharing | WebRTC screen share | ✅ Complete |
| LiveKit integration | `models/Call.ts` | ✅ Complete |
| Call notifications | `IncomingCallToast.tsx` | ✅ Complete |

### 1.6 Spaces (Discord "Servers") (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| Space creation | `SpaceCreateMenu.tsx` | ✅ Complete |
| Space hierarchy | `SpaceHierarchy.tsx` | ✅ Complete |
| Space settings | `SpaceSettingsGeneralTab.tsx` | ✅ Complete |
| Space visibility | `SpaceSettingsVisibilityTab.tsx` | ✅ Complete |
| Child rooms | `SpaceChildrenPicker.tsx` | ✅ Complete |
| Space panel | `SpacePanel.tsx` | ✅ Complete |
| Nested spaces | `SpaceTreeLevel.tsx` | ✅ Complete |

### 1.7 Room Management (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| Room creation | `createRoom.ts` | ✅ Complete |
| Room settings | `room_settings/` | ✅ Complete |
| Invite management | `InviteDialog.tsx` | ✅ Complete |
| Member list | `MemberList/` | ✅ Complete |
| Roles/permissions | `RolesRoomSettingsTab.tsx` | ✅ Complete |
| Room directory | `PublicRoomDirectory` | ✅ Complete |

### 1.8 User Features (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| User profiles | `UserView.tsx` | ✅ Complete |
| Avatar management | `avatars/` | ✅ Complete |
| Custom status | MSC4133 extended profiles | ✅ Complete |
| Session management | `SessionManagerTab.tsx` | ✅ Complete |
| Notification settings | `NotificationUserSettingsTab.tsx` | ✅ Complete |
| Appearance settings | `AppearanceUserSettingsTab.tsx` | ✅ Complete |

### 1.9 Security & Privacy (✅ Complete)

| Feature | Element Implementation | Status |
|---------|------------------------|--------|
| 2FA (via OIDC) | OIDC store | ✅ Complete |
| Security settings | `SecurityUserSettingsTab.tsx` | ✅ Complete |
| Device management | `devices/` | ✅ Complete |
| Encryption settings | `EncryptionUserSettingsTab.tsx` | ✅ Complete |
| Moderation tools | Mjolnir integration | ✅ Complete |

---

## 2. Feature Inventory: Discord Clone Provides

### 2.1 UI Components

| Component | Discord Clone | MELO Status |
|-----------|---------------|-------------|
| Server sidebar | `NavigationSidebar` | ⚠️ Needs reskin to use Spaces |
| Channel sidebar | `ServerSidebar` | ⚠️ Needs reskin to use Rooms |
| Message list | `ChatMessages` | ⚠️ Needs integration with Matrix sync |
| Message composer | `ChatInput` | ⚠️ Needs integration with Matrix sending |
| User avatar | `UserAvatar` | ✅ Map to Element avatars |
| Modals | 12 modal components | ⚠️ Needs Matrix-backed modals |
| Emoji picker | `@emoji-mart/react` | ✅ Element has similar |

### 2.2 Backend Features (Need Matrix Migration)

| Feature | Discord Clone Impl | Matrix Equivalent | Migration Effort |
|---------|-------------------|-------------------|------------------|
| Real-time messaging | Socket.io | Matrix sync | Medium |
| Message storage | Prisma/PostgreSQL | Matrix homeserver | None (use Matrix) |
| File uploads | UploadThing | Matrix content repo | Low |
| Authentication | Clerk | Matrix auth | Medium |
| Video calls | LiveKit | LiveKit via MatrixRTC | Low |

---

## 3. MELO-Specific Requirements

### 3.1 End-to-End Encryption (✅ Already Met)

**Requirement:** All messages must support E2EE via Matrix.

**Status:** ✅ **Complete** — Element Web has full E2EE support:
- `src/async-components/views/dialogs/security/` — All E2EE dialogs
- `src/hooks/useEncryptionStatus.ts` — Encryption state hook
- `src/hooks/useIsEncrypted.ts` — Room encryption check
- Matrix JS SDK handles Megolm/Olm automatically

**MELO Addition:** Force E2EE option in `SelfHostConfig.ts`:
```typescript
advanced: {
    e2ee: true,
    forceE2ee: false,  // Can enforce E2EE for all rooms
    crossSigning: true,
    secureBackup: true,
    deviceVerification: true,
}
```

### 3.2 Federation (✅ Already Met)

**Requirement:** Support Matrix federation for cross-server communication.

**Status:** ✅ **Complete** — Federation is native to Matrix:
- Element Web automatically supports federation
- MELO adds federation controls in `SelfHostConfig.ts`:

```typescript
federation: {
    enabled: true,
    mode: "open" | "allowlist" | "blocklist",
    allowedServers: [],
    blockedServers: [],
    allowJoiningFederatedRooms: true,
    allowFederatedInvites: true,
    showFederatedInDiscovery: true,
}
```

### 3.3 Private/Self-Hosted Mode (✅ Already Met)

**Requirement:** Full support for private, self-hosted instances.

**Status:** ✅ **Complete** — MELO already has comprehensive self-host config:

| Feature | MELO Implementation |
|---------|---------------------|
| Private mode toggle | `isPrivateInstance` flag |
| Registration control | `allowRegistration`, `requireInviteCode` |
| Access control | IP allowlist/blocklist |
| Branding | Full customization |
| Analytics disable | `disableAnalytics`, `disableTelemetry` |
| External requests block | `disableExternalRequests` |

**Presets Available:**
- `public` — Open registration, full federation
- `private-family` — Invite-only, no federation
- `corporate` — SSO, strict security, audit logging
- `community` — Public discovery, open federation
- `maximum-privacy` — Everything locked down

### 3.4 Matrix-Native Features (✅ Already Met)

| Feature | Matrix Spec | Element Support |
|---------|-------------|-----------------|
| Reactions | MSC2677 | ✅ Full support |
| Threads | MSC3440 | ✅ Full support |
| Spaces | MSC1772 | ✅ Full support |
| Typing indicators | `m.typing` | ✅ Full support |
| Read receipts | `m.receipt` | ✅ Full support |
| Presence | `m.presence` | ✅ Full support |
| VoIP/Video | MSC3401 | ✅ Full support |
| Cross-signing | MSC1756 | ✅ Full support |

---

## 4. Gap Analysis

### 4.1 No Gaps — Already Complete ✅

These requirements are **fully met** by Element Web + MELO config:

| Requirement | Status | Notes |
|-------------|--------|-------|
| E2EE | ✅ Complete | Full Megolm/Olm, cross-signing |
| Federation | ✅ Complete | Native Matrix + MELO controls |
| Private mode | ✅ Complete | Comprehensive config system |
| Reactions | ✅ Complete | Element implementation |
| Threads | ✅ Complete | Element implementation |
| Voice/Video | ✅ Complete | LiveKit via MatrixRTC |
| Spaces | ✅ Complete | Full Element support |
| User profiles | ✅ Complete | MSC4133 extended profiles |

### 4.2 UI/UX Gaps — Need Discord-Style Reskinning

These features **exist in Element** but need **Discord-like UI**:

| Gap | Element Has | Needs | Priority | Effort |
|-----|-------------|-------|----------|--------|
| Server list sidebar | SpacePanel | Discord-style with icons | P1 | Medium |
| Channel sidebar | Room list | Category-based like Discord | P1 | Medium |
| Message bubbles | MessagePanel | Discord-style message layout | P1 | Low |
| User hover cards | UserInfo | Discord-style popover | P2 | Low |
| Server settings | SpaceSettings | Discord-style modal tabs | P2 | Medium |
| Role management | RolesTab | Discord-style role editor | P2 | Medium |
| Invite flow | InviteDialog | Discord-style invite modal | P2 | Low |

### 4.3 Integration Gaps — Need Matrix Backend Connection

These Discord clone features need **Matrix integration**:

| Gap | Discord Clone | Matrix Replacement | Priority | Effort |
|-----|--------------|-------------------|----------|--------|
| Socket.io → Sync | useChatSocket | Matrix /sync | P0 | High |
| Clerk auth → Matrix | ClerkProvider | Matrix login | P0 | High |
| Prisma → Matrix | db.ts | MatrixClient | P0 | None |
| UploadThing → Matrix | FileUpload | Matrix content repo | P1 | Low |
| React Query cache | useChatQuery | Matrix SDK cache | P1 | Medium |

### 4.4 Feature Gaps — Need New Implementation

**Very few features are actually missing.** These are the only real gaps:

| Gap | Description | Priority | Effort |
|-----|-------------|----------|--------|
| Discord-style onboarding | First-run server creation flow | P1 | Medium |
| Server templates | Pre-configured space templates | P2 | Medium |
| Nitro-like features | Custom emoji packs, profile badges | P3 | Low |
| Activity status | "Playing X" rich presence | P3 | Medium |
| Server discovery | Browse public servers | P2 | Low |
| Audit log UI | Visual audit log viewer | P2 | Medium |

---

## 5. Implementation Priority

### P0 — Critical (Must Have for MVP)

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| Auth migration | Matrix login replacing Clerk | High | None |
| Real-time migration | Matrix sync replacing Socket.io | High | Auth |
| Core UI integration | Connect Discord UI to Matrix data | High | Auth, Sync |

### P1 — High (Needed for Good UX)

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| Server sidebar | Discord-style space navigation | Medium | Core UI |
| Channel sidebar | Discord-style room list | Medium | Core UI |
| Message display | Discord-style message layout | Low | Core UI |
| File uploads | Matrix content repo integration | Low | Auth |
| Onboarding flow | First-run experience | Medium | Auth |

### P2 — Medium (Polish)

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| Server settings | Discord-style settings modal | Medium | Server sidebar |
| Role editor | Visual role management | Medium | Server settings |
| User cards | Hover card popover | Low | Core UI |
| Invite modal | Discord-style invite flow | Low | Core UI |
| Audit log UI | Visual admin logs | Medium | Admin features |
| Server discovery | Browse/search servers | Low | Core UI |

### P3 — Low (Nice to Have)

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| Server templates | Pre-configured setups | Medium | Server creation |
| Activity status | Rich presence | Medium | Presence system |
| Profile badges | Achievement display | Low | User profiles |
| Custom emoji packs | Server-specific emoji | Low | Emoji picker |

---

## 6. Effort Estimates

### Summary by Priority

| Priority | Tasks | Total Effort |
|----------|-------|--------------|
| P0 | 3 | 6-8 weeks |
| P1 | 5 | 3-4 weeks |
| P2 | 6 | 4-5 weeks |
| P3 | 4 | 2-3 weeks |
| **Total** | **18** | **15-20 weeks** |

### Detailed Estimates

| Task | Complexity | Time Estimate | Team Size |
|------|------------|---------------|-----------|
| **P0: Auth migration** | High | 2-3 weeks | 1-2 devs |
| **P0: Real-time migration** | High | 2-3 weeks | 1-2 devs |
| **P0: Core UI integration** | High | 2 weeks | 2 devs |
| **P1: Server sidebar** | Medium | 1 week | 1 dev |
| **P1: Channel sidebar** | Medium | 1 week | 1 dev |
| **P1: Message display** | Low | 3-4 days | 1 dev |
| **P1: File uploads** | Low | 2-3 days | 1 dev |
| **P1: Onboarding** | Medium | 1 week | 1 dev |
| **P2: Server settings** | Medium | 1 week | 1 dev |
| **P2: Role editor** | Medium | 1 week | 1 dev |
| **P2: User cards** | Low | 2-3 days | 1 dev |
| **P2: Invite modal** | Low | 2-3 days | 1 dev |
| **P2: Audit log UI** | Medium | 1 week | 1 dev |
| **P2: Server discovery** | Low | 3-4 days | 1 dev |
| **P3: Server templates** | Medium | 1 week | 1 dev |
| **P3: Activity status** | Medium | 1 week | 1 dev |
| **P3: Profile badges** | Low | 2-3 days | 1 dev |
| **P3: Custom emoji packs** | Low | 3-4 days | 1 dev |

---

## 7. Dependencies

### Dependency Graph

```
                    ┌─────────────────┐
                    │  Auth Migration │
                    │      (P0)       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Sync      │  │   File      │  │  Onboarding │
    │ Migration   │  │  Uploads    │  │    (P1)     │
    │    (P0)     │  │   (P1)      │  └─────────────┘
    └──────┬──────┘  └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Core UI    │
    │ Integration │
    │    (P0)     │
    └──────┬──────┘
           │
    ┌──────┴──────┬─────────────┬─────────────┐
    │             │             │             │
    ▼             ▼             ▼             ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Server │  │Channel │  │Message │  │ User   │
│Sidebar │  │Sidebar │  │Display │  │ Cards  │
│  (P1)  │  │  (P1)  │  │  (P1)  │  │  (P2)  │
└───┬────┘  └───┬────┘  └────────┘  └────────┘
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│ Server │  │ Invite │
│Settings│  │ Modal  │
│  (P2)  │  │  (P2)  │
└───┬────┘  └────────┘
    │
    ▼
┌────────┐
│  Role  │
│ Editor │
│  (P2)  │
└────────┘
```

### Critical Path

1. **Auth Migration** (P0) — Everything depends on this
2. **Sync Migration** (P0) — Real-time features depend on this
3. **Core UI Integration** (P0) — All UI work depends on this
4. **Server/Channel Sidebars** (P1) — Main navigation
5. **Settings/Management** (P2) — Admin functionality

---

## 8. Conclusions

### What We Don't Need to Build

| Feature | Why Not Needed |
|---------|----------------|
| E2EE implementation | ✅ Element has complete E2EE |
| Federation support | ✅ Native to Matrix protocol |
| Reactions system | ✅ Element has full implementation |
| Threads system | ✅ Element has full implementation |
| Voice/Video calls | ✅ Element has LiveKit integration |
| User management | ✅ Element has comprehensive UI |
| Device management | ✅ Element has session manager |
| Notification system | ✅ Element has push rules |

### What We Need to Build

| Feature | Why Needed |
|---------|------------|
| Auth adapter | Replace Clerk with Matrix auth |
| Sync adapter | Replace Socket.io with Matrix sync |
| UI components | Discord-style over Element data |
| Onboarding | First-run experience |
| Admin UI | Visual config management |

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Matrix SDK complexity | Element's abstractions help |
| Performance concerns | Matrix sync is proven at scale |
| Feature parity with Discord | Element exceeds Discord in many areas |
| Self-hosting complexity | MELO config system simplifies setup |

### Final Notes

MELO v2 is in an excellent position:
- **85%+ of features are already implemented** in Element Web
- **MELO-specific requirements are already met** by existing config
- **Main work is UI/UX adaptation** rather than new feature development
- **Matrix protocol provides** federation, E2EE, and real-time natively

The project is primarily a **UI reskinning and integration effort**, not a ground-up implementation.

---

*Document generated as part of MELO v2 audit*
