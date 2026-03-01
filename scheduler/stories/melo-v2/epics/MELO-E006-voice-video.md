# Epic: [MELO-E006] Voice & Video Calls

**Project:** Melo V2
**Status:** needs-audit
**Priority:** P0 (Critical)
**Created:** 2026-02-22

---

## Description

Real-time voice and video communication via LiveKit. Users can join voice channels, enable video, and share screens.

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-0601 | User can join voice channel | User | P0 | ⏳ |
| MELO-US-0602 | User can leave voice channel | User | P0 | ⏳ |
| MELO-US-0603 | User can mute self | User | P0 | ⏳ |
| MELO-US-0604 | User can deafen | User | P0 | ⏳ |
| MELO-US-0605 | User can enable video | User | P1 | ⏳ |
| MELO-US-0606 | User can share screen | User | P1 | ⏳ |
| MELO-US-0607 | User can see who's in voice | User | P0 | ⏳ |
| MELO-US-0608 | User can adjust user volume | User | P2 | ⏳ |
| MELO-US-0609 | Mod can mute user in voice | Moderator | P1 | ⏳ |
| MELO-US-0610 | Mod can disconnect user | Moderator | P1 | ⏳ |
| MELO-US-0611 | Voice indicator shows speaking | User | P1 | ⏳ |
| MELO-US-0612 | Call survives brief disconnect | Technical | P1 | ⏳ |

---

## Dependencies

- MELO-E001 (Authentication)
- MELO-E003 (Channels) - Voice channels
- LiveKit server configured

---

## Test Requirements

Screenshot evidence for:
- Voice channel with users
- Mute/deafen controls
- Video grid
- Screen share view
- Voice indicator active

---

## VSDD Compliance (Mandatory)

### Verification Properties (Epic-Level)

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-VV-01 | Join/leave produces correct voice state | E2E test | US-0601, US-0602 |
| VP-VV-02 | Mute/deafen toggles local audio correctly | E2E test | US-0603, US-0604 |
| VP-VV-03 | Video track toggles correctly | E2E test | US-0605 |
| VP-VV-04 | Screen share broadcasts to room | E2E test | US-0606 |
| VP-VV-05 | Participant list is accurate | E2E test | US-0607 |
| VP-VV-06 | Speaking indicator reflects audio level | Unit test | US-0611 |

### Purity Boundary Map (Epic-Level)

**Pure Core (Deterministic, no side effects):**
- `voiceReducer()` — Voice channel state transitions
- `calculateSpeakingState()` — Speaking indicator logic
- `volumeNormalize()` — Volume level normalization
- `participantSort()` — Participant list ordering

**Effectful Shell (Side effects allowed):**
- LiveKit room connection
- WebRTC media tracks
- Audio/video device access
- Screen capture API

**Adapters (Thin wrappers):**
- `useVoiceChannel()` hook — Voice channel management
- `useMediaTracks()` hook — Local audio/video
- `useParticipants()` hook — Remote participants

### Contract Chain (Epic-Level)

```
Spec: MELO-E006 (Voice & Video)
  ↓
Stories: MELO-US-0601 through MELO-US-0612
  ↓
Properties: VP-VV-01 through VP-VV-06
  ↓
Beads: bd-vv-* (per story)
  ↓
Tests: tests/voice/*.test.ts, tests/e2e/voice.spec.ts
  ↓
Code: lib/voice/*, hooks/useVoice*.ts, LiveKit integration
```
