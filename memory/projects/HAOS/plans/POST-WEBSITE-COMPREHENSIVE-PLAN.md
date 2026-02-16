# HAOS Post-Website Comprehensive Plan

**Created:** 2026-02-16 13:10 EST
**Author:** Sophie (multi-perspective synthesis)
**Status:** DRAFT — Pending Aaron's Review
**Triggered By:** Website completion (Phases 10-12 at 66%)

---

## Executive Summary

This plan covers everything AFTER the HAOS website is **fully tested and validated**. It includes:
- **6 new phases** (Phases 13-18)
- **~60+ granular tasks**
- **8-12 week timeline** (realistic, with buffers)
- **TDD/BDD-first approach** (Aaron's directive)
- **Full risk matrix and contingencies**
- **Multi-platform delivery:** PWA, iOS, Android, macOS, Windows, Linux

### Critical Principle (NON-NEGOTIABLE)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TESTING FIRST — ALWAYS                               │
│                                                                         │
│  "If you can't validate your work, it's the same as not doing it."     │
│                                                                         │
│  Every task MUST have:                                                  │
│  1. Acceptance criteria BEFORE implementation                           │
│  2. Test written BEFORE/DURING code (TDD/BDD)                          │
│  3. Automated validation where possible                                 │
│  4. Playwright for web (can point at live URLs)                        │
│  5. Platform-specific E2E for mobile/desktop                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💜 The Circle Analysis

This plan was developed considering six perspectives:

| Perspective | Focus | Key Concerns Addressed |
|-------------|-------|------------------------|
| 🏛️ Architect | System design, integration | Storage abstraction, platform detection, test architecture |
| 🛡️ Guardian | Risks, security | iOS eviction, code signing, data encryption, rollback |
| 🔧 Pragmatist | Timeline, resources | Realistic estimates, critical path, parallelization |
| 🔍 Skeptic | Blind spots | Code reuse reality, edge cases, missing pieces |
| 🧪 Testing Expert | TDD/BDD | Framework selection, coverage, validation workflows |
| 📋 Project Manager | Task breakdown | Dependencies, go/no-go gates, granular tasks |

---

## Phase Overview

| Phase | Name | Duration | Prerequisites |
|-------|------|----------|---------------|
| **Pre** | Website Validation | 1-2 weeks | Phases 10-12 complete |
| **13** | Test Infrastructure | 1 week | Website validated |
| **14** | Offline Foundation | 2-3 weeks | Phase 13 |
| **15** | PWA Enhancement | 1 week | Phase 14 |
| **16** | Mobile (Capacitor) | 3-4 weeks | Phase 14 |
| **17** | Desktop (Tauri) | 3-4 weeks | Phase 14 |
| **18** | Release & Distribution | 2 weeks | Phases 15-17 |

**Total: 10-14 weeks** (with buffers, realistic)

---

# 🧪 Phase 13: Test Infrastructure (FIRST!)

> **"You can't validate work without test infrastructure. Build it FIRST."**

## Philosophy

Before ANY new feature work, we establish:
1. Complete E2E test suite for existing website
2. Cross-platform test framework
3. CI/CD pipeline with test gates
4. Validation workflows for sub-agents

## Tasks

### TEST-001: Playwright E2E Suite for Website
- **Model:** Sonnet
- **Duration:** 2-3 days
- **Priority:** CRITICAL
- **Description:** Create comprehensive Playwright test suite for all existing website functionality
- **Acceptance Criteria:**
  - [ ] Test file structure: `tests/e2e/web/`
  - [ ] Login flow tests (Matrix auth)
  - [ ] Room/channel creation tests
  - [ ] Message send/receive tests
  - [ ] Settings page tests
  - [ ] All existing Phase 8-12 features covered
  - [ ] Tests pass against live dev URL
  - [ ] Coverage report generated
- **Validation Steps:**
  ```bash
  pnpm test:e2e:web
  # Must pass 100%
  # Coverage report at tests/coverage/
  ```
- **Dependencies:** None (start immediately after website "complete")
- **Blocks:** All subsequent phases

### TEST-002: Unit Test Foundation
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** HIGH
- **Description:** Establish Vitest unit test setup with coverage requirements
- **Acceptance Criteria:**
  - [ ] Vitest configured in `vitest.config.ts`
  - [ ] Test structure: `__tests__/` folders co-located
  - [ ] Mocking patterns documented
  - [ ] Coverage threshold: 70% minimum
  - [ ] Pre-commit hook runs affected tests
- **Validation Steps:**
  ```bash
  pnpm test:unit
  pnpm test:coverage
  # Coverage must be ≥70%
  ```
- **Dependencies:** None
- **Blocks:** All new feature development

### TEST-003: Component Test Setup
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** HIGH
- **Description:** React Testing Library setup for component tests
- **Acceptance Criteria:**
  - [ ] RTL configured with Vitest
  - [ ] Test utilities: custom render with providers
  - [ ] Example tests for 5 key components
  - [ ] Accessibility assertions included
- **Validation Steps:**
  ```bash
  pnpm test:components
  ```
- **Dependencies:** TEST-002
- **Blocks:** Component-level work

### TEST-004: CI/CD Test Pipeline
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** CRITICAL
- **Description:** GitHub Actions pipeline with test gates
- **Acceptance Criteria:**
  - [ ] `.github/workflows/test.yml` created
  - [ ] Runs on every PR
  - [ ] Unit tests → Component tests → E2E tests
  - [ ] PR cannot merge if tests fail
  - [ ] Coverage report posted as PR comment
  - [ ] Matrix for multiple Node versions
- **Validation Steps:**
  - Create test PR, verify pipeline runs
  - Intentionally break test, verify PR blocked
- **Dependencies:** TEST-001, TEST-002, TEST-003
- **Blocks:** All development work

### TEST-005: Sub-Agent Validation Workflow
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** HIGH
- **Description:** Document and implement validation requirements for all sub-agents
- **Acceptance Criteria:**
  - [ ] `docs/VALIDATION-CHECKLIST.md` created
  - [ ] Every task template includes validation section
  - [ ] Sub-agents MUST run `pnpm build && pnpm test` before claiming complete
  - [ ] Specific Playwright commands for live URL validation
- **Validation Steps:**
  - Review document completeness
  - Test with a sample task
- **Dependencies:** TEST-001 through TEST-004
- **Blocks:** All future task execution

---

## Phase 13 Go/No-Go Gate

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GATE: TEST INFRASTRUCTURE COMPLETE                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ E2E Playwright suite covers all website features                     │
│  ☐ Unit test coverage ≥70%                                              │
│  ☐ CI/CD pipeline blocks PRs on test failure                           │
│  ☐ Sub-agent validation workflow documented                             │
│  ☐ All tests passing on main branch                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**DO NOT PROCEED to Phase 14 until this gate passes.**

---

# 🗄️ Phase 14: Offline Foundation

> **Shared infrastructure for all platforms. Build once, use everywhere.**

## Architecture Decision

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Storage Abstraction Layer                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│     ┌─────────────────┐                                                │
│     │  StorageAdapter │ ← Interface                                    │
│     │    (abstract)   │                                                │
│     └────────┬────────┘                                                │
│              │                                                          │
│    ┌─────────┼─────────┐                                               │
│    │         │         │                                               │
│    ▼         ▼         ▼                                               │
│ ┌──────┐ ┌──────┐ ┌──────┐                                            │
│ │IndexDB│ │SQLite│ │SQLite│                                            │
│ │(Web) │ │(Tauri)│ │(Cap) │                                            │
│ └──────┘ └──────┘ └──────┘                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tasks

### OFFLINE-001: Storage Adapter Interface
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** CRITICAL
- **Description:** Define TypeScript interface for storage abstraction
- **Acceptance Criteria:**
  - [ ] `lib/storage/types.ts` with StorageAdapter interface
  - [ ] Methods: init, getMessages, saveMessages, getPendingMessages, deletePendingMessage
  - [ ] Full TypeScript types for Message, PendingMessage, SyncState
  - [ ] Unit tests for interface contract
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/storage
  pnpm tsc --noEmit  # Type check passes
  ```
- **Dependencies:** TEST-002
- **Blocks:** OFFLINE-002, OFFLINE-003, OFFLINE-004

### OFFLINE-002: IndexedDB Adapter (Dexie.js)
- **Model:** Sonnet
- **Duration:** 2-3 days
- **Priority:** CRITICAL
- **Description:** Implement IndexedDB storage for web/PWA
- **Acceptance Criteria:**
  - [ ] `lib/storage/indexeddb-adapter.ts` implements StorageAdapter
  - [ ] Uses Dexie.js for ergonomic IndexedDB access
  - [ ] Schema versioning for migrations
  - [ ] Stores: messages, pendingMessages, syncState, userSettings
  - [ ] 80%+ unit test coverage
  - [ ] Integration test with actual IndexedDB
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/storage/indexeddb
  pnpm test:integration:storage
  ```
  - Manual: Open browser DevTools → Application → IndexedDB → verify data
- **Dependencies:** OFFLINE-001
- **Blocks:** OFFLINE-005, PWA-*

### OFFLINE-003: SQLite Adapter Interface (Native)
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** HIGH
- **Description:** SQLite adapter interface for native platforms
- **Acceptance Criteria:**
  - [ ] `lib/storage/sqlite-adapter.ts` implements StorageAdapter
  - [ ] Abstract implementation (Capacitor/Tauri provide actual SQLite)
  - [ ] Schema SQL files in `lib/storage/sql/`
  - [ ] Migration system documented
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/storage/sqlite
  ```
- **Dependencies:** OFFLINE-001
- **Blocks:** MOBILE-*, DESKTOP-*

### OFFLINE-004: Platform Detection Module
- **Model:** Haiku
- **Duration:** 0.5 days
- **Priority:** HIGH
- **Description:** Detect runtime platform for storage adapter selection
- **Acceptance Criteria:**
  - [ ] `lib/platform.ts` exports: isCapacitor, isTauri, isPWA, isNative
  - [ ] Works in SSR (returns false safely)
  - [ ] Unit tests for all scenarios
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/platform
  ```
- **Dependencies:** None
- **Blocks:** OFFLINE-005

### OFFLINE-005: Storage Factory
- **Model:** Haiku
- **Duration:** 0.5 days
- **Priority:** HIGH
- **Description:** Factory function to create correct storage adapter
- **Acceptance Criteria:**
  - [ ] `lib/storage/index.ts` exports createStorageAdapter()
  - [ ] Auto-selects IndexedDB for web, SQLite for native
  - [ ] Singleton pattern to avoid multiple instances
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/storage/index
  ```
- **Dependencies:** OFFLINE-002, OFFLINE-003, OFFLINE-004
- **Blocks:** OFFLINE-006

### OFFLINE-006: Message Queue for Offline Sends
- **Model:** Sonnet
- **Duration:** 2-3 days
- **Priority:** CRITICAL
- **Description:** Queue messages when offline, sync when online
- **Acceptance Criteria:**
  - [ ] `lib/offline/message-queue.ts` 
  - [ ] Optimistic UI: message appears immediately with "sending" state
  - [ ] Background sync when connection restored
  - [ ] Exponential backoff on failures
  - [ ] Queue persisted to storage adapter
  - [ ] Maximum retry limit with user notification
  - [ ] 90%+ test coverage
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/offline
  ```
  - E2E: Disconnect network, send message, reconnect, verify delivery
- **Dependencies:** OFFLINE-005
- **Blocks:** OFFLINE-007

### OFFLINE-007: Network Status Hook
- **Model:** Haiku
- **Duration:** 0.5 days
- **Priority:** HIGH
- **Description:** React hook for network status
- **Acceptance Criteria:**
  - [ ] `hooks/useNetworkStatus.ts`
  - [ ] Returns: { isOnline, isReconnecting, lastOnline }
  - [ ] Triggers message queue sync on reconnect
  - [ ] Unit tests
- **Validation Steps:**
  ```bash
  pnpm test:unit hooks/useNetworkStatus
  ```
- **Dependencies:** OFFLINE-006
- **Blocks:** OFFLINE-008

### OFFLINE-008: Offline UI Indicators
- **Model:** Haiku
- **Duration:** 1 day
- **Priority:** MEDIUM
- **Description:** UI components for offline state
- **Acceptance Criteria:**
  - [ ] `components/OfflineBanner.tsx` - shows when offline
  - [ ] `components/PendingMessageIndicator.tsx` - shows on queued messages
  - [ ] `components/SyncProgress.tsx` - shows sync status
  - [ ] Component tests
- **Validation Steps:**
  ```bash
  pnpm test:components
  ```
  - Visual test: disconnect network, verify banner appears
- **Dependencies:** OFFLINE-007
- **Blocks:** PWA-*, MOBILE-*, DESKTOP-*

### OFFLINE-009: Service Worker Enhancement
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** Enhance service worker for offline-first
- **Acceptance Criteria:**
  - [ ] `public/sw.js` updated (or Workbox config)
  - [ ] App shell cached for instant load
  - [ ] Static assets cached
  - [ ] API responses: stale-while-revalidate where appropriate
  - [ ] Offline fallback page
  - [ ] Background sync for pending messages
- **Validation Steps:**
  ```bash
  pnpm test:e2e:offline
  ```
  - Manual: Chrome DevTools → Application → Service Workers → test offline
- **Dependencies:** OFFLINE-006
- **Blocks:** PWA-*

### OFFLINE-010: Matrix SDK Offline Configuration
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** HIGH
- **Description:** Configure Matrix SDK for offline-first
- **Acceptance Criteria:**
  - [ ] IndexedDBStore configured for sync token persistence
  - [ ] Lazy loading enabled
  - [ ] Initial sync limit set
  - [ ] Reconnection handling improved
  - [ ] Integration test with Matrix SDK
- **Validation Steps:**
  ```bash
  pnpm test:integration:matrix
  ```
  - Manual: Load app, go offline, reload, verify cached data shows
- **Dependencies:** OFFLINE-002
- **Blocks:** All platform tasks

### OFFLINE-011: Integration Tests for Offline Features
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** CRITICAL
- **Description:** E2E tests for offline scenarios
- **Acceptance Criteria:**
  - [ ] `tests/e2e/offline/` directory
  - [ ] Test: View messages while offline
  - [ ] Test: Send message while offline → queued
  - [ ] Test: Reconnect → message sent
  - [ ] Test: Multiple messages queued → all sent in order
  - [ ] Test: Failure handling and retry
  - [ ] Playwright network conditioning used
- **Validation Steps:**
  ```bash
  pnpm test:e2e:offline
  ```
- **Dependencies:** OFFLINE-006 through OFFLINE-010
- **Blocks:** Phase 15, 16, 17

---

## Phase 14 Go/No-Go Gate

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GATE: OFFLINE FOUNDATION COMPLETE                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ Storage abstraction layer implemented and tested                     │
│  ☐ IndexedDB adapter working with 80%+ coverage                         │
│  ☐ Message queue working: offline send → online delivery               │
│  ☐ Network status UI indicators showing correctly                       │
│  ☐ Service worker caching app shell and static assets                   │
│  ☐ Matrix SDK offline config verified                                   │
│  ☐ All E2E offline tests passing                                        │
│  ☐ Manual validation: full offline scenario works                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 🌐 Phase 15: PWA Enhancement

> **Quick wins for web users. Minimal effort, high impact.**

## Tasks

### PWA-001: Web App Manifest Audit
- **Model:** Haiku
- **Duration:** 0.5 days
- **Priority:** HIGH
- **Description:** Verify and enhance manifest.json
- **Acceptance Criteria:**
  - [ ] `public/manifest.json` complete
  - [ ] All icon sizes (192, 512, maskable)
  - [ ] Correct start_url and scope
  - [ ] display: standalone
  - [ ] theme_color and background_color
  - [ ] screenshots for install prompt
- **Validation Steps:**
  - Chrome DevTools → Application → Manifest → no errors
  - Lighthouse PWA audit passes
- **Dependencies:** Phase 14
- **Blocks:** PWA-002

### PWA-002: Install Prompt Component
- **Model:** Haiku
- **Duration:** 1 day
- **Priority:** MEDIUM
- **Description:** Custom install prompt for better UX
- **Acceptance Criteria:**
  - [ ] `components/InstallPrompt.tsx`
  - [ ] Captures beforeinstallprompt event
  - [ ] Shows at appropriate time (not immediately)
  - [ ] Tracks install analytics
  - [ ] Dismissable, remembers dismissal
  - [ ] Component tests
- **Validation Steps:**
  ```bash
  pnpm test:components InstallPrompt
  ```
  - Manual: Test on mobile Chrome, verify prompt appears
- **Dependencies:** PWA-001
- **Blocks:** None

### PWA-003: Offline Page
- **Model:** Haiku
- **Duration:** 0.5 days
- **Priority:** MEDIUM
- **Description:** Dedicated offline fallback page
- **Acceptance Criteria:**
  - [ ] `pages/offline.tsx` (or app/offline/page.tsx)
  - [ ] Cached by service worker
  - [ ] Shows when navigating offline to uncached page
  - [ ] Provides useful info and retry option
- **Validation Steps:**
  - Manual: Go offline, navigate to new page, verify offline page shows
- **Dependencies:** OFFLINE-009
- **Blocks:** None

### PWA-004: Lighthouse Audit Fixes
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** HIGH
- **Description:** Achieve 90+ Lighthouse PWA score
- **Acceptance Criteria:**
  - [ ] Lighthouse PWA score ≥90
  - [ ] Performance score ≥80
  - [ ] Accessibility score ≥90
  - [ ] All PWA audit items pass
  - [ ] Document any intentional exceptions
- **Validation Steps:**
  ```bash
  pnpm lighthouse --view
  # Or via Chrome DevTools
  ```
- **Dependencies:** PWA-001, PWA-003
- **Blocks:** None

### PWA-005: PWA E2E Tests
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** HIGH
- **Description:** Playwright tests for PWA functionality
- **Acceptance Criteria:**
  - [ ] `tests/e2e/pwa/` directory
  - [ ] Test: Service worker registers
  - [ ] Test: App works offline after initial load
  - [ ] Test: Install prompt appears (where detectable)
  - [ ] Test: Lighthouse CI in pipeline
- **Validation Steps:**
  ```bash
  pnpm test:e2e:pwa
  ```
- **Dependencies:** PWA-001 through PWA-004
- **Blocks:** Phase 15 gate

---

## Phase 15 Go/No-Go Gate

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GATE: PWA ENHANCEMENT COMPLETE                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ Manifest valid with all required fields                              │
│  ☐ Install prompt working on supported browsers                         │
│  ☐ Offline fallback page shows correctly                                │
│  ☐ Lighthouse PWA score ≥90                                             │
│  ☐ All PWA E2E tests passing                                            │
│  ☐ Manual validation on iOS Safari, Chrome, Firefox                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 📱 Phase 16: Mobile (Capacitor)

> **iOS and Android apps with 95% code reuse.**

## 🛡️ Guardian's Risk Analysis for Mobile

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| iOS IndexedDB eviction | HIGH | Likely | Use SQLite via Capacitor plugin |
| iOS background WebSocket kill | HIGH | Very Likely | Push notifications + reconnect on foreground |
| App Store rejection | MEDIUM | Possible | Follow guidelines, privacy manifest |
| Android fragmentation | MEDIUM | Likely | Test on multiple API levels |
| Push notification setup complexity | HIGH | Likely | Use Firebase + APNs, document thoroughly |

## Tasks

### MOBILE-001: Capacitor Project Setup
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** CRITICAL
- **Description:** Initialize Capacitor in HAOS project
- **Acceptance Criteria:**
  - [ ] `npm install @capacitor/core @capacitor/cli`
  - [ ] `capacitor.config.ts` configured
  - [ ] iOS platform added: `npx cap add ios`
  - [ ] Android platform added: `npx cap add android`
  - [ ] `.gitignore` updated for native folders
- **Validation Steps:**
  ```bash
  npx cap sync
  npx cap open ios  # Opens Xcode
  npx cap open android  # Opens Android Studio
  ```
- **Dependencies:** Phase 14 complete
- **Blocks:** All MOBILE-* tasks

### MOBILE-002: Next.js Static Export Config
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** CRITICAL
- **Description:** Configure Next.js for static export (required for Capacitor)
- **Acceptance Criteria:**
  - [ ] `next.config.js` has `output: 'export'`
  - [ ] Image optimization disabled: `images: { unoptimized: true }`
  - [ ] All dynamic routes have generateStaticParams
  - [ ] API routes converted to external calls or removed
  - [ ] Build succeeds with static export
  - [ ] Existing E2E tests still pass
- **Validation Steps:**
  ```bash
  pnpm build
  ls out/  # Verify static files generated
  pnpm test:e2e  # Existing tests pass
  ```
- **Dependencies:** MOBILE-001
- **Blocks:** MOBILE-003

### MOBILE-003: SQLite Plugin Integration
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** Integrate Capacitor SQLite for native storage
- **Acceptance Criteria:**
  - [ ] `@capacitor-community/sqlite` installed
  - [ ] `lib/storage/capacitor-sqlite-adapter.ts` implements StorageAdapter
  - [ ] Schema matches IndexedDB adapter
  - [ ] Migrations work correctly
  - [ ] Unit tests pass
  - [ ] Integration test on device/simulator
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/storage/capacitor-sqlite
  ```
  - Device test: verify data persists across app restarts
- **Dependencies:** OFFLINE-003, MOBILE-001
- **Blocks:** MOBILE-008

### MOBILE-004: Push Notifications - iOS (APNs)
- **Model:** Sonnet
- **Duration:** 2-3 days
- **Priority:** CRITICAL
- **Description:** iOS push notification setup
- **Acceptance Criteria:**
  - [ ] `@capacitor/push-notifications` installed
  - [ ] Apple Developer account configured
  - [ ] APNs key generated and stored securely
  - [ ] Push capability added to Xcode project
  - [ ] Token registration working
  - [ ] Matrix push gateway integration
  - [ ] Local notification fallback
- **Validation Steps:**
  - Physical device test (simulator doesn't support push)
  - Verify push received when app backgrounded
  - Verify notification opens correct room
- **Dependencies:** MOBILE-001, Apple Developer Account
- **Blocks:** MOBILE-006

### MOBILE-005: Push Notifications - Android (FCM)
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** CRITICAL
- **Description:** Android push notification setup
- **Acceptance Criteria:**
  - [ ] Firebase project created
  - [ ] `google-services.json` added
  - [ ] FCM token registration working
  - [ ] Matrix push gateway integration
  - [ ] Notification channels configured
- **Validation Steps:**
  - Device test: verify push received
  - Test notification tap opens correct room
- **Dependencies:** MOBILE-001, Firebase Account
- **Blocks:** MOBILE-006

### MOBILE-006: Push Notification Service Integration
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** Unified push service connecting to Matrix
- **Acceptance Criteria:**
  - [ ] `lib/push/push-service.ts`
  - [ ] Registers with Matrix push gateway (sygnal or similar)
  - [ ] Handles both APNs and FCM
  - [ ] Background message handling
  - [ ] Badge count updates
  - [ ] Unit tests
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/push
  ```
  - E2E: Send message from web, verify push on mobile
- **Dependencies:** MOBILE-004, MOBILE-005
- **Blocks:** MOBILE-012

### MOBILE-007: Native UI Polish
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** MEDIUM
- **Description:** Mobile-specific UI improvements
- **Acceptance Criteria:**
  - [ ] Safe area insets handled (notch, home indicator)
  - [ ] Keyboard handling (push content up)
  - [ ] Status bar styling
  - [ ] Haptic feedback on key actions
  - [ ] Pull-to-refresh
  - [ ] Component tests for mobile-specific components
- **Validation Steps:**
  - Visual test on iPhone X+ (notch) and Android
  - Test with keyboard open
- **Dependencies:** MOBILE-001
- **Blocks:** None

### MOBILE-008: Background Sync Handling
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** Handle iOS/Android background limitations
- **Acceptance Criteria:**
  - [ ] Detect app going to background
  - [ ] Graceful WebSocket disconnect
  - [ ] Reconnect on foreground
  - [ ] Sync pending messages
  - [ ] Handle "app killed while offline" scenario
- **Validation Steps:**
  - Test: background app, send message from elsewhere, foreground, verify message appears
  - Test: kill app, reopen, verify sync completes
- **Dependencies:** MOBILE-003, OFFLINE-006
- **Blocks:** MOBILE-012

### MOBILE-009: iOS App Store Preparation
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** Prepare iOS app for App Store submission
- **Acceptance Criteria:**
  - [ ] App icons all sizes
  - [ ] Launch screen / splash screen
  - [ ] Privacy manifest (iOS 17+)
  - [ ] App Transport Security configured
  - [ ] Screenshots (6.5", 5.5", iPad)
  - [ ] App Store description and metadata
  - [ ] Privacy policy URL
  - [ ] TestFlight build working
- **Validation Steps:**
  - TestFlight: install and verify everything works
  - App Store Connect: no validation errors
- **Dependencies:** MOBILE-001 through MOBILE-008
- **Blocks:** MOBILE-011

### MOBILE-010: Android Play Store Preparation
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** HIGH
- **Description:** Prepare Android app for Play Store
- **Acceptance Criteria:**
  - [ ] App icons and adaptive icons
  - [ ] Splash screen
  - [ ] Signing keystore created and backed up
  - [ ] ProGuard/R8 rules
  - [ ] Screenshots for various device sizes
  - [ ] Play Store listing metadata
  - [ ] Internal testing track build
- **Validation Steps:**
  - Install from internal testing track
  - Play Console: no errors
- **Dependencies:** MOBILE-001 through MOBILE-008
- **Blocks:** MOBILE-011

### MOBILE-011: App Store Submissions
- **Model:** Sonnet
- **Duration:** 3-5 days (waiting for review)
- **Priority:** HIGH
- **Description:** Submit to both app stores
- **Acceptance Criteria:**
  - [ ] iOS submitted to App Store
  - [ ] Android submitted to Play Store
  - [ ] Review responses handled
  - [ ] Apps approved and live
- **Validation Steps:**
  - Download from store, full regression test
- **Dependencies:** MOBILE-009, MOBILE-010
- **Blocks:** Phase 16 gate

### MOBILE-012: Mobile E2E Tests
- **Model:** Sonnet
- **Duration:** 3 days
- **Priority:** CRITICAL
- **Description:** E2E test suite for mobile apps
- **Acceptance Criteria:**
  - [ ] Maestro test files in `tests/e2e/mobile/`
  - [ ] Test: Login flow
  - [ ] Test: Send message
  - [ ] Test: Receive message (push)
  - [ ] Test: Offline → Online sync
  - [ ] Test: Background → Foreground
  - [ ] CI: Tests run on every PR (simulator)
- **Validation Steps:**
  ```bash
  maestro test tests/e2e/mobile/
  ```
- **Dependencies:** MOBILE-001 through MOBILE-008
- **Blocks:** MOBILE-011

---

## Phase 16 Go/No-Go Gate

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GATE: MOBILE COMPLETE                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ Capacitor project building for iOS and Android                       │
│  ☐ SQLite storage working on both platforms                             │
│  ☐ Push notifications working (APNs + FCM)                              │
│  ☐ Background/foreground sync working                                   │
│  ☐ All Maestro E2E tests passing                                        │
│  ☐ TestFlight build verified                                            │
│  ☐ Play Store internal testing verified                                 │
│  ☐ Apps submitted and approved                                          │
│  ☐ Manual regression test on physical devices                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 🖥️ Phase 17: Desktop (Tauri)

> **Native desktop apps for macOS, Windows, Linux.**

## 🛡️ Guardian's Risk Analysis for Desktop

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Rust learning curve | MEDIUM | Likely | Use minimal Rust, mostly JS bridge |
| macOS code signing/notarization | HIGH | Very Likely | Document process, automate in CI |
| Windows code signing cost | MEDIUM | Certain | Budget for EV certificate (~$300/year) |
| Auto-updater security | HIGH | Possible | Use Tauri's built-in secure updater |
| Static export limitations | MEDIUM | Possible | Already handled in MOBILE-002 |

## Tasks

### DESKTOP-001: Tauri Project Setup
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** CRITICAL
- **Description:** Initialize Tauri in HAOS project
- **Acceptance Criteria:**
  - [ ] Rust toolchain installed (via rustup)
  - [ ] Tauri CLI installed
  - [ ] `tauri.conf.json` configured
  - [ ] `src-tauri/` directory created
  - [ ] Dev mode working: `npm run tauri dev`
  - [ ] Build working: `npm run tauri build`
- **Validation Steps:**
  ```bash
  npm run tauri dev
  # App window opens, web app loads
  npm run tauri build
  # Binary created in target/release
  ```
- **Dependencies:** MOBILE-002 (static export), Phase 14
- **Blocks:** All DESKTOP-* tasks

### DESKTOP-002: Tauri SQLite Integration
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** SQLite storage for desktop via Tauri
- **Acceptance Criteria:**
  - [ ] tauri-plugin-sql installed
  - [ ] `lib/storage/tauri-sqlite-adapter.ts` implements StorageAdapter
  - [ ] IPC bridge for SQLite operations
  - [ ] Schema matches other adapters
  - [ ] Unit tests pass
- **Validation Steps:**
  ```bash
  pnpm test:unit lib/storage/tauri-sqlite
  npm run tauri dev
  # Verify data persists
  ```
- **Dependencies:** OFFLINE-003, DESKTOP-001
- **Blocks:** DESKTOP-007

### DESKTOP-003: System Tray Integration
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** MEDIUM
- **Description:** System tray with unread count and quick actions
- **Acceptance Criteria:**
  - [ ] Tray icon shows in system tray
  - [ ] Unread count badge
  - [ ] Right-click menu: Open, Quit
  - [ ] Minimize to tray option
  - [ ] Works on macOS, Windows, Linux
- **Validation Steps:**
  - Manual: test on all three platforms
- **Dependencies:** DESKTOP-001
- **Blocks:** None

### DESKTOP-004: Native Notifications
- **Model:** Sonnet
- **Duration:** 1 day
- **Priority:** HIGH
- **Description:** Desktop notifications via Tauri
- **Acceptance Criteria:**
  - [ ] tauri-plugin-notification configured
  - [ ] `lib/native/notifications.ts` abstraction
  - [ ] Click notification opens app/room
  - [ ] Notification grouping
  - [ ] Works on all platforms
- **Validation Steps:**
  - Manual: receive notification on all platforms
- **Dependencies:** DESKTOP-001
- **Blocks:** None

### DESKTOP-005: Auto-Updater
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** Automatic updates via Tauri updater
- **Acceptance Criteria:**
  - [ ] tauri-plugin-updater configured
  - [ ] Update server endpoint configured
  - [ ] Signature verification enabled
  - [ ] User notification of available updates
  - [ ] Background download with progress
  - [ ] Restart to apply
- **Validation Steps:**
  - Test: release new version, verify app updates
- **Dependencies:** DESKTOP-001
- **Blocks:** DESKTOP-009

### DESKTOP-006: macOS Code Signing
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** CRITICAL (for macOS)
- **Description:** Code signing and notarization for macOS
- **Acceptance Criteria:**
  - [ ] Apple Developer ID certificate obtained
  - [ ] Code signing working locally
  - [ ] Notarization working
  - [ ] DMG installer signed and notarized
  - [ ] CI/CD integrated
- **Validation Steps:**
  ```bash
  spctl -a -v target/release/bundle/macos/HAOS.app
  # Output: accepted
  ```
- **Dependencies:** DESKTOP-001, Apple Developer Account
- **Blocks:** DESKTOP-009

### DESKTOP-007: Windows Code Signing
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** HIGH (for Windows)
- **Description:** Code signing for Windows
- **Acceptance Criteria:**
  - [ ] Code signing certificate obtained (EV recommended)
  - [ ] Signing working in CI
  - [ ] MSI/NSIS installer signed
  - [ ] No SmartScreen warning
- **Validation Steps:**
  - Install on fresh Windows, no warnings
- **Dependencies:** DESKTOP-001, Code Signing Certificate
- **Blocks:** DESKTOP-009

### DESKTOP-008: Linux Packaging
- **Model:** Haiku
- **Duration:** 1 day
- **Priority:** MEDIUM
- **Description:** Linux distribution packages
- **Acceptance Criteria:**
  - [ ] AppImage builds working
  - [ ] .deb package builds working
  - [ ] .rpm package builds working (optional)
  - [ ] Desktop file and icons included
- **Validation Steps:**
  - Install on Ubuntu, Fedora, test functionality
- **Dependencies:** DESKTOP-001
- **Blocks:** DESKTOP-009

### DESKTOP-009: Desktop CI/CD Pipeline
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** CRITICAL
- **Description:** Multi-platform build pipeline
- **Acceptance Criteria:**
  - [ ] GitHub Actions workflow
  - [ ] Matrix build: macOS, Windows, Linux
  - [ ] Code signing in CI
  - [ ] Release artifacts uploaded
  - [ ] Auto-updater JSON generated
- **Validation Steps:**
  - Trigger release, verify all platforms build
- **Dependencies:** DESKTOP-005 through DESKTOP-008
- **Blocks:** Phase 17 gate

### DESKTOP-010: Desktop E2E Tests
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** E2E tests for desktop app
- **Acceptance Criteria:**
  - [ ] WebDriver or Tauri test driver configured
  - [ ] Test: Login flow
  - [ ] Test: Send/receive message
  - [ ] Test: System tray functions
  - [ ] Test: Auto-update flow (mock)
  - [ ] CI integration
- **Validation Steps:**
  ```bash
  pnpm test:e2e:desktop
  ```
- **Dependencies:** DESKTOP-001 through DESKTOP-005
- **Blocks:** DESKTOP-009

---

## Phase 17 Go/No-Go Gate

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GATE: DESKTOP COMPLETE                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ Tauri builds for macOS, Windows, Linux                               │
│  ☐ SQLite storage working                                               │
│  ☐ System tray with unread count                                        │
│  ☐ Native notifications working                                         │
│  ☐ Auto-updater working                                                 │
│  ☐ macOS signed and notarized                                           │
│  ☐ Windows signed (no SmartScreen)                                      │
│  ☐ Linux packages working                                               │
│  ☐ All E2E tests passing                                                │
│  ☐ CI/CD releasing all platforms                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 🚀 Phase 18: Release & Distribution

> **Ship it. Get it in users' hands.**

## Tasks

### RELEASE-001: Release Documentation
- **Model:** Haiku
- **Duration:** 1 day
- **Priority:** HIGH
- **Description:** User-facing documentation
- **Acceptance Criteria:**
  - [ ] Installation guide per platform
  - [ ] FAQ document
  - [ ] Troubleshooting guide
  - [ ] Changelog
  - [ ] Privacy policy
  - [ ] Terms of service
- **Validation Steps:**
  - Review for completeness
- **Dependencies:** Phases 15-17
- **Blocks:** RELEASE-003

### RELEASE-002: Landing Page Updates
- **Model:** Haiku
- **Duration:** 1 day
- **Priority:** MEDIUM
- **Description:** Update HAOS website with download links
- **Acceptance Criteria:**
  - [ ] Download buttons for all platforms
  - [ ] Platform auto-detection
  - [ ] App store badges
  - [ ] Feature comparison
- **Validation Steps:**
  - Visual test, all links work
- **Dependencies:** Phases 15-17
- **Blocks:** RELEASE-003

### RELEASE-003: Beta Program
- **Model:** Sonnet
- **Duration:** 1 week
- **Priority:** HIGH
- **Description:** Limited beta before general release
- **Acceptance Criteria:**
  - [ ] Beta channel configured (TestFlight, Play internal, GitHub pre-release)
  - [ ] Beta testers recruited (10-50 users)
  - [ ] Feedback collection system
  - [ ] Crash reporting (Sentry or similar)
  - [ ] Analytics (privacy-respecting)
  - [ ] 1 week soak time minimum
- **Validation Steps:**
  - Monitor crash-free rate (target: 99%+)
  - Review feedback themes
- **Dependencies:** RELEASE-001
- **Blocks:** RELEASE-004

### RELEASE-004: General Availability
- **Model:** Sonnet
- **Duration:** 1-2 days
- **Priority:** HIGH
- **Description:** Public release
- **Acceptance Criteria:**
  - [ ] iOS App Store live
  - [ ] Google Play Store live
  - [ ] Desktop downloads available (website, GitHub)
  - [ ] PWA fully deployed
  - [ ] Announcement prepared
- **Validation Steps:**
  - Download from each source, verify functionality
- **Dependencies:** RELEASE-003, beta success
- **Blocks:** None

### RELEASE-005: Monitoring & Alerting
- **Model:** Sonnet
- **Duration:** 2 days
- **Priority:** HIGH
- **Description:** Production monitoring setup
- **Acceptance Criteria:**
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring
  - [ ] Uptime monitoring
  - [ ] Alert thresholds configured
  - [ ] On-call runbook
- **Validation Steps:**
  - Trigger test alert, verify delivery
- **Dependencies:** Phase 15-17
- **Blocks:** RELEASE-004

---

## Phase 18 Go/No-Go Gate (FINAL)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GATE: MULTI-PLATFORM RELEASE COMPLETE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ☐ PWA live with Lighthouse score ≥90                                   │
│  ☐ iOS app live in App Store                                            │
│  ☐ Android app live in Play Store                                       │
│  ☐ Desktop apps downloadable (macOS, Windows, Linux)                    │
│  ☐ Auto-updater verified working                                        │
│  ☐ Documentation complete                                               │
│  ☐ Monitoring and alerting active                                       │
│  ☐ Crash-free rate ≥99% in beta                                         │
│  ☐ All critical user journeys tested on all platforms                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 🔍 Risk Matrix (Guardian's Analysis)

## Critical Risks

| Risk | Platform | Severity | Likelihood | Mitigation | Contingency |
|------|----------|----------|------------|------------|-------------|
| iOS IndexedDB eviction | Mobile | CRITICAL | Likely | SQLite via Capacitor | N/A - SQLite required |
| iOS WebSocket background | Mobile | HIGH | Very Likely | Push + foreground reconnect | Accept limitation, document |
| App Store rejection | Mobile | MEDIUM | Possible | Follow guidelines, privacy manifest | Fix and resubmit |
| macOS notarization fails | Desktop | HIGH | Possible | Test thoroughly before release | Emergency direct download |
| Windows SmartScreen | Desktop | HIGH | Likely | EV certificate | Accept warning initially |
| Tauri breaking change | Desktop | MEDIUM | Unlikely | Pin version, test before upgrade | Delay upgrade, patch if critical |
| Capacitor plugin breaks | Mobile | MEDIUM | Possible | Pin versions, have fallbacks | Fork plugin if needed |

## High Risks

| Risk | Platform | Mitigation |
|------|----------|------------|
| Matrix SDK offline quirks | All | Extensive testing, fallback behaviors |
| Push gateway complexity | Mobile | Document thoroughly, use proven sygnal |
| Multi-device sync conflicts | All | Conflict resolution strategy, last-write-wins |
| Large initial sync | All | Lazy loading, sync filters, progress UI |
| Update while offline | All | Queue updates, apply on reconnect |

---

# 🔍 Skeptic's Challenges (Addressed)

## Challenged Assumptions

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "95% code reuse" | UI will need mobile-specific work | Budget for MOBILE-007 (Native UI Polish) |
| "1-2 weeks for mobile" | Push notifications alone are 3-5 days | Extended to 3-4 weeks |
| "Capacitor wraps existing app" | SSR/API routes don't work | MOBILE-002 handles static export |
| "Tauri is straightforward" | Rust can be tricky | Minimal Rust, mostly IPC bridges |

## Added to Plan (Previously Missing)

| Item | Added In |
|------|----------|
| Crash reporting/analytics | RELEASE-003, RELEASE-005 |
| Beta testing program | RELEASE-003 |
| Multi-device conflict resolution | Documented in risks |
| Support burden planning | RELEASE-001 (FAQ, troubleshooting) |
| Version compatibility | Documented in risks |

---

# 📅 Timeline Summary

| Phase | Duration | Dependencies | Can Parallelize |
|-------|----------|--------------|-----------------|
| **13: Test Infrastructure** | 1 week | Website done | No |
| **14: Offline Foundation** | 2-3 weeks | Phase 13 | No |
| **15: PWA Enhancement** | 1 week | Phase 14 | With 16 & 17 |
| **16: Mobile** | 3-4 weeks | Phase 14 | With 15 & 17 |
| **17: Desktop** | 3-4 weeks | Phase 14 | With 15 & 16 |
| **18: Release** | 2 weeks | Phases 15-17 | No |

**Critical Path:** 13 → 14 → (15 || 16 || 17) → 18

**Best Case:** 8-10 weeks
**Realistic:** 10-12 weeks
**Worst Case (issues):** 14-16 weeks

---

# 💰 Resource Requirements

## Accounts & Certificates

| Item | Cost | Required For |
|------|------|--------------|
| Apple Developer Program | $99/year | iOS, macOS |
| Google Play Developer | $25 one-time | Android |
| Windows EV Code Signing | ~$300/year | Windows (no SmartScreen) |
| Domain SSL (already have) | $0 | PWA |

## Infrastructure

| Item | Cost | Notes |
|------|------|-------|
| Firebase (push) | Free tier | Up to 10K monthly |
| Sentry (errors) | Free tier | 5K errors/month |
| GitHub Actions | Free tier | 2000 minutes/month |

## Skills Required

| Skill | For | Notes |
|-------|-----|-------|
| TypeScript | All | Already have |
| React | All | Already have |
| Rust (basic) | Tauri | Minimal, mostly config |
| Xcode | iOS | Build signing |
| Android Studio | Android | Build signing |

---

# 📋 Scheduling This Plan

## Trigger Conditions

This plan activates AFTER:
1. HAOS website Phases 10-12 reach 100%
2. Full E2E test suite passes
3. Manual validation by Aaron confirms "website complete"

## Proactive Jobs Integration

When triggered, update `PROACTIVE-JOBS.md`:

```markdown
## Active Proactive Jobs

> **Last Updated:** [date]
> **Current Focus:** Phase 13 - Test Infrastructure

### TEST-001-playwright-e2e
- **Status:** pending
- **Priority:** CRITICAL
- **Model:** claude-sonnet-4-20250514
- **Description:** Create comprehensive Playwright test suite
[... task details ...]
```

## Cron Integration

Add to Person Manager's oversight:
- Monitor Phase 13 gate completion
- Trigger Phase 14 when Phase 13 passes
- Block subsequent phases on gate validation

---

# ✅ Validation Checklist for Sub-Agents

Every sub-agent completing a task MUST:

```markdown
## Completion Checklist (MANDATORY)

Before claiming complete:

### Build Validation
- [ ] `pnpm build` exits 0
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Test Validation  
- [ ] New unit tests written (if applicable)
- [ ] `pnpm test:unit` passes
- [ ] New E2E tests written (if applicable)
- [ ] `pnpm test:e2e` passes
- [ ] Coverage not decreased

### Functional Validation
- [ ] Feature works as described in acceptance criteria
- [ ] Edge cases tested manually
- [ ] No regressions in existing functionality

### Documentation
- [ ] Code comments where complex
- [ ] README updated if user-facing
- [ ] Changelog entry if applicable

### Git
- [ ] Changes committed with descriptive message
- [ ] PR created (if not direct push)
- [ ] CI pipeline passes
```

---

# 📝 Document Updates Required

To enforce TDD/BDD across the system:

1. **AGENTS.md** — Add testing-first requirements to task templates
2. **VERIFICATION-SYSTEM.md** — Add test validation requirements
3. **scheduler/workers/IDENTITY.md** — Workers must run tests
4. **PROACTIVE-JOBS.md template** — Include test commands

---

*This plan will be scheduled to activate upon website completion. Aaron should review and approve before activation.*
