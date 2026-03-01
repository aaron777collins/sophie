# Epic: [MELO-E010] End-to-End Encryption & Privacy

**Project:** Melo V2
**Status:** needs-audit
**Priority:** P0 (Critical)
**Created:** 2026-02-22

---

## Description

E2EE implementation using Matrix's Megolm encryption. Device verification and key backup.

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-1001 | Messages encrypted by default | Technical | P0 | ⏳ |
| MELO-US-1002 | User can verify device | User | P1 | ⏳ |
| MELO-US-1003 | User can cross-sign devices | User | P1 | ⏳ |
| MELO-US-1004 | User can backup keys | User | P1 | ⏳ |
| MELO-US-1005 | User can restore keys | User | P1 | ⏳ |
| MELO-US-1006 | Encrypted indicator shown | User | P1 | ⏳ |
| MELO-US-1007 | UTD messages handled | Technical | P0 | ⏳ |
| MELO-US-1008 | Key sharing works | Technical | P0 | ⏳ |

---

## Dependencies

- MELO-E001 (Authentication)
- Matrix Crypto SDK

---

## Test Requirements

Screenshot evidence for:
- Encryption indicator on messages
- Device verification flow
- Key backup setup
- UTD message placeholder

---

## VSDD Compliance (Mandatory)

### Verification Properties (Epic-Level)

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-E2E-01 | All messages encrypted before send | Crypto test | US-1001 |
| VP-E2E-02 | Device verification produces trust | E2E test | US-1002, US-1003 |
| VP-E2E-03 | Key backup is recoverable | Restore test | US-1004, US-1005 |
| VP-E2E-04 | UTD messages show clear placeholder | E2E test | US-1007 |
| VP-E2E-05 | Key sharing completes successfully | Integration test | US-1008 |

### Purity Boundary Map (Epic-Level)

**Pure Core (Deterministic, no side effects):**
- `validateDeviceKey()` — Key format validation
- `formatUTDMessage()` — Placeholder formatting
- `verificationStateReducer()` — Verification flow state

**Effectful Shell (Side effects allowed):**
- Matrix Crypto SDK operations
- Key backup to server
- Key restore from server
- Device cross-signing
- Megolm session management

**Adapters (Thin wrappers):**
- `useEncryption()` hook — Encryption status
- `useDeviceVerification()` hook — Verification flow
- `useKeyBackup()` hook — Backup operations

### Contract Chain (Epic-Level)

```
Spec: MELO-E010 (E2EE & Privacy)
  ↓
Stories: MELO-US-1001 through MELO-US-1008
  ↓
Properties: VP-E2E-01 through VP-E2E-05
  ↓
Beads: bd-e2e-* (per story)
  ↓
Tests: tests/crypto/*.test.ts, tests/e2e/encryption.spec.ts
  ↓
Code: lib/crypto/*, hooks/useEncryption.ts
```
