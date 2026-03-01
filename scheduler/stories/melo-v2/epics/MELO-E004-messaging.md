# Epic: [MELO-E004] Text Messaging

**Project:** Melo V2
**Status:** needs-audit
**Priority:** P0 (Critical)
**Created:** 2026-02-22
**Test Server:** https://dev2.aaroncollins.info

---

## Description

Core text messaging functionality. Users can send, edit, delete, and interact with messages. Supports rich content including files, embeds, reactions, threads, and mentions.

---

## Business Value

- **Core Experience:** Messaging is the primary feature users interact with
- **Engagement:** Rich features (reactions, threads) increase engagement
- **Communication:** Enables meaningful conversations in communities

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-0401 | User can send text message | User | P0 | ⏳ |
| MELO-US-0402 | User can see messages in real-time | User | P0 | ⏳ |
| MELO-US-0403 | User can edit their message | User | P0 | ⏳ |
| MELO-US-0404 | User can delete their message | User | P0 | ⏳ |
| MELO-US-0405 | User can reply to message | User | P0 | ⏳ |
| MELO-US-0406 | User can start thread | User | P1 | ⏳ |
| MELO-US-0407 | User can add reaction | User | P0 | ⏳ |
| MELO-US-0408 | User can @mention user | User | P0 | ⏳ |
| MELO-US-0409 | User can @mention role | User | P1 | ⏳ |
| MELO-US-0410 | User can upload file | User | P0 | ⏳ |
| MELO-US-0411 | User can upload image | User | P0 | ⏳ |
| MELO-US-0412 | User can see link previews | User | P1 | ⏳ |
| MELO-US-0413 | User can use markdown | User | P1 | ⏳ |
| MELO-US-0414 | User can send code blocks | User | P1 | ⏳ |
| MELO-US-0415 | User can use emoji picker | User | P1 | ⏳ |
| MELO-US-0416 | User can pin messages | Admin | P2 | ⏳ |
| MELO-US-0417 | User can see typing indicator | User | P2 | ⏳ |
| MELO-US-0418 | Messages encrypted (E2EE) | Technical | P0 | ⏳ |
| MELO-US-0419 | User can search messages | User | P2 | ⏳ |
| MELO-US-0420 | Mod can delete any message | Moderator | P1 | ⏳ |

---

## Acceptance Criteria (Epic-Level)

1. **Send:** Users can compose and send text messages
2. **Receive:** Messages appear in real-time (<500ms)
3. **Edit:** Users can edit their own messages, (edited) indicator shown
4. **Delete:** Users can delete their own messages
5. **Reply:** Users can reply to specific messages with context
6. **Reactions:** Users can add emoji reactions to messages
7. **Files:** Users can upload and view files/images
8. **Mentions:** @mentions notify users and highlight message
9. **E2EE:** All messages encrypted by default

---

## Dependencies

### Upstream
- MELO-E001 (Authentication) - Required for sending
- MELO-E002 (Servers) - Messages exist in server context
- MELO-E003 (Channels) - Messages sent in channels
- MELO-E010 (E2EE) - Encryption for messages

### Downstream
- MELO-E009 (Notifications) - Mentions trigger notifications

---

## Technical Notes

- Messages via Matrix m.room.message events
- Reactions via m.reaction events
- Threads via m.thread relation
- E2EE via Megolm encryption
- File upload via Matrix media API or UploadThing
- Real-time via Matrix sync

---

## Contingencies

| Scenario | Expected Behavior |
|----------|-------------------|
| Message send fails | Show error, allow retry, don't lose content |
| Large file upload | Progress indicator, size limit error if exceeded |
| Slow sync | Show "connecting" indicator, queue messages |
| E2EE unavailable | Show encrypted message placeholder |
| Rate limited | Show wait time, queue message |
| Markdown parse error | Show raw text, don't break |

---

## Test Requirements

### Device Sizes
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### Screenshot Evidence Required For
- Message input area
- Sent message display
- Message with reactions
- Reply to message
- Thread view
- Edit message flow
- Delete message confirmation
- File upload in progress
- Image message display
- Link preview display
- Emoji picker open
- @mention autocomplete
- Message with (edited) indicator

---

---

## VSDD Compliance (Mandatory)

### Verification Properties

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-MSG-01 | Send message appears in timeline within 500ms | E2E timing test | AC-1, AC-2 |
| VP-MSG-02 | Edit updates message content, shows (edited) | E2E test | AC-3 |
| VP-MSG-03 | Delete removes message, shows placeholder | E2E test | AC-4 |
| VP-MSG-04 | Reply preserves context link | E2E test | AC-5 |
| VP-MSG-05 | Reactions increment/decrement deterministically | Unit test | AC-6 |
| VP-MSG-06 | File upload completes with progress indicator | E2E test | AC-7 |
| VP-MSG-07 | @mentions resolve to correct users | Unit test | AC-8 |
| VP-MSG-08 | E2EE encryption is verified per message | Crypto test | AC-9 |

### Purity Boundary Map

**Pure Core (Deterministic, no side effects):**
- `messageReducer()` — State transitions for message list
- `parseMarkdown()` — Markdown → HTML (pure transform)
- `parseCodeBlock()` — Code syntax detection (pure)
- `formatMention()` — @mention parsing (pure)
- `reactionReducer()` — Reaction count management
- `validateMessageContent()` — Content validation
- `sortMessagesByTimestamp()` — Timeline ordering

**Effectful Shell (Side effects allowed):**
- Matrix SDK message send/edit/delete
- Matrix media API for file upload
- Matrix sync for real-time updates
- E2EE encryption/decryption operations

**Adapters (Thin wrappers):**
- `useMessages()` hook — Connects messageReducer to Matrix sync
- `useMessageActions()` hook — Wraps send/edit/delete effects
- `useReactions()` hook — Wraps reaction effects

### Red Gate Tests (Must fail before implementation)

| Test File | Test Description | Expected Failure |
|-----------|------------------|------------------|
| `tests/messages/messageReducer.test.ts` | ADD_MESSAGE appends to timeline | `messageReducer is not defined` |
| `tests/messages/messageReducer.test.ts` | EDIT_MESSAGE updates content | `messageReducer is not defined` |
| `tests/messages/parseMarkdown.test.ts` | Bold text renders correctly | `parseMarkdown is not defined` |
| `tests/messages/reactionReducer.test.ts` | Add reaction increments count | `reactionReducer is not defined` |
| `tests/e2e/messages.spec.ts` | Send message appears in channel | Element not found |
| `tests/e2e/messages.spec.ts` | Edit shows (edited) indicator | Element not found |

### Contract Chain

```
Spec: MELO-E004 (Messaging Epic)
  ↓
Stories: MELO-US-0401 through MELO-US-0420
  ↓
Properties: VP-MSG-01 through VP-MSG-08
  ↓
Beads: bd-msg-* (to be created per story)
  ↓
Tests: tests/messages/*.test.ts, tests/e2e/messages.spec.ts
  ↓
Code: lib/messages/reducer.ts, lib/messages/markdown.ts, hooks/useMessages.ts
```

---

## Progress Tracking

| Date | Update |
|------|--------|
| 2026-02-22 | Epic created |
| 2026-03-01 | VSDD sections added |
