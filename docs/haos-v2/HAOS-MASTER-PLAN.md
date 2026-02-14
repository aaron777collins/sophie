# HAOS Master Plan - Element-Level Security + Discord-Level Features

**Created:** 2026-02-14  
**Author:** Sophie (commissioned by Aaron)  
**Status:** COMPREHENSIVE AUDIT + FULL IMPLEMENTATION PLAN

---

## Executive Summary

HAOS is meant to be a Matrix-based chat client with:
- **Element-level security** (full E2EE, device verification, key backup)
- **Discord-level UX** (servers, channels, voice/video rooms, modern UI)

**Current Reality:** The codebase has basic UI scaffolding but **ZERO security implementation**. Messages are sent in plaintext. Voice/video code exists but is disabled. This plan addresses ALL shortcomings to achieve feature parity with Element and Discord.

---

## Part 1: Complete Audit

### 🔴 CRITICAL: Security (E2EE) - **0% COMPLETE**

| Feature | Status | Notes |
|---------|--------|-------|
| **Crypto initialization** | ❌ MISSING | No `initCrypto()` or `initRustCrypto()` calls |
| **libolm/Rust crypto** | ❌ MISSING | matrix-sdk-crypto-wasm in deps but never used |
| **E2EE room encryption** | ❌ MISSING | No room encryption setup |
| **Device verification** | ❌ MISSING | No emoji/QR verification |
| **Cross-signing** | ❌ MISSING | No master/self/user-signing keys |
| **Key backup** | ❌ MISSING | No server-side key backup |
| **Secret storage** | ❌ MISSING | No 4S (SSSS) implementation |
| **Secure key export** | ❌ MISSING | No megolm key export |
| **Device management** | ❌ MISSING | Can't view/delete devices |

**Impact:** Users have ZERO privacy. All messages are readable by anyone with server access.

### 🟡 Voice/Video - **40% COMPLETE**

| Feature | Status | Notes |
|---------|--------|-------|
| **LiveKit integration** | ⚠️ DISABLED | Code exists but route is in `_disabled/` |
| **Voice channels** | ⚠️ PARTIAL | `useVoiceChannel` hook exists, not wired up |
| **Video calls** | ⚠️ PARTIAL | `VideoCallLayout` exists, not functional |
| **Screen sharing** | ❌ MISSING | Not implemented |
| **E2EE for calls** | ❌ MISSING | LiveKit supports it, not configured |
| **Call controls** | ⚠️ PARTIAL | Basic controls exist |
| **Voice activity** | ✅ EXISTS | Speaking indicators implemented |
| **LiveKit server** | ❌ MISSING | No server deployed |

### 🟡 Chat Features - **60% COMPLETE**

| Feature | Status | Notes |
|---------|--------|-------|
| **Message sending** | ✅ EXISTS | Via Matrix SDK |
| **Message receiving** | ✅ EXISTS | Real-time sync works |
| **Message threading** | ✅ EXISTS | Thread modal + hooks |
| **Message reactions** | ✅ EXISTS | Emoji reactions work |
| **Message pinning** | ✅ EXISTS | Pin/unpin functional |
| **Message editing** | ⚠️ PARTIAL | UI exists, needs work |
| **Message deletion** | ⚠️ PARTIAL | UI exists, needs work |
| **Read receipts** | ✅ EXISTS | Hook implemented |
| **Typing indicators** | ✅ EXISTS | Hook implemented |
| **File uploads** | ⚠️ PARTIAL | UploadThing, not encrypted |
| **Image previews** | ⚠️ PARTIAL | Basic support |
| **Link previews** | ❌ MISSING | Not implemented |
| **Message search** | ❌ MISSING | Not implemented |
| **Mentions (@user)** | ❌ MISSING | Not implemented |

### 🟡 Server/Space Features - **50% COMPLETE**

| Feature | Status | Notes |
|---------|--------|-------|
| **Server creation** | ✅ EXISTS | Creates Matrix space |
| **Channel creation** | ✅ EXISTS | Creates Matrix room |
| **Server settings** | ⚠️ PARTIAL | Basic settings modal |
| **Channel settings** | ⚠️ PARTIAL | Edit/delete modals |
| **Roles system** | ❌ MISSING | No role management |
| **Permissions** | ❌ MISSING | No permission system |
| **Server discovery** | ✅ EXISTS | Browse public rooms |
| **Invite system** | ⚠️ PARTIAL | Basic invite codes |
| **Moderation tools** | ❌ MISSING | No ban/kick/mute |
| **Audit logs** | ❌ MISSING | Not implemented |

### 🟡 User Features - **30% COMPLETE**

| Feature | Status | Notes |
|---------|--------|-------|
| **Login** | ✅ EXISTS | Password auth works |
| **Registration** | ✅ EXISTS | Basic registration |
| **Profile settings** | ⚠️ PARTIAL | Minimal |
| **Avatar upload** | ⚠️ PARTIAL | Basic support |
| **Status/Presence** | ⚠️ PARTIAL | Hook exists |
| **User settings** | ❌ MISSING | No settings page |
| **Notification prefs** | ❌ MISSING | Not implemented |
| **Theme settings** | ✅ EXISTS | Dark/light mode |
| **DMs** | ⚠️ PARTIAL | Basic support |

### 🔴 Infrastructure - **20% COMPLETE**

| Feature | Status | Notes |
|---------|--------|-------|
| **Deployment** | ✅ EXISTS | dev2:3001 via PM2 |
| **Push notifications** | ❌ MISSING | No push implementation |
| **Service worker** | ❌ MISSING | No offline support |
| **IndexedDB storage** | ❌ MISSING | No local message cache |
| **PWA support** | ❌ MISSING | Not a PWA |
| **Mobile responsive** | ⚠️ PARTIAL | Needs work |
| **Error boundaries** | ❌ MISSING | No error handling UI |
| **Analytics** | ❌ MISSING | Not implemented |
| **Rate limiting** | ❌ MISSING | Not implemented |

---

## Part 2: Implementation Plan

### Phase 1: Security Foundation (E2EE) - HIGHEST PRIORITY
**Timeline:** 2-3 weeks  
**Complexity:** HIGH  

This is **non-negotiable** for Element-level security. Without E2EE, HAOS cannot be used for private communication.

#### 1.1 Rust Crypto Initialization
```typescript
// Required changes to lib/matrix/client.ts
import { Crypto } from "@matrix-org/matrix-sdk-crypto-wasm";

export async function initializeClient(session: MatrixSession): Promise<MatrixClient> {
  // ... existing code ...
  
  // Initialize Rust crypto
  await client.initRustCrypto();
  
  // Start client with crypto enabled
  await client.startClient({
    initialSyncLimit: 10,
    // Crypto-specific options
    lazyLoadMembers: true,
  });
  
  return client;
}
```

**Tasks:**
- [ ] P1-001: Add @matrix-org/matrix-sdk-crypto-wasm dependency
- [ ] P1-002: Create crypto initialization in client.ts
- [ ] P1-003: Handle crypto store (IndexedDB)
- [ ] P1-004: Create CryptoProvider context
- [ ] P1-005: Add crypto event handlers (verification requests, etc.)

#### 1.2 Device Verification
**Tasks:**
- [ ] P1-006: Create DeviceVerificationModal component
- [ ] P1-007: Implement emoji verification flow
- [ ] P1-008: Implement QR code verification
- [ ] P1-009: Create "Verify this device" prompt on login
- [ ] P1-010: Show verification status indicators

#### 1.3 Cross-Signing Setup
**Tasks:**
- [ ] P1-011: Implement master key generation
- [ ] P1-012: Implement self-signing key setup
- [ ] P1-013: Implement user-signing key setup
- [ ] P1-014: Create cross-signing bootstrap flow
- [ ] P1-015: Handle cross-signing key upload

#### 1.4 Key Backup
**Tasks:**
- [ ] P1-016: Create secure backup key generation
- [ ] P1-017: Implement server-side key backup
- [ ] P1-018: Create key recovery flow
- [ ] P1-019: Implement secure backup passphrase
- [ ] P1-020: Show "Set up key backup" prompt

#### 1.5 Secret Storage (4S/SSSS)
**Tasks:**
- [ ] P1-021: Implement secret storage initialization
- [ ] P1-022: Create security phrase/key setup
- [ ] P1-023: Implement secret storage access
- [ ] P1-024: Handle cross-device secret sharing

#### 1.6 Room Encryption
**Tasks:**
- [ ] P1-025: Enable encryption for new rooms
- [ ] P1-026: Handle encrypted message sending
- [ ] P1-027: Handle encrypted message decryption
- [ ] P1-028: Show encryption status in room header
- [ ] P1-029: Handle "Unable to decrypt" messages
- [ ] P1-030: Implement megolm session handling

---

### Phase 2: Voice/Video Infrastructure (MatrixRTC + LiveKit)
**Timeline:** 2-3 weeks  
**Complexity:** HIGH  

> **Reference:** Element Call implementation, lk-jwt-service, matrix-js-sdk MatrixRTCSession
> **Security Model:** LiveKit SFU only routes encrypted packets - never sees content

#### 2.1 MatrixRTC Backend Infrastructure
**Tasks:**
- [ ] P2-001: Deploy LiveKit SFU (Docker on dev2, port 7880)
  - Use `docker run -p 7880:7880 livekit/livekit-server`
  - Configure with `room.auto_create: false` (CRITICAL)
- [ ] P2-002: Deploy lk-jwt-service (Docker, port 8080)
  - Set `LIVEKIT_FULL_ACCESS_HOMESERVERS` to our homeserver
  - Connect to LiveKit with API key/secret
- [ ] P2-003: Configure Synapse for MatrixRTC
  - Enable MSC3266 (room summaries)
  - Enable MSC4140 (delayed events)
  - Enable MSC4222 (sync v2 state_after)
  - Set `max_event_delay_duration: 24h`
- [ ] P2-004: Set up reverse proxy routing
  - `/livekit/jwt` → lk-jwt-service:8080
  - `/livekit/sfu` → LiveKit:7880 (WebSocket)
- [ ] P2-005: Configure .well-known/matrix/client
  - Add `org.matrix.msc4143.rtc_foci` with LiveKit service URL
- [ ] P2-006: Test infrastructure with Element Call (reference implementation)

#### 2.2 matrix-js-sdk MatrixRTC Integration
**Tasks:**
- [ ] P2-007: Create MatrixRTCProvider context
  - Initialize MatrixRTCSession for rooms
  - Handle session lifecycle
- [ ] P2-008: Implement call membership management
  - Use `m.call.member` state events
  - Handle delayed leave events for proper cleanup
- [ ] P2-009: Wire up RTCEncryptionManager
  - Enable `manageMediaKeys: true`
  - Handle EncryptionKeyChanged events
  - Configure key rotation timing
- [ ] P2-010: Implement key transport
  - Use ToDeviceKeyTransport for E2EE key sharing
  - Handle KeyTransportEvents.ReceivedKeys
- [ ] P2-011: Create useMatrixRTCSession hook

#### 2.3 LiveKit Client Integration
**Tasks:**
- [ ] P2-012: Set up LiveKit client SDK with E2EE
  - Use @livekit/components-react
  - Enable E2EE with key from Matrix
- [ ] P2-013: Implement LiveKit token acquisition
  - Get OpenID token from Matrix
  - Exchange for LiveKit JWT via /livekit/jwt
- [ ] P2-014: Connect encryption keys
  - Pass Matrix encryption keys to LiveKit E2EE
  - Handle key rotation in LiveKit
- [ ] P2-015: Create useLiveKitRoom hook with E2EE

#### 2.4 Voice Channels
**Tasks:**
- [ ] P2-016: Create VoiceChannel component
- [ ] P2-017: Wire up useMatrixRTCSession to voice channels
- [ ] P2-018: Show connected users in voice channel (from call membership)
- [ ] P2-019: Implement voice channel permissions
- [ ] P2-020: Add "Join Voice" button to channels
- [ ] P2-021: Voice activity detection (speaking indicators)

#### 2.5 Video Calls
**Tasks:**
- [ ] P2-022: Create VideoCallLayout component
  - Grid view for multiple participants
  - Spotlight view for active speaker
- [ ] P2-023: Implement video toggle with proper track management
- [ ] P2-024: Implement camera selection
- [ ] P2-025: Add video call controls (mute, camera, leave)
- [ ] P2-026: Handle participant video tiles

#### 2.6 Screen Sharing
**Tasks:**
- [ ] P2-027: Implement screen capture via getDisplayMedia
- [ ] P2-028: Create screen share button
- [ ] P2-029: Show screen share in call layout (spotlight when sharing)
- [ ] P2-030: Implement screen share with system audio
- [ ] P2-031: Handle multiple simultaneous screen shares

#### 2.7 Call E2EE Verification & UI
**Tasks:**
- [ ] P2-032: Show E2EE shield indicator in calls
- [ ] P2-033: Verify call encryption is working (test with network capture)
- [ ] P2-034: Handle decryption errors gracefully
- [ ] P2-035: Test key rotation on participant join/leave
- [ ] P2-036: Performance testing with E2EE enabled

---

### Phase 3: Chat Feature Completion
**Timeline:** 1-2 weeks  
**Complexity:** MEDIUM  

#### 3.1 Message Enhancements
**Tasks:**
- [ ] P3-001: Implement message editing UI
- [ ] P3-002: Implement message deletion UI
- [ ] P3-003: Add link previews (OpenGraph)
- [ ] P3-004: Implement @mentions with autocomplete
- [ ] P3-005: Add #channel mentions
- [ ] P3-006: Implement code block syntax highlighting
- [ ] P3-007: Add emoji autocomplete
- [ ] P3-008: Implement GIF picker (Giphy/Tenor)

#### 3.2 File Handling
**Tasks:**
- [ ] P3-009: Implement encrypted file uploads
- [ ] P3-010: Add file previews (images, videos, audio)
- [ ] P3-011: Implement file download with decryption
- [ ] P3-012: Add drag-and-drop file upload
- [ ] P3-013: Show upload progress

#### 3.3 Message Search
**Tasks:**
- [ ] P3-014: Implement room message search
- [ ] P3-015: Implement global message search
- [ ] P3-016: Add search filters (user, date, room)
- [ ] P3-017: Create search results UI

---

### Phase 4: Server/Space Features
**Timeline:** 1-2 weeks  
**Complexity:** MEDIUM  

#### 4.1 Roles & Permissions
**Tasks:**
- [ ] P4-001: Create role management UI
- [ ] P4-002: Implement role creation
- [ ] P4-003: Implement permission assignment
- [ ] P4-004: Map roles to Matrix power levels
- [ ] P4-005: Show role badges on users

#### 4.2 Moderation Tools
**Tasks:**
- [ ] P4-006: Implement user kick
- [ ] P4-007: Implement user ban
- [ ] P4-008: Implement message moderation
- [ ] P4-009: Create audit log viewer
- [ ] P4-010: Implement mute functionality

#### 4.3 Invite System
**Tasks:**
- [ ] P4-011: Improve invite link generation
- [ ] P4-012: Add invite expiry options
- [ ] P4-013: Track invite usage
- [ ] P4-014: Implement invite revocation

---

### Phase 5: User Experience
**Timeline:** 1-2 weeks  
**Complexity:** MEDIUM  

#### 5.1 User Settings
**Tasks:**
- [ ] P5-001: Create settings page layout
- [ ] P5-002: Implement profile settings
- [ ] P5-003: Implement notification settings
- [ ] P5-004: Implement privacy settings
- [ ] P5-005: Implement security settings (devices, sessions)
- [ ] P5-006: Implement accessibility settings

#### 5.2 Notifications
**Tasks:**
- [ ] P5-007: Implement push notification registration
- [ ] P5-008: Create notification service worker
- [ ] P5-009: Implement notification preferences
- [ ] P5-010: Add desktop notifications
- [ ] P5-011: Implement notification sounds

#### 5.3 Mobile Responsiveness
**Tasks:**
- [ ] P5-012: Audit mobile layout issues
- [ ] P5-013: Fix mobile navigation
- [ ] P5-014: Optimize mobile chat view
- [ ] P5-015: Test on various devices

---

### Phase 6: Infrastructure & Polish
**Timeline:** 1-2 weeks  
**Complexity:** MEDIUM  

#### 6.1 Offline Support
**Tasks:**
- [ ] P6-001: Implement service worker
- [ ] P6-002: Set up IndexedDB message cache
- [ ] P6-003: Handle offline message queue
- [ ] P6-004: Sync on reconnect

#### 6.2 PWA
**Tasks:**
- [ ] P6-005: Create manifest.json
- [ ] P6-006: Add PWA icons
- [ ] P6-007: Configure install prompt
- [ ] P6-008: Test PWA installation

#### 6.3 Error Handling
**Tasks:**
- [ ] P6-009: Add error boundaries
- [ ] P6-010: Create error UI components
- [ ] P6-011: Implement error reporting
- [ ] P6-012: Add retry mechanisms

#### 6.4 Testing
**Tasks:**
- [ ] P6-013: Add E2E encryption tests
- [ ] P6-014: Add voice/video tests
- [ ] P6-015: Add integration tests
- [ ] P6-016: Performance testing

---

## Part 3: Technical Deep Dives

### E2EE Implementation Details

The Matrix SDK provides two crypto backends:
1. **libolm** (legacy JavaScript) - Deprecated
2. **matrix-sdk-crypto-wasm** (Rust compiled to WASM) - Recommended

We MUST use the Rust crypto backend for:
- Better performance
- Smaller bundle size
- Active maintenance
- Latest security fixes

#### Key Files to Create/Modify:

```
lib/matrix/
├── client.ts           # Add crypto init
├── crypto/
│   ├── index.ts        # Crypto exports
│   ├── store.ts        # IndexedDB crypto store
│   ├── verification.ts # Device verification
│   ├── cross-signing.ts# Cross-signing
│   ├── backup.ts       # Key backup
│   └── secrets.ts      # Secret storage (4S)
├── types/
│   └── crypto.ts       # Crypto types

components/
├── modals/
│   ├── device-verification-modal.tsx
│   ├── key-backup-modal.tsx
│   └── security-setup-modal.tsx
├── settings/
│   ├── security-settings.tsx
│   └── device-list.tsx
```

### Voice/Video Architecture (MatrixRTC + LiveKit)

**Research Source:** Element Call implementation, matrix-js-sdk MatrixRTCSession, lk-jwt-service

#### How Element Does It (Our Reference Implementation)

Element implements secure video calls using **MatrixRTC** - a protocol that combines:
1. **Matrix** - for signaling, room membership, and E2EE key exchange
2. **LiveKit SFU** - for media routing (the SFU never sees decrypted media)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           HAOS MatrixRTC Stack                            │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌─────────────────┐         ┌─────────────────┐                         │
│   │   HAOS Client   │◀───────▶│   HAOS Client   │   (Other participants)  │
│   │   (Browser)     │         │   (Browser)     │                         │
│   └────────┬────────┘         └────────┬────────┘                         │
│            │                           │                                  │
│            │     ┌─────────────────────┴─────────────────────┐            │
│            │     │                                           │            │
│            ▼     ▼                                           │            │
│   ┌─────────────────────┐                                    │            │
│   │    Matrix Server    │◀───────────────────────────────────┘            │
│   │     (Synapse)       │                                                 │
│   │                     │  • Call membership events (m.call.member)       │
│   │                     │  • E2EE key exchange (via encrypted events)     │
│   │                     │  • OpenID token generation (for LiveKit auth)   │
│   └─────────┬───────────┘                                                 │
│             │                                                             │
│             │ OpenID Token                                                │
│             ▼                                                             │
│   ┌─────────────────────┐                                                 │
│   │  MatrixRTC Auth     │  lk-jwt-service                                 │
│   │     Service         │  • Validates Matrix identity                    │
│   │  /livekit/jwt       │  • Generates LiveKit JWT tokens                 │
│   └─────────┬───────────┘  • Controls room creation permissions           │
│             │                                                             │
│             │ LiveKit JWT                                                 │
│             ▼                                                             │
│   ┌─────────────────────┐                                                 │
│   │    LiveKit SFU      │  • Routes ENCRYPTED media between clients       │
│   │  /livekit/sfu       │  • NEVER sees decrypted audio/video             │
│   │   (Port 7880)       │  • Just a relay - no access to content          │
│   └─────────────────────┘                                                 │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Security Model (Why This is Safe)

1. **End-to-End Encryption for Calls:**
   - Each participant generates encryption keys locally
   - Keys are exchanged via Matrix events (already E2EE encrypted)
   - Media is encrypted at the client before being sent to LiveKit
   - LiveKit SFU only sees encrypted packets
   - Decryption happens only at receiving clients

2. **Key Management (from matrix-js-sdk RTCEncryptionManager):**
   ```
   Join Call:
   1. Generate random 128-bit encryption key
   2. Send key to other participants via Matrix (encrypted)
   3. Use WebRTC Insertable Streams API to encrypt media
   4. LiveKit routes encrypted packets
   
   Participant Joins:
   1. New joiner sends their key
   2. Existing participants re-send their keys to new joiner
   
   Participant Leaves:
   1. Wait brief period (makeKeyDelay) 
   2. Generate new key (key rotation)
   3. Distribute new key to remaining participants
   4. Start using new key after useKeyDelay
   ```

3. **Key Rotation:**
   - Keys rotate when participants join/leave
   - Grace period prevents excessive rotation for rapid join/leave
   - Forward secrecy: departing users can't decrypt future media

#### Required Services

| Service | Port | Purpose |
|---------|------|---------|
| Matrix Homeserver | 8008 | Identity, signaling, key exchange |
| lk-jwt-service | 8080 | Matrix→LiveKit auth bridge |
| LiveKit SFU | 7880 | Encrypted media routing |

#### Required MSCs (Matrix Spec Changes)

The Matrix homeserver (Synapse) must have these enabled:
- **MSC3266**: Room Summary API (for knocking/federation)
- **MSC4140**: Delayed Events (for proper call signaling)
- **MSC4222**: sync v2 state_after (for reliable state tracking)

Synapse config:
```yaml
experimental_features:
  msc3266_enabled: true
  msc4222_enabled: true
max_event_delay_duration: 24h
```

#### well-known Configuration

Matrix homeserver must announce MatrixRTC backend via `.well-known/matrix/client`:
```json
{
  "m.homeserver": {
    "base_url": "https://matrix.haos.example.com"
  },
  "org.matrix.msc4143.rtc_foci": [
    {
      "type": "livekit",
      "livekit_service_url": "https://matrix-rtc.haos.example.com/livekit/jwt"
    }
  ]
}
```

#### Environment Variables
```env
# Matrix
MATRIX_HOMESERVER_URL=https://matrix.haos.example.com

# LiveKit SFU
LIVEKIT_URL=wss://matrix-rtc.haos.example.com/livekit/sfu
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret

# lk-jwt-service
LIVEKIT_FULL_ACCESS_HOMESERVERS=matrix.haos.example.com
```

#### LiveKit Config (Critical for Security)

LiveKit must NOT auto-create rooms (only authenticated users via lk-jwt-service can):
```yaml
# livekit.yaml
room:
  auto_create: false  # CRITICAL: Only lk-jwt-service creates rooms
```

#### Implementation Using matrix-js-sdk

The matrix-js-sdk provides `MatrixRTCSession` which handles:
- Call membership tracking
- E2EE key generation and distribution
- Key rotation on membership changes
- Signaling via Matrix events

Key classes to use:
- `MatrixRTCSession` - Main session manager
- `RTCEncryptionManager` - Key management (new) 
- `EncryptionManager` - Legacy key management
- `KeyTransport` - Key distribution (to-device or room events)

#### Phase 2 Updated Tasks

With this architecture, Phase 2 tasks become:

```yaml
Phase 2.1 - Infrastructure:
  - Deploy LiveKit SFU (Docker, port 7880)
  - Deploy lk-jwt-service (Docker, port 8080)
  - Configure Synapse for MatrixRTC (MSC3266, MSC4140, MSC4222)
  - Set up .well-known/matrix/client with rtc_foci
  - Configure nginx/caddy routing (/livekit/jwt, /livekit/sfu)
  - Disable LiveKit auto_create: false

Phase 2.2 - Client Integration:
  - Use matrix-js-sdk's MatrixRTCSession
  - Implement call join/leave with proper membership events
  - Wire up RTCEncryptionManager for E2EE
  - Use LiveKit client SDK with E2EE enabled
  - Connect LiveKit to encryption keys from Matrix

Phase 2.3 - UI:
  - Voice channel UI with participant list
  - Video call layout (grid/spotlight)
  - Call controls (mute, camera, screenshare, leave)
  - E2EE indicator (shield icon)
  - Speaking indicators
```

---

## Part 4: Priority Matrix

| Phase | Priority | Security Impact | User Impact | Effort |
|-------|----------|-----------------|-------------|--------|
| P1: E2EE | 🔴 CRITICAL | 100% | High | High |
| P2: Voice/Video | 🟠 HIGH | 20% | Very High | Medium |
| P3: Chat Features | 🟡 MEDIUM | 10% | High | Medium |
| P4: Server Features | 🟡 MEDIUM | 15% | Medium | Medium |
| P5: User Experience | 🟢 NORMAL | 5% | High | Medium |
| P6: Infrastructure | 🟢 NORMAL | 10% | Medium | Medium |

**Recommended Order:**
1. **Phase 1** (E2EE) - Security is non-negotiable
2. **Phase 2** (Voice/Video) - Core differentiator vs other clients
3. **Phase 3 + 4** (Chat + Server) - Can be parallelized
4. **Phase 5 + 6** (UX + Infra) - Polish and stability

---

## Part 5: Task Breakdown for PROACTIVE-JOBS.md

### Immediate Tasks (Week 1)

```yaml
- id: haos-p1-crypto-init
  title: "HAOS P1: Crypto Initialization"
  description: "Set up matrix-sdk-crypto-wasm and initialize crypto in Matrix client"
  model: opus
  tasks:
    - Add @matrix-org/matrix-sdk-crypto-wasm dependency
    - Create crypto store with IndexedDB
    - Initialize Rust crypto on client start
    - Handle crypto ready state in provider
    - Test basic encryption/decryption
  acceptance:
    - Crypto initializes without errors
    - Messages can be encrypted/decrypted
    - Crypto store persists across refreshes

- id: haos-p1-device-verify
  title: "HAOS P1: Device Verification"
  description: "Implement emoji and QR code device verification"
  model: sonnet
  depends_on: haos-p1-crypto-init
  tasks:
    - Create DeviceVerificationModal component
    - Implement emoji verification flow
    - Add verification request handling
    - Show verification prompts
    - Display device verification status

- id: haos-p2-livekit-deploy
  title: "HAOS P2: Deploy LiveKit Server"
  description: "Set up LiveKit server for voice/video"
  model: sonnet
  tasks:
    - Deploy LiveKit via Docker on dev2
    - Configure TLS with Caddy
    - Set up API credentials
    - Enable LiveKit API route
    - Test basic connectivity
```

---

## Part 6: Definition of Done

### For Element-Level Security:
- [ ] All messages are E2EE by default
- [ ] New devices require verification
- [ ] Key backup is set up and working
- [ ] Cross-signing is fully functional
- [ ] Users can verify other users
- [ ] Encrypted calls work with E2EE
- [ ] No plaintext message content ever leaves the client

### For Discord-Level Features:
- [ ] Voice channels work like Discord
- [ ] Video calls support multiple participants
- [ ] Screen sharing works
- [ ] Servers and channels work intuitively
- [ ] Roles and permissions are configurable
- [ ] Mobile experience is good
- [ ] Push notifications work

---

## Appendix A: Dependencies to Add

```json
{
  "dependencies": {
    // E2EE (Phase 1)
    "@matrix-org/matrix-sdk-crypto-wasm": "^17.0.0",
    "idb": "^8.0.0",  // IndexedDB wrapper
    
    // MatrixRTC Voice/Video (Phase 2)
    "@livekit/components-react": "^2.0.0",  // LiveKit React components
    "livekit-client": "^2.0.0",             // LiveKit client SDK
    
    // Already in matrix-js-sdk:
    // - MatrixRTCSession
    // - RTCEncryptionManager  
    // - KeyTransport
  }
}
```

### Docker Services to Deploy

```yaml
# docker-compose.yml for MatrixRTC backend
version: "3.9"

services:
  livekit:
    image: livekit/livekit-server:latest
    ports:
      - "7880:7880"  # WebSocket
      - "7881:7881"  # RTC
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
    command: --config /etc/livekit.yaml
    restart: unless-stopped

  lk-jwt-service:
    image: ghcr.io/element-hq/lk-jwt-service:latest
    ports:
      - "8080:8080"
    environment:
      LIVEKIT_URL: "ws://livekit:7880"
      LIVEKIT_KEY: "${LIVEKIT_API_KEY}"
      LIVEKIT_SECRET: "${LIVEKIT_API_SECRET}"
      LIVEKIT_FULL_ACCESS_HOMESERVERS: "matrix.haos.example.com"
    depends_on:
      - livekit
    restart: unless-stopped
```

```yaml
# livekit.yaml
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000

room:
  auto_create: false  # CRITICAL: Only lk-jwt-service can create rooms

keys:
  your_api_key: your_secret_key
```

## Appendix B: Reference Implementations

### E2EE (Phase 1)
- Element Web crypto: https://github.com/element-hq/element-web
- matrix-js-sdk crypto: https://github.com/matrix-org/matrix-js-sdk/tree/develop/src/crypto
- matrix-sdk-crypto-wasm: https://github.com/matrix-org/matrix-rust-sdk/tree/main/crates/matrix-sdk-crypto-wasm

### MatrixRTC Voice/Video (Phase 2)
- Element Call (REFERENCE IMPLEMENTATION): https://github.com/element-hq/element-call
- lk-jwt-service (auth bridge): https://github.com/element-hq/lk-jwt-service
- MatrixRTCSession: https://github.com/matrix-org/matrix-js-sdk/blob/develop/src/matrixrtc/MatrixRTCSession.ts
- RTCEncryptionManager: https://github.com/matrix-org/matrix-js-sdk/blob/develop/src/matrixrtc/RTCEncryptionManager.ts
- Self-hosting guide: https://github.com/element-hq/element-call/blob/livekit/docs/self-hosting.md

### MSC References
- MSC3266 (Room summaries): https://github.com/matrix-org/matrix-spec-proposals/pull/3266
- MSC4140 (Delayed events): https://github.com/matrix-org/matrix-spec-proposals/pull/4140
- MSC4143 (RTC foci discovery): https://github.com/matrix-org/matrix-spec-proposals/pull/4143
- MSC4195 (LiveKit backend): https://github.com/matrix-org/matrix-spec-proposals/pull/4195
- MSC4222 (sync v2 state_after): https://github.com/matrix-org/matrix-spec-proposals/pull/4222

### LiveKit E2EE
- LiveKit client E2EE: https://github.com/livekit/client-sdk-js/blob/main/src/e2ee/E2eeManager.ts
- LiveKit E2EE uses WebRTC Insertable Streams API to encrypt media client-side

## Appendix C: Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Crypto implementation bugs | HIGH | MEDIUM | Extensive testing, follow Element patterns exactly |
| LiveKit server costs | MEDIUM | LOW | Self-host on existing infrastructure |
| Browser compatibility | MEDIUM | LOW | Test across browsers, polyfills |
| Performance issues | MEDIUM | MEDIUM | Profiling, lazy loading, virtualization |
| MatrixRTC key exchange failures | HIGH | LOW | Follow matrix-js-sdk RTCEncryptionManager patterns |
| LiveKit E2EE complexity | HIGH | MEDIUM | Use Element Call as reference, extensive testing |
| Synapse MSC compatibility | MEDIUM | LOW | Test each MSC independently, check Synapse version |
| lk-jwt-service misconfiguration | HIGH | MEDIUM | Follow Element docs exactly, test auth flow |
| Call E2EE key rotation bugs | HIGH | MEDIUM | Test join/leave scenarios extensively |
| WebRTC Insertable Streams support | MEDIUM | LOW | Check browser support, graceful degradation |

## Appendix D: Security Verification Checklist

Before going live with voice/video:

### Infrastructure
- [ ] LiveKit `auto_create: false` confirmed
- [ ] lk-jwt-service validates Matrix OpenID tokens
- [ ] lk-jwt-service restricts room creation to allowed homeservers
- [ ] TLS enabled for all endpoints
- [ ] Synapse OpenID listener configured

### E2EE for Calls
- [ ] Encryption keys generated client-side only
- [ ] Keys distributed via encrypted Matrix events
- [ ] LiveKit receives only encrypted media (verify with packet capture)
- [ ] Key rotation occurs on participant leave
- [ ] New joiners cannot decrypt old call history
- [ ] E2EE indicator shown in UI

### Testing
- [ ] Test with 2, 5, 10+ participants
- [ ] Test rapid join/leave scenarios
- [ ] Test key rotation under load
- [ ] Test with poor network conditions
- [ ] Verify no plaintext in network traces

---

**This plan is comprehensive and covers ALL shortcomings identified in the audit. Execution should begin with Phase 1 (E2EE) immediately as it is the most critical security gap.**
