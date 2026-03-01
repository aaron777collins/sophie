# Epic: [MELO-E008] User Settings & Profile

**Project:** Melo V2
**Status:** needs-audit
**Priority:** P1 (High)
**Created:** 2026-02-22

---

## Description

User profile customization and application settings. Users can personalize their experience.

---

## User Stories

| Story ID | Title | Perspective | Priority | Status |
|----------|-------|-------------|----------|--------|
| MELO-US-0801 | User can edit profile | User | P0 | ⏳ |
| MELO-US-0802 | User can set avatar | User | P0 | ⏳ |
| MELO-US-0803 | User can set status | User | P1 | ⏳ |
| MELO-US-0804 | User can switch themes | User | P0 | ⏳ |
| MELO-US-0805 | User can configure notifications | User | P0 | ⏳ |
| MELO-US-0806 | User can set privacy options | User | P1 | ⏳ |
| MELO-US-0807 | User can manage devices | User | P1 | ⏳ |
| MELO-US-0808 | User can export data | User | P2 | ⏳ |
| MELO-US-0809 | User can delete account | User | P2 | ⏳ |
| MELO-US-0810 | User can set language | User | P2 | ⏳ |
| MELO-US-0811 | User can configure accessibility | User | P2 | ⏳ |

---

## Dependencies

- MELO-E001 (Authentication)

---

## Test Requirements

Screenshot evidence for:
- Profile edit screen
- Avatar upload
- Theme toggle (light/dark)
- Notification settings
- Privacy settings
- Settings navigation

---

## VSDD Compliance (Mandatory)

### Verification Properties (Epic-Level)

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-SET-01 | Profile changes persist across sessions | E2E test | US-0801 |
| VP-SET-02 | Avatar upload produces valid image URL | E2E test | US-0802 |
| VP-SET-03 | Theme toggle applies immediately | E2E test | US-0804 |
| VP-SET-04 | Settings saved to Matrix account data | Integration test | All |
| VP-SET-05 | Account deletion removes all user data | Integration test | US-0809 |

### Purity Boundary Map (Epic-Level)

**Pure Core (Deterministic, no side effects):**
- `settingsReducer()` — Settings state transitions
- `validateProfileData()` — Profile field validation
- `themeCalculator()` — Theme value computation
- `formatDisplayName()` — Display name formatting

**Effectful Shell (Side effects allowed):**
- Matrix account data API
- Avatar upload to media server
- localStorage for local settings
- Theme application to DOM

**Adapters (Thin wrappers):**
- `useSettings()` hook — Settings management
- `useProfile()` hook — Profile data
- `useTheme()` hook — Theme toggling

### Contract Chain (Epic-Level)

```
Spec: MELO-E008 (User Settings)
  ↓
Stories: MELO-US-0801 through MELO-US-0811
  ↓
Properties: VP-SET-01 through VP-SET-05
  ↓
Beads: bd-set-* (per story)
  ↓
Tests: tests/settings/*.test.ts, tests/e2e/settings.spec.ts
  ↓
Code: lib/settings/*, hooks/useSettings.ts
```
