# Epic: [MELO-E005] Direct Messages

**Project:** Melo V2
**Status:** needs-audit  
**Priority:** P0 (Critical)
**Created:** 2026-02-22

---

## Description

Private 1:1 and group messaging outside of servers. Essential for personal conversations.

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-0501 | User can see DM list | User | P0 | ⏳ |
| MELO-US-0502 | User can start DM with user | User | P0 | ⏳ |
| MELO-US-0503 | User can send message in DM | User | P0 | ⏳ |
| MELO-US-0504 | User can create group DM | User | P1 | ⏳ |
| MELO-US-0505 | User can leave group DM | User | P1 | ⏳ |
| MELO-US-0506 | User can block user | User | P1 | ⏳ |
| MELO-US-0507 | User can unblock user | User | P1 | ⏳ |
| MELO-US-0508 | DMs show unread indicator | User | P1 | ⏳ |
| MELO-US-0509 | DMs support all message features | User | P0 | ⏳ |
| MELO-US-0510 | DMs encrypted (E2EE) | Technical | P0 | ⏳ |

---

## Dependencies

- MELO-E001 (Authentication)
- MELO-E004 (Messaging) - Reuses messaging components
- MELO-E010 (E2EE)

---

## Test Requirements

Screenshot evidence for:
- DM list with conversations
- DM list empty state
- Starting new DM
- DM conversation view
- Group DM creation
- Block user flow
