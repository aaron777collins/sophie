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
