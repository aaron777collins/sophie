# Epic: [MELO-E009] Notifications

**Project:** Melo V2
**Status:** needs-audit
**Priority:** P1 (High)
**Created:** 2026-02-22

---

## Description

Push and in-app notifications to keep users informed of activity.

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-0901 | User receives push notifications | User | P0 | ⏳ |
| MELO-US-0902 | User can configure per-server | User | P1 | ⏳ |
| MELO-US-0903 | User can configure per-channel | User | P1 | ⏳ |
| MELO-US-0904 | User can enable DND mode | User | P1 | ⏳ |
| MELO-US-0905 | User sees unread badges | User | P0 | ⏳ |
| MELO-US-0906 | Mentions are highlighted | User | P0 | ⏳ |
| MELO-US-0907 | Mobile push works | User | P0 | ⏳ |

---

## Dependencies

- MELO-E001 (Authentication)
- Service Worker registered
- Push notification permission

---

## Test Requirements

Screenshot evidence for:
- Push notification on mobile
- Unread badge on server
- Unread badge on channel
- Notification settings panel

---

## VSDD Compliance (Mandatory)

### Verification Properties (Epic-Level)

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-NOT-01 | Push notification triggers on message | E2E test | US-0901, US-0907 |
| VP-NOT-02 | Server/channel settings respected | E2E test | US-0902, US-0903 |
| VP-NOT-03 | DND mode suppresses notifications | E2E test | US-0904 |
| VP-NOT-04 | Unread badges accurate | Unit test | US-0905 |
| VP-NOT-05 | Mentions highlighted correctly | E2E test | US-0906 |

### Purity Boundary Map (Epic-Level)

**Pure Core (Deterministic, no side effects):**
- `notificationReducer()` — Notification state
- `calculateUnreadCount()` — Badge count logic
- `shouldNotify()` — Notification decision logic
- `parseMention()` — Mention detection

**Effectful Shell (Side effects allowed):**
- Push notification API
- Service Worker messaging
- Notification permission requests
- Matrix sync for unread counts

**Adapters (Thin wrappers):**
- `useNotifications()` hook — Notification management
- `usePushSubscription()` hook — Push registration
- `useUnreadBadges()` hook — Badge display

### Contract Chain (Epic-Level)

```
Spec: MELO-E009 (Notifications)
  ↓
Stories: MELO-US-0901 through MELO-US-0907
  ↓
Properties: VP-NOT-01 through VP-NOT-05
  ↓
Beads: bd-not-* (per story)
  ↓
Tests: tests/notifications/*.test.ts, tests/e2e/notifications.spec.ts
  ↓
Code: lib/notifications/*, hooks/useNotifications.ts
```
