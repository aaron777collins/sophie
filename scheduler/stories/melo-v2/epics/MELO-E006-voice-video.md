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
