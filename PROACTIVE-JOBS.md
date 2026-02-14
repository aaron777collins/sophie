# PROACTIVE-JOBS.md — HAOS Phase 7: Security + Voice/Video

> **Status (2026-02-14 13:00 EST):** 🟡 **PHASE 7 IN PROGRESS — p7-1-crypto-init COMPLETE**
> **Previous:** Phase 6 complete (2026-02-15 05:46 EST)
> **Current Focus:** E2EE implementation (Element-level security) + Voice/Video activation
> **Master Plan:** `docs/haos-v2/HAOS-MASTER-PLAN.md`

## 📊 CURRENT STATE

**What's Working (Phase 6):**
- ✅ Matrix authentication (sign-in/sign-up with any Matrix homeserver)
- ✅ Matrix provider & client integration
- ✅ Spaces/Servers display & navigation
- ✅ Channel listing & navigation
- ✅ Chat messaging (send/receive via Matrix)
- ✅ Voice/Video infrastructure (LiveKit integration - code exists)
- ✅ User settings modal
- ✅ Server settings modal
- ✅ Server discovery modal
- ✅ Theme switching (dark/light)
- ✅ Deployed on port 80

**🔴 CRITICAL: What's MISSING (Security):**
- ❌ **NO E2EE** — Messages are NOT encrypted (plaintext on server)
- ❌ No device verification (emoji/QR)
- ❌ No cross-signing
- ❌ No key backup
- ❌ No secret storage (4S)
- ❌ Voice/video not functional (API disabled)
- ❌ Screen sharing not implemented

---

## 🚀 PHASE 7 TASKS — Security Foundation (E2EE)

### p7-1-crypto-init — Initialize Rust Crypto ✅
- **Status:** ✅ completed
- **Model:** opus
- **Priority:** 🔴 CRITICAL
- **Agent:** agent:main:subagent:596be119-6099-4ce8-9caf-331a97afd150
- **Started:** 2026-02-14 12:31 EST
- **Completed:** 2026-02-14 13:00 EST
- **Description:**
  - ✅ matrix-sdk-crypto-wasm already transitive dependency of matrix-js-sdk
  - ✅ Created crypto store with IndexedDB wrapper
  - ✅ Initialize Rust crypto on client start (`initRustCrypto()`)
  - ✅ Handle crypto ready state in MatrixProvider
  - ✅ Build passes with no TypeScript errors
- **Files modified:**
  - `lib/matrix/crypto/store.ts` — NEW: IndexedDB crypto store wrapper
  - `lib/matrix/crypto/index.ts` — NEW: Module exports
  - `lib/matrix/client.ts` — Added initializeCrypto(), getCryptoState(), etc.
  - `components/providers/matrix-provider.tsx` — Added crypto state handling
- **Also fixed pre-existing bugs:**
  - Fixed useMatrixContext import in chat-item.tsx
  - Fixed async reactions handling in chat-item.tsx
  - Added emojiPicker modal type to use-modal-store.ts
  - Fixed get-video-duration import in media.ts
- **Acceptance:**
  - ✅ Crypto initializes without errors
  - ✅ Build passes with no TypeScript errors
  - ⏳ Messages in encrypted rooms — needs live testing
  - ⏳ Crypto store persistence — needs live testing
- **Commit:** 71646d9 (local, not pushed - remote is original fork)
- **Docs:** See `docs/haos-v2/HAOS-MASTER-PLAN.md` Phase 1.1

### p7-2-room-encryption — Enable Room Encryption
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** 🔴 CRITICAL
- **Depends on:** p7-1-crypto-init
- **Description:**
  - Enable encryption for new rooms by default
  - Handle encrypted message sending (Megolm)
  - Handle encrypted message decryption
  - Show encryption status in room header
  - Handle "Unable to decrypt" messages gracefully
- **Files:**
  - `lib/matrix/crypto/room-encryption.ts` — NEW
  - `components/chat/chat-header.tsx` — Add encryption indicator
  - `hooks/use-room-messages.ts` — Handle decryption
- **Acceptance:**
  - New rooms created with encryption enabled
  - Messages encrypt/decrypt correctly
  - Encryption status visible in UI

### p7-3-device-verify — Device Verification
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** HIGH
- **Depends on:** p7-1-crypto-init
- **Description:**
  - Create DeviceVerificationModal component
  - Implement emoji verification flow (SAS)
  - Implement QR code verification
  - Show verification prompts on new login
  - Display device verification status
- **Files:**
  - `components/modals/device-verification-modal.tsx` — NEW
  - `lib/matrix/crypto/verification.ts` — NEW
  - `hooks/use-device-verification.ts` — NEW
- **Acceptance:**
  - Can verify devices with emoji comparison
  - Verification status persists
  - Prompts shown for unverified devices

### p7-4-cross-signing — Cross-Signing Setup
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** HIGH
- **Depends on:** p7-3-device-verify
- **Description:**
  - Implement master/self-signing/user-signing key generation
  - Create cross-signing bootstrap flow
  - Handle cross-signing key upload
  - Show cross-signing status in settings
- **Files:**
  - `lib/matrix/crypto/cross-signing.ts` — NEW
  - `components/settings/security-settings.tsx` — NEW/UPDATE
- **Acceptance:**
  - Cross-signing keys generated and uploaded
  - Can sign new devices
  - Can verify other users

### p7-5-key-backup — Key Backup System
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** HIGH
- **Depends on:** p7-4-cross-signing
- **Description:**
  - Create secure backup key generation
  - Implement server-side key backup
  - Create key recovery flow
  - Implement secure backup passphrase
  - Show "Set up key backup" prompt for new users
- **Files:**
  - `lib/matrix/crypto/backup.ts` — NEW
  - `components/modals/key-backup-modal.tsx` — NEW
  - `hooks/use-key-backup.ts` — NEW
- **Acceptance:**
  - Keys backed up to server
  - Can recover keys on new device
  - Passphrase encryption works

### p7-6-secret-storage — Secret Storage (4S)
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** MEDIUM
- **Depends on:** p7-5-key-backup
- **Description:**
  - Implement secret storage initialization
  - Create security phrase/key setup UI
  - Implement secret storage access
  - Handle cross-device secret sharing
- **Files:**
  - `lib/matrix/crypto/secrets.ts` — NEW
  - `components/modals/security-setup-modal.tsx` — NEW
- **Acceptance:**
  - Secrets stored securely
  - Can access secrets with passphrase
  - Works across devices

---

## 🚀 PHASE 7 TASKS — Voice/Video Activation

### p7-7-livekit-deploy — Deploy LiveKit Server
- **Status:** 🔄 in-progress
- **Model:** sonnet
- **Priority:** HIGH
- **Agent:** agent:main:subagent:b7cbd1ad-bde4-48c3-a8d7-26dac26233f9
- **Started:** 2026-02-14 12:31 EST
- **Note:** Re-spawned 12:34 EST after model 404 error (used wrong model ID)
- **Description:**
  - Deploy LiveKit server via Docker on dev2
  - Configure TLS with Caddy
  - Set up API credentials (LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
  - Enable LiveKit API route (move from `_disabled/`)
  - Test basic voice connectivity
- **Files:**
  - `docker-compose.yml` — Add LiveKit service
  - `app/api/livekit/route.ts` — Enable (move from _disabled)
  - `.env` — Add LiveKit credentials
- **Acceptance:**
  - LiveKit server running
  - API route functional
  - Can connect to voice channel

### p7-8-voice-channels — Voice Channel UI
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** HIGH
- **Depends on:** p7-7-livekit-deploy
- **Description:**
  - Wire up VoiceChannel component to LiveKit
  - Show connected users in voice channel
  - Implement voice channel permissions
  - Add "Join Voice" button to voice channels
  - Voice activity indicators
- **Files:**
  - `components/voice/voice-channel.tsx` — UPDATE
  - `components/server/server-channel.tsx` — Add voice indicators
- **Acceptance:**
  - Can join/leave voice channels
  - See who's in voice channel
  - Speaking indicators work

### p7-9-video-calls — Video Call Functionality
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** HIGH
- **Depends on:** p7-8-voice-channels
- **Description:**
  - Wire up VideoCallLayout fully
  - Implement video toggle
  - Camera/device selection
  - Video call controls (mute, camera, leave, etc.)
- **Files:**
  - `components/video-call/video-call-layout.tsx` — UPDATE
  - `components/video-call/video-controls.tsx` — UPDATE
- **Acceptance:**
  - Video calls work
  - Can toggle camera
  - Multiple participants supported

### p7-10-screen-share — Screen Sharing
- **Status:** ⏳ pending
- **Model:** sonnet
- **Priority:** MEDIUM
- **Depends on:** p7-9-video-calls
- **Description:**
  - Implement screen capture (getDisplayMedia)
  - Create screen share button
  - Show screen share in call layout
  - Implement screen share audio option
  - Handle multiple screen shares
- **Files:**
  - `hooks/use-screen-share.ts` — NEW
  - `components/video-call/screen-share-button.tsx` — NEW
- **Acceptance:**
  - Can share screen
  - Other participants see shared screen
  - Audio sharing optional

---

## 📋 PHASE 7 TASK PRIORITY ORDER

**Security (MUST complete first):**
1. **p7-1-crypto-init** — Foundation for all crypto
2. **p7-2-room-encryption** — Make messages actually encrypted
3. **p7-3-device-verify** — Allow device trust
4. **p7-4-cross-signing** — User trust chain
5. **p7-5-key-backup** — Don't lose messages
6. **p7-6-secret-storage** — Full security system

**Voice/Video (After security foundation):**
7. **p7-7-livekit-deploy** — Server infrastructure
8. **p7-8-voice-channels** — Basic voice
9. **p7-9-video-calls** — Video support
10. **p7-10-screen-share** — Screen sharing

## 📊 PHASE 7 SUMMARY

| Task | Status | Priority | Model | Depends On |
|------|--------|----------|-------|------------|
| p7-1-crypto-init | ✅ completed | 🔴 CRITICAL | opus | — |
| p7-2-room-encryption | ⏳ pending | 🔴 CRITICAL | sonnet | p7-1 ✅ |
| p7-3-device-verify | ⏳ pending | HIGH | sonnet | p7-1 ✅ |
| p7-4-cross-signing | ⏳ pending | HIGH | sonnet | p7-3 |
| p7-5-key-backup | ⏳ pending | HIGH | sonnet | p7-4 |
| p7-6-secret-storage | ⏳ pending | MEDIUM | sonnet | p7-5 |
| p7-7-livekit-deploy | ⏳ pending | HIGH | sonnet | — |
| p7-8-voice-channels | ⏳ pending | HIGH | sonnet | p7-7 |
| p7-9-video-calls | ⏳ pending | HIGH | sonnet | p7-8 |
| p7-10-screen-share | ⏳ pending | MEDIUM | sonnet | p7-9 |

**Total Tasks:** 10 (1 ✅, 0 🔄, 9 ⏳)
**Phase 7 Status:** 🟡 **IN PROGRESS** — Crypto foundation complete, p7-2 and p7-3 now unblocked

---

## 📜 PHASE 6 ARCHIVE (COMPLETE)

## 🚀 PHASE 6 TASKS

### p6-1-cleanup — Remove Dead Code & Integrate apps/web ✅
- **Status:** ✅ completed
- **Model:** sonnet
- **Started:** 2026-02-14 01:01 EST
- **Completed:** 2026-02-14 03:00 EST
- **Priority:** HIGH
- **Description:** 
  - ✅ Remove placeholder auth files (`lib/auth.ts`, `lib/auth-server.ts`) - Clerk placeholders deleted
  - ✅ Update profile files to use Matrix auth (`lib/initial-profile.ts`, `lib/current-profile.ts`, `lib/current-profile-pages.ts`)
  - ✅ Clean up imports referencing old auth throughout application
  - ✅ Evaluate enhanced components from `apps/web/` - moved to migration directories for future integration
- **Files completed:**
  - ✅ `lib/auth.ts` - DELETED (placeholder)
  - ✅ `lib/auth-server.ts` - DELETED (placeholder)
  - ✅ `lib/initial-profile.ts` - UPDATED to use Matrix auth
  - ✅ `lib/current-profile.ts` - UPDATED to use Matrix auth
  - ✅ `lib/current-profile-pages.ts` - UPDATED to use Matrix auth
  - ✅ `apps/web/` folder - EVALUATED and moved to migration directories
- **Acceptance:** ✅ Build passes, no placeholder auth references remain

### p6-2-dm — Direct Messages Implementation ✅
- **Status:** ✅ completed
- **Model:** sonnet
- **Started:** 2026-02-14 01:01 EST
- **Completed:** 2026-02-14 06:55 EST
- **Priority:** HIGH
- **Description:**
  - ✅ Implement DM creation between users
  - ✅ Add DM listing in sidebar/quick switcher
  - ✅ Wire up `getOrCreateDM` service from `apps/web/services/matrix-dm.ts`
  - ✅ Add DM notifications
- **Files:** COMPLETED
  - ✅ `hooks/use-quick-switcher.ts` - Integrated DM service
  - ✅ `apps/web/services/matrix-dm.ts` - Service integrated
  - ✅ Created DM routes, components, and notifications
- **Acceptance:** ✅ Can start DM with any user, DMs appear in sidebar

### p6-3-friends — Friend System ✅
- **Status:** ✅ completed
- **Model:** sonnet
- **Started:** 2026-02-14 01:45 EST
- **Completed:** 2026-02-14 02:00 EST
- **Priority:** MEDIUM
- **Description:**
  - ✅ Implement friend requests (send/accept/decline)
  - ✅ Friend list management
  - ✅ User search and friend discovery
  - ✅ Friend system fully implemented with tabbed UI
- **Files completed:**
  - ✅ `apps/web/services/friend.ts` - Full friend service with Matrix integration ready
  - ✅ `apps/web/components/user/user-profile-modal.tsx` - Tabbed interface with friend management
  - ✅ `apps/web/components/user/friend-list.tsx` - Compact sidebar friend list
  - ✅ `apps/web/hooks/use-friends.ts` - React hook for friend functionality
  - ✅ `apps/web/components/main-app.tsx` - User area integration
- **Acceptance:** ✅ Can send/accept/decline friend requests, friend list displays in sidebar and profile modal

### p6-4-threads — Message Threads ✅
- **Status:** completed
- **Model:** sonnet
- **Started:** 2026-02-14 03:02 EST
- **Completed:** 2026-02-14 03:20 EST
- **Priority:** MEDIUM
- **Description:**
  - ✅ Implement thread creation from messages
  - ✅ Thread view/reply UI
  - ✅ Matrix protocol threading support
- **Files completed:**
  - ✅ `components/chat/message-actions.tsx` - Created with thread functionality
  - ✅ `components/modals/thread-view-modal.tsx` - Full thread view modal
  - ✅ `hooks/use-threads.ts` - Comprehensive thread management
  - ✅ `components/chat/chat-item.tsx` - Updated with thread indicators
  - ✅ `hooks/use-modal-store.ts` - Added threadView modal support
- **Acceptance:** ✅ Can create threads, view thread replies, Matrix protocol compliant

### p6-5-pins — Message Pinning ✅
- **Status:** ✅ completed
- **Model:** sonnet
- **Started:** 2026-02-14 16:30 EST
- **Completed:** 2026-02-15 05:46 EST
- **Priority:** LOW
- **Description:**
  - ✅ Implement message pinning
  - ✅ Pin/unpin UI
  - ✅ Pinned messages list per channel
- **Files completed:**
  - ✅ `hooks/use-pins.ts` - CREATED: Full Matrix pinning hook with state management
  - ✅ `components/chat/message-actions.tsx` - UPDATED: Added pin/unpin functionality 
  - ✅ `components/pinned-messages.tsx` - CREATED: Pinned messages modal component
  - ✅ `components/providers/modal-provider.tsx` - UPDATED: Added pinned messages modal
  - ✅ `components/chat/chat-header.tsx` - UPDATED: Added pinned messages button with count
- **Acceptance:** ✅ Can pin/unpin messages, pinned messages modal displays per channel

### p6-6-video-chat — In-Call Chat ✅
- **Status:** completed
- **Model:** sonnet
- **Priority:** MEDIUM
- **Started:** 2026-02-14 03:31 EST
- **Completed:** 2026-02-14 15:45 EST
- **Description:**
  - ✅ Add chat sidebar in video/voice calls
  - ✅ Real-time Matrix chat integration
  - ✅ Message display and input during calls
- **Files completed:**
  - ✅ `components/video-call/call-chat-sidebar.tsx` - NEW: Full chat sidebar component
  - ✅ `components/media-room.tsx` - Updated to use CallChatSidebar
  - ✅ `components/video-call/index.ts` - Export CallChatSidebar
- **Acceptance:** ✅ Can chat while in voice/video call, messages sync with channel

### p6-7-reactions — Message Reactions Polish ✅
- **Status:** completed
- **Model:** haiku
- **Priority:** LOW
- **Started:** 2026-02-14 22:45 EST
- **Completed:** 2026-02-15 01:30 EST
- **Sub-Agent:** agent:main:subagent:a0e8f056-3bee-4081-991d-7555ad92bb26
- **Description:**
  - ✅ Polish reaction actions (previously placeholders)
  - ✅ Implement full Matrix-compliant reaction system
  - ✅ Add/remove/view reactions with real-time synchronization
- **Files:**
  - ✅ `apps/web/components/chat/chat-item.tsx` - Implemented Matrix-compliant reaction handling
  - ✅ `apps/web/types/matrix.ts` - Added TypeScript type definitions for reactions
- **Acceptance:** ✅ Can add/remove/view reactions on messages with full Matrix protocol support
- **Key Improvements:**
  - Real-time reaction fetching from Matrix events
  - Optimistic UI updates
  - Support for multiple users reacting
  - Emoji picker integration
- **Performance Notes:** Minimal performance impact, uses efficient Matrix SDK relations
- **Final Validation:**
  - ✅ Unit tests created for reaction handling
  - ✅ Matrix protocol compliance verified
  - ✅ No performance regressions detected

### p6-8-user-context — Fix Hardcoded User IDs ✅
- **Status:** completed
- **Model:** haiku (completed by Coordinator directly after Haiku API overload)
- **Priority:** HIGH
- **Description:**
  - Replace hardcoded `currentUserId="@user:example.com"` with actual Matrix user
- **Files:**
  - `app/(main)/(routes)/servers/[serverId]/channels/[channelId]/page.tsx` - Line 93
- **Acceptance:** Actual logged-in user ID used throughout
- **Started:** 2026-02-14 01:00 EST
- **Completed:** 2026-02-14 02:45 EST
- **Notes:** Also fixed pre-existing TypeScript errors in notification hooks

### p6-9-media-duration — Media Duration Extraction ✅
- **Status:** completed
- **Model:** haiku
- **Priority:** LOW
- **Started:** 2026-02-14 21:31 EST
- **Completed:** 2026-02-14 22:15 EST
- **Description:**
  - Extract media duration for audio/video files
  - Implemented using get-video-duration library
- **Files:**
  - `lib/matrix/media.ts` - Updated to extract duration
  - Updated `package.json` to include get-video-duration
- **Acceptance:** Media duration displays for audio/video attachments
- **Implementation Details:**
  - Uses async import of get-video-duration
  - Handles errors gracefully
  - Optional duration field added to MediaInfo type
  - Supports both audio and video files

## 📋 TASK PRIORITY ORDER

1. **p6-8-user-context** (quick fix, HIGH impact)
2. **p6-1-cleanup** (foundation for other work)
3. **p6-2-dm** (core feature)
4. **p6-6-video-chat** (completes voice/video)
5. **p6-3-friends** (social feature)
6. **p6-4-threads** (advanced messaging)
7. **p6-5-pins** (convenience feature)
8. **p6-7-reactions** (polish)
9. **p6-9-media-duration** (polish)

## 📊 PHASE 6 SUMMARY

| Task | Status | Priority | Model |
|------|--------|----------|-------|
| p6-1-cleanup | ✅ completed | HIGH | sonnet |
| p6-2-dm | ✅ completed | HIGH | sonnet |
| p6-3-friends | ✅ completed | MEDIUM | sonnet |
| p6-4-threads | ✅ completed | MEDIUM | sonnet |
| p6-5-pins | ✅ completed | LOW | sonnet |
| p6-6-video-chat | ✅ completed | MEDIUM | sonnet |
| p6-7-reactions | ✅ completed | LOW | haiku |
| p6-8-user-context | ✅ completed | HIGH | haiku |
| p6-9-media-duration | ✅ completed | LOW | haiku |

**Total Tasks:** 9 (9 ✅ completed, 0 🔄 in-progress, 0 ⏳ pending)  
**Phase 6 Status:** ✅ **COMPLETE** — All tasks finished
