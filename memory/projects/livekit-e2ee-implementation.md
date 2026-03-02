# LiveKit E2EE Implementation Plan

**Created:** 2026-03-01 23:20 EST
**Related:** matrix-voice-chat.md
**Goal:** Enable true end-to-end encryption for video/voice rooms with LiveKit

---

## Current State Analysis

### What's Working ✅
- Synapse homeserver on matrix3.aaroncollins.info
- LiveKit SFU at livekit3.aaroncollins.info
- lk-jwt-service for MatrixRTC token bridging
- `.well-known` advertising MSC3401 + MSC4143 RTC foci
- Sophie Room is encrypted (Megolm for messages)
- Element X clients can connect

### What's Missing ❓
- **E2EE for voice/video** — Currently only SRTP (transport encryption)
- **Element Call deployment** — Not deployed (Element X has it embedded, but uncertain about E2EE)
- **Verification** — No confirmation that E2EE is actually working for calls

---

## Element Call E2EE Architecture

Element Call uses **insertable streams** for E2EE:
1. Matrix room encryption (Megolm) is used for key exchange
2. Keys are shared via to-device messages or room state
3. Media tracks are encrypted client-side before sending to LiveKit
4. LiveKit sees only encrypted bytes (cannot decrypt)

### Requirements for E2EE Calls
1. **Encrypted Matrix room** ✅ (Sophie Room is encrypted)
2. **Browser with insertable streams** ✅ (Chrome/Firefox support it)
3. **Element Call client** — Either embedded (Element X) or web instance

---

## Investigation Tasks

### Task 1: Verify Element X E2EE Support
Element X has Element Call embedded. Check if:
- E2EE is enabled by default
- The shield icon appears during calls
- Key verification is happening

### Task 2: Check Element Call Web Option
The ansible playbook has `matrix_element_call_enabled`. Options:
- Deploy Element Call web at `call.aaroncollins.info`
- This gives a dedicated E2EE-enabled calling interface

### Task 3: Test Current Setup
- Join a call from Element X
- Check for E2EE indicators
- Verify LiveKit only sees encrypted streams

---

## Implementation Options

### Option A: Trust Element X Built-in (Minimal Work)
- Element X should already use E2EE if room is encrypted
- Just need to verify it's working
- No additional deployment needed

### Option B: Deploy Element Call Web (Full Control)
- Enable in ansible: `matrix_element_call_enabled: true`
- Provides web-based calling with explicit E2EE
- Better for users without Element X

### Option C: Both (Recommended)
- Verify Element X E2EE works
- Deploy Element Call web as backup
- Full coverage for all client types

---

## Action Plan

### Phase 1: Verification (30 min)
1. [ ] Research Element X E2EE call support
2. [ ] Check Element Call documentation for requirements
3. [ ] Test current setup with Element X

### Phase 2: Deploy Element Call Web (1 hour)
1. [ ] Add Element Call to ansible vars
2. [ ] Configure E2EE settings
3. [ ] Run playbook
4. [ ] Test at call.aaroncollins.info

### Phase 3: Validation (30 min)
1. [ ] Verify E2EE indicators in call UI
2. [ ] Test call quality
3. [ ] Document final setup

---

## Progress Log

### 2026-03-01 23:20 EST
- Created implementation plan
- Analyzed current infrastructure
- Identified Element Call as the solution
