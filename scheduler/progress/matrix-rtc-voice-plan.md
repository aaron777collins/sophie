# Matrix RTC Voice Integration Plan

**Status:** Active Development  
**Last Updated:** 2026-03-03 14:20 EST  
**Current Phase:** Phase 1 - Unencrypted Voice (E2EE deferred)

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-03 | Defer E2EE, use unencrypted LiveKit first | Focus on core voice functionality; TLS/DTLS-SRTP provides transport security |

---

## Phase 1: Unencrypted Voice Chat (CURRENT)

### Security Model (Without E2EE)
- **WSS (WebSocket Secure):** Signaling encrypted in transit
- **DTLS-SRTP:** Media encrypted between client ↔ LiveKit server
- **Result:** No eavesdropping on the wire; LiveKit server *can* see content
- **Acceptable for:** Development, testing, trusted self-hosted LiveKit

### TODO - Phase 1
- [ ] Get basic LiveKit room joining working
- [ ] Audio publishing/subscribing without E2EE
- [ ] Matrix room state for call signaling
- [ ] Test with Element Call (unencrypted mode)

---

## Research Summary (Completed 2026-03-03)

### 1. LiveKit E2EE Architecture
**Source:** `scheduler/progress/livekit-e2ee-research.md`

**Key Points:**
- Shared key approach: `e2ee_options.key_provider_options.shared_key = SHARED_KEY`
- Room-level encryption for media + data channels
- Client responsible for key generation/distribution
- Python SDK example: `rtc.RoomOptions(auto_subscribe=True, e2ee=e2ee_options)`

**Element Call Dependencies:**
- `livekit-client`: ^2.13.0
- `@livekit/components-core`: ^0.12.0
- `@livekit/components-react`: ^2.0.0

### 2. Element X Architecture
**Source:** `scheduler/progress/element-x-rtc-research.md`

**Key Discovery:** WebView Hybrid Architecture
- Native apps (iOS/Android) handle UI, notifications, lifecycle
- Element Call embedded web component handles all crypto
- Matrix Rust SDK manages protocol layer
- `io.element.android:element-call-embedded:0.17.0`

**Implications:**
- SFrame encryption happens in JavaScript/WebView
- Native code doesn't touch encryption directly
- Key exchange via to-device messages → JS bridge

### 3. SFrame Encryption Standard
**Source:** `scheduler/progress/matrix-rtc-spec-research.md`

**Algorithm:** SFrame (Secure Frame) per IETF draft-ietf-sframe-enc

**Key Derivation (HKDF):**
```
sframe_secret = HKDF-Extract("", base_key)
sframe_key = HKDF-Expand(sframe_secret, "SFrame 1.0 Secret key " + KID + cipher_suite, AEAD.Nk)
sframe_salt = HKDF-Expand(sframe_secret, "SFrame 1.0 Secret salt " + KID + cipher_suite, AEAD.Nn)
```

**Cipher Suites:**
| Suite | Key Size | Nonce | Tag |
|-------|----------|-------|-----|
| AES_128_GCM_SHA256_128 | 16 bytes | 12 bytes | 16 bytes |
| AES_256_GCM_SHA512_128 | 32 bytes | 12 bytes | 16 bytes |

**Key Exchange Options:**
1. **Sender Keys:** Each participant generates own key, distributed via E2E channel
2. **MLS Integration:** Group key management with forward secrecy

**Reference Implementation:** https://github.com/sframe-wg/sframe/tree/main/reference-implementation (Rust)

---

## Phase 2: E2EE Implementation (DEFERRED)

### When Ready
1. Implement SFrame encryption layer
2. Key distribution via Matrix to-device messages (`io.element.call.encryption_keys`)
3. Match Element Call's KeyProvider settings
4. Test interop with Element Call

### Open Questions for E2EE
- Exact `ratchet_salt` Element uses
- Key rotation mechanism
- How Matrix room keys map to LiveKit keys
- Python SFrame library (need to find/build)

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Sophie/Bot    │     │  LiveKit Server │     │  Element Call   │
│   (Python)      │     │  (Self-hosted)  │     │  (Web/Mobile)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │◄──── WSS/DTLS ───────►│◄──── WSS/DTLS ───────►│
         │     (encrypted)       │     (encrypted)       │
         │                       │                       │
         │  Media via SFU        │  Media via SFU        │
         │◄─────────────────────►│◄─────────────────────►│
         │                       │                       │
┌────────┴────────┐     ┌────────┴────────┐     ┌────────┴────────┐
│  Matrix Client  │     │  Matrix Server  │     │  Matrix Client  │
│  (nio)          │◄───►│  (Synapse)      │◄───►│  (SDK)          │
└─────────────────┘     └─────────────────┘     └─────────────────┘

Phase 1: DTLS-SRTP only (server can see media)
Phase 2: + SFrame E2EE (server cannot see media)
```

---

## Files

| File | Purpose |
|------|---------|
| `scheduler/progress/livekit-e2ee-research.md` | LiveKit E2EE details |
| `scheduler/progress/element-x-rtc-research.md` | Element X architecture |
| `scheduler/progress/matrix-rtc-spec-research.md` | SFrame/MSC4143 spec |
| `scheduler/progress/matrix-rtc-voice-plan.md` | This plan file |

---

## Next Steps

1. **Set up LiveKit test room** (no E2EE)
2. **Basic Python client** - join room, publish/subscribe audio
3. **Matrix integration** - room state for call signaling
4. **Test with Element** - verify interop works unencrypted
5. **Then** add E2EE layer
