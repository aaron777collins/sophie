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

---

## VSDD Compliance (Mandatory)

### Verification Properties (Epic-Level)

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-DM-01 | DM list shows all active conversations | E2E test | US-0501 |
| VP-DM-02 | Starting DM creates Matrix room | Integration test | US-0502 |
| VP-DM-03 | DM messages use E2EE | Crypto verification | US-0510 |
| VP-DM-04 | Block prevents message receipt | E2E test | US-0506 |
| VP-DM-05 | Unread indicator accurate | Unit test | US-0508 |

### Purity Boundary Map (Epic-Level)

**Pure Core (Deterministic, no side effects):**
- `dmReducer()` — DM list state transitions
- `sortDMsByRecent()` — Conversation ordering
- `calculateUnreadCount()` — Unread badge logic
- `validateBlockAction()` — Block validation

**Effectful Shell (Side effects allowed):**
- Matrix direct room creation
- Matrix sync for DM updates
- Block/unblock API calls
- E2EE encryption operations

**Adapters (Thin wrappers):**
- `useDMList()` hook — DM list management
- `useDirectMessage()` hook — Single DM operations
- `useBlockList()` hook — Block management

### Contract Chain (Epic-Level)

```
Spec: MELO-E005 (Direct Messages)
  ↓
Stories: MELO-US-0501 through MELO-US-0510
  ↓
Properties: VP-DM-01 through VP-DM-05
  ↓
Beads: bd-dm-* (per story)
  ↓
Tests: tests/dm/*.test.ts, tests/e2e/dm.spec.ts
  ↓
Code: lib/dm/reducer.ts, hooks/useDM*.ts
```
