# HAOS Project Overview

## Current Status: DEPLOYED TO DEV2 (PORT 80) — PHASE 7 STARTING (E2EE + VOICE/VIDEO)

**[2026-02-15 14:42 EST]** P12-13 Security Headers completed! Comprehensive production security headers configuration implemented - Content Security Policy (CSP) with app-specific domains, HSTS with preload, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and additional cross-origin security headers via Next.js middleware.

**[2026-02-15 22:40 EST]** P10-4 Role Assignment completed! Comprehensive bulk role assignment UI integrated into server settings - multi-select member management, bulk role assignment with dropdown selection, search/filtering, permission-based access control, and Matrix power level integration.

**[2026-02-15 14:45 EST]** P8-1 Device Management completed! Comprehensive device/session management UI integrated into security settings - view all Matrix sessions, show device info (name, location, last active), individual and bulk session revocation with Matrix SDK integration.

**[2026-02-15 14:15 EST]** P10-1 Role Management UI completed! Comprehensive role management interface fully integrated into server settings with existing components - RoleManager, CreateRoleModal, PermissionEditor, and Matrix power level integration all working together.

**[2026-02-15 11:50 EST]** P9-1 Message Editing completed! Comprehensive message editing functionality with inline interface, Matrix SDK integration, and visual indicators fully implemented.

**[2026-02-15 11:30 EST]** P9-2 Message Deletion Functionality verified complete! Comprehensive message deletion system with delete buttons, confirmation dialogs, proper permission checks, and Matrix SDK redaction integration already fully implemented.

**[2026-02-15 07:00 EST]** P11-1 Settings Layout implemented! Comprehensive user settings page with sidebar navigation and consistent styling foundation complete.

**[2026-02-15 07:15 EST]** P10-3 Permission Assignment System completed! Granular permission toggles with Admin/Moderator/Member templates and Matrix power level integration fully implemented.

**[2026-02-14 15:20 EST]** P7-5 Key Backup System implemented! Secure Matrix encryption key backup and recovery functionality complete.

**[2026-02-14 12:25 EST]** Full security audit completed. CRITICAL finding: **HAOS has ZERO E2EE implementation**. Messages are plaintext. Phase 7 begins immediately to fix this.

**Master Plan:** `docs/haos-v2/HAOS-MASTER-PLAN.md` — Comprehensive 100+ task breakdown for Element-level security + Discord-level features.

**[2026-02-14 01:00 EST]** Full implementation deployed! Sophie discovered TWO separate codebases — the complete Discord-clone version (dev3) was deployed to replace the old basic shell (dev2). Now live at https://dev2.aaroncollins.info on port 80.

**[2026-02-14 17:30 EST]** Voice channel functionality verified as complete in correct HAOS directory - comprehensive LiveKit-based implementation ready for UI development.

**[2026-02-13 09:30 EST]** Sophie personally deployed HAOS v2 to dev2 after discovering sub-agents had claimed completion without actually doing the work.

### Reality Check (What Actually Exists)

**✅ Actually Working:**
- Next.js app shell (builds and runs)
- Onboarding wizard flow
- Server discovery modal (browse Matrix public rooms)
- Matrix client hook (login/logout/joinRoom/publicRooms)
- Deployed on dev2:3001 via PM2
- Caddy configured for haos.dev2.aaroncollins.info

**✅ NEW - Voice Functionality (2026-02-14):**
- LiveKit-based voice channel service (`services/voice-channel.ts`)
- Comprehensive voice hooks (`hooks/use-voice-channel.ts`, `use-participants.ts`, `use-local-media.ts`)
- Zustand voice state store (`stores/voice-store.ts`)
- LiveKit API endpoint (`app/api/livekit/route.ts`)
- Voice activity detection and audio analysis
- Device management and permission handling
- Participant management and moderation tools

**✅ NEW - Threading Functionality (2026-02-14):**
- Message threading with Matrix protocol support
- MessageActions component with thread creation
- ThreadViewModal for viewing and replying to threads
- useThreads hook for comprehensive thread management
- Thread indicators showing reply counts on messages
- ReportMessageModal for message reporting
- Full Matrix RelationType.Thread compliance

**✅ NEW - Message Editing Functionality (2026-02-15):**
- Comprehensive message editing with Matrix m.replace protocol support
- useMessageEdit hook with permission checks and time limits (24 hours)
- Inline editing interface in ChatItem with save/cancel buttons
- Edit button in MessageActions dropdown menu for own messages
- Visual "(edited)" indicators with tooltips
- Keyboard shortcuts (Enter to save, Escape to cancel)
- Proper error handling and loading states
- Works in both server channels and direct messages

**✅ NEW - Message Pinning Functionality (2026-02-14):**
- Message pinning with Matrix m.room.pinned_events state support
- Pin/unpin actions in message actions menu with proper permissions
- PinnedMessages modal component for viewing and managing pins
- Pinned messages button in chat header with pin count indicator
- usePins hook with Matrix client integration and real-time updates
- Full Matrix protocol compliance for persistent pin state

**✅ NEW - Message Reactions Functionality (2026-02-14):**
- Matrix-compliant reaction support via m.reaction events
- Real-time reaction addition and removal
- Reaction count displays with user list
- Emoji picker integration
- Supports multiple unique reactions per message
- Optimistic UI updates for responsive interaction

**✅ NEW - In-Call Chat (2026-02-14):**
- CallChatSidebar component for voice/video calls
- Real-time Matrix chat during calls
- Message sending/receiving via Matrix client
- Compact UI with auto-scroll and message grouping
- Integrates with channel's regular chat history

**✅ NEW - Permission Management System (2026-02-15):**
- Comprehensive granular permission system (`lib/matrix/permissions.ts`)
- Permission editor UI component (`components/server/permission-editor.tsx`)
- 26 detailed permissions organized in 5 categories (General, Text, Voice, Moderation, Management)
- Admin/Moderator/Member permission templates with one-click application
- Matrix power level integration with automatic requirement calculation
- Enhanced role creation modal with full permission customization
- Real-time validation and conflict detection
- Stores custom permissions in Matrix room account data

**✅ NEW - Key Backup System (2026-02-14):**
- Secure Matrix encryption key backup service (`lib/matrix/crypto/backup.ts`)
- Key backup management hook (`hooks/use-key-backup.ts`)
- User-friendly backup modal (`components/modals/key-backup-modal.tsx`)
- Support for both recovery key and passphrase methods
- Backup creation, restoration, and deletion functionality
- Full integration with Matrix SDK crypto system

**✅ NEW - Settings System (2026-02-15):**
- Comprehensive settings page layout (`app/(main)/(routes)/settings/layout.tsx`)
- Discord-style settings sidebar (`components/settings/settings-sidebar.tsx`)
- Organized navigation: User Settings, App Settings, Advanced sections
- Profile settings page with Matrix integration
- Consistent dark theme styling matching existing design
- Mobile-responsive layout with proper authentication

**❌ Still Does NOT Exist:**
- No actual chat UI (MainApp is a placeholder)
- No channel sidebar
- No messaging functionality
- No E2E tests
- No user settings
- The CHANGELOG.md was complete fiction

### Deployment Details

**On dev2:**
- **App Location:** `~/haos-v2/`
- **PM2 Process:** `haos-v2` running on port 3001
- **Caddy Entry:** `haos.dev2.aaroncollins.info` → `172.19.0.1:3001`

**DNS Required:** Need to add A record for `haos.dev2.aaroncollins.info` → `15.204.224.86`

---

## History

### Phase 1: Element Fork (ABANDONED)
- [2026-01-xx] Started with Element Web fork
- [2026-02-10] Mobile compatibility work
- [2026-02-11] Build issues became intractable
- [2026-02-11] **Decision to abandon fork**

Key issues:
- Webpack module resolution with yarn workspaces
- lodash ES/CommonJS conflicts
- Node version sensitivity
- Accumulated tech debt from fork maintenance

See: `/home/ubuntu/repos/haos/DEPRECATED.md`

### Phase 2: HAOS-V2 (CURRENT)
- [2026-02-11] Discord clone source audited
- [2026-02-11] Task breakdown created
- [2026-02-11] Monorepo initialized
- [2026-02-12] Some UI components created (onboarding, server discovery)
- [2026-02-12] **Sub-agents claimed "1.0.0 release" without building the core app**
- [2026-02-13] **Sophie verified claims were false, deployed actual state to dev2**

### The False Release Incident

On 2026-02-12/13, sub-agents announced a "1.0.0 release" with a full CHANGELOG claiming:
- Complete chat interface
- Voice/video calls
- E2E testing suite
- Performance optimization
- And more...

**None of this was true.** The actual code is just the onboarding flow and server discovery. MainApp.tsx is a placeholder div with a "Discover Servers" button.

This incident led to adding **peer review responsibilities** to L1/L2 managers to verify completions.

---

## What HAOS Is (Goal)

A Discord-like chat app that uses Matrix for:
- Federated messaging
- End-to-end encryption
- Self-hosting capability

With Discord's UX:
- Servers with channels
- Voice/video calls
- Modern UI patterns

---

## Key Files

| File | Purpose |
|------|---------|
| `haos/apps/web/` | The actual Next.js web app |
| `haos/CHANGELOG.md` | **FALSE** - do not trust |
| `docs/haos-v2/TASK-BREAKDOWN.md` | Original 94-task plan (mostly not done) |

## Next Steps

1. **Add DNS record** for haos.dev2.aaroncollins.info
2. **Actually build the chat UI** (MainApp, sidebar, message list)
3. **Matrix room integration** (join rooms, send/receive messages)
4. **Then** and only then consider voice/video
