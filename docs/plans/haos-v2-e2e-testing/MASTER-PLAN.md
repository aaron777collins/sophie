# Master Plan: HAOS V2 End-to-End Testing Suite

**Created:** 2026-02-27
**Author:** Sophie (L0)
**Version:** 1
**Status:** approved (direct request from Aaron)

## Executive Summary

Create a comprehensive Playwright end-to-end testing suite for HAOS V2 that covers every feature and UI interaction. The suite will run on Dev2 server (https://dev2.aaroncollins.info) and validate the complete user journey from authentication through all core features.

## Goals

1. **Complete E2E coverage** — Every user-facing feature has automated tests
2. **Regression prevention** — Catch breaking changes before deployment
3. **CI-ready** — Tests can run automatically in deployment pipelines
4. **Self-documenting** — Test names and structure document expected behavior
5. **Fast feedback** — Tests complete in reasonable time (<15 mins)

## Success Criteria

- [ ] All auth flows tested (sign-in, sign-up, Matrix homeserver connection)
- [ ] Server/Space creation and management fully tested
- [ ] Room/Channel operations fully tested (create, join, settings)
- [ ] Chat functionality fully tested (send, receive, reactions, threads, pins)
- [ ] DM functionality tested
- [ ] Media operations tested (file upload, voice/video if possible)
- [ ] Settings tested (user settings, server settings, theme)
- [ ] E2EE/Security features tested where applicable
- [ ] All tests pass on Dev2
- [ ] Test suite integrated into project
- [ ] Documentation for running tests
- [ ] Merged, pushed, and deployed

## Technical Approach

### Framework: Playwright
- Modern, fast, reliable cross-browser testing
- Native TypeScript support (matches project)
- Built-in waiting, auto-retry, trace collection
- Excellent for SPA/React apps like HAOS

### Test Organization
```
tests/
├── e2e/
│   ├── auth/
│   │   ├── sign-in.spec.ts
│   │   ├── sign-up.spec.ts
│   │   └── logout.spec.ts
│   ├── servers/
│   │   ├── create-server.spec.ts
│   │   ├── join-server.spec.ts
│   │   ├── server-settings.spec.ts
│   │   └── invite-members.spec.ts
│   ├── channels/
│   │   ├── create-channel.spec.ts
│   │   ├── channel-navigation.spec.ts
│   │   └── channel-settings.spec.ts
│   ├── chat/
│   │   ├── send-message.spec.ts
│   │   ├── message-reactions.spec.ts
│   │   ├── message-threads.spec.ts
│   │   ├── message-pins.spec.ts
│   │   └── message-editing.spec.ts
│   ├── dms/
│   │   ├── create-dm.spec.ts
│   │   └── dm-messaging.spec.ts
│   ├── media/
│   │   ├── file-upload.spec.ts
│   │   └── voice-video.spec.ts (basic checks)
│   ├── settings/
│   │   ├── user-settings.spec.ts
│   │   ├── theme-toggle.spec.ts
│   │   └── security-settings.spec.ts
│   └── fixtures/
│       ├── test-users.ts
│       ├── page-objects.ts
│       └── helpers.ts
├── playwright.config.ts
└── README.md
```

### Page Object Model
Use POM pattern for maintainability:
- `AuthPage` — Login/signup interactions
- `ServerPage` — Server/space interactions
- `ChannelPage` — Channel/room interactions
- `ChatPage` — Message interactions
- `SettingsPage` — Settings modal interactions

### Test Data Strategy
- Create fresh test user per test run (or cleanup)
- Use unique server/channel names with timestamps
- Cleanup after tests to avoid clutter

## Phases Overview

| Phase | Description | Est. Duration |
|-------|-------------|---------------|
| 1 | Setup & Infrastructure | 2-3 hours |
| 2 | Auth Tests | 2 hours |
| 3 | Server/Channel Tests | 3 hours |
| 4 | Chat Feature Tests | 3 hours |
| 5 | DM & Media Tests | 2 hours |
| 6 | Settings & Security Tests | 2 hours |
| 7 | Integration & Polish | 2 hours |

**Total Estimate:** 16-18 hours

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Matrix server state affects tests | H | Use unique test data, cleanup routines |
| Network flakiness | M | Proper waits, retries, timeout configuration |
| E2EE tests complex | M | Focus on UI state, not crypto internals |
| Voice/video hard to test | M | Test UI controls, skip actual media validation |
| Test user credentials | L | Use dedicated test accounts |

## Timeline

- **Phase 1-2:** Day 1 (Setup + Auth)
- **Phase 3-4:** Day 1-2 (Core features)
- **Phase 5-6:** Day 2 (Additional features)
- **Phase 7:** Day 2 (Polish & deploy)

## Test Coverage Matrix

### Authentication (auth/)
| Feature | Test File | Priority |
|---------|-----------|----------|
| Sign in with Matrix | sign-in.spec.ts | 🔴 Critical |
| Sign up new user | sign-up.spec.ts | 🔴 Critical |
| Logout | logout.spec.ts | 🔴 Critical |
| Invalid credentials | sign-in.spec.ts | 🟡 High |
| Custom homeserver | sign-in.spec.ts | 🟡 High |

### Servers (servers/)
| Feature | Test File | Priority |
|---------|-----------|----------|
| Create server | create-server.spec.ts | 🔴 Critical |
| Join existing server | join-server.spec.ts | 🔴 Critical |
| Server settings | server-settings.spec.ts | 🟡 High |
| Invite members | invite-members.spec.ts | 🟡 High |
| Leave server | server-settings.spec.ts | 🟡 High |
| Delete server | server-settings.spec.ts | 🟢 Medium |

### Channels (channels/)
| Feature | Test File | Priority |
|---------|-----------|----------|
| Create text channel | create-channel.spec.ts | 🔴 Critical |
| Create voice channel | create-channel.spec.ts | 🔴 Critical |
| Navigate channels | channel-navigation.spec.ts | 🔴 Critical |
| Channel settings | channel-settings.spec.ts | 🟡 High |
| Delete channel | channel-settings.spec.ts | 🟢 Medium |

### Chat (chat/)
| Feature | Test File | Priority |
|---------|-----------|----------|
| Send text message | send-message.spec.ts | 🔴 Critical |
| Receive message | send-message.spec.ts | 🔴 Critical |
| Add reaction | message-reactions.spec.ts | 🟡 High |
| Remove reaction | message-reactions.spec.ts | 🟡 High |
| Create thread | message-threads.spec.ts | 🟡 High |
| Reply in thread | message-threads.spec.ts | 🟡 High |
| Pin message | message-pins.spec.ts | 🟢 Medium |
| Unpin message | message-pins.spec.ts | 🟢 Medium |
| Edit message | message-editing.spec.ts | 🟢 Medium |
| Delete message | message-editing.spec.ts | 🟢 Medium |

### Direct Messages (dms/)
| Feature | Test File | Priority |
|---------|-----------|----------|
| Start DM | create-dm.spec.ts | 🔴 Critical |
| Send DM | dm-messaging.spec.ts | 🔴 Critical |
| DM navigation | create-dm.spec.ts | 🟡 High |

### Media (media/)
| Feature | Test File | Priority |
|---------|-----------|----------|
| Upload image | file-upload.spec.ts | 🟡 High |
| Upload file | file-upload.spec.ts | 🟡 High |
| Voice channel UI | voice-video.spec.ts | 🟡 High |
| Video call UI | voice-video.spec.ts | 🟢 Medium |

### Settings (settings/)
| Feature | Test File | Priority |
|---------|-----------|----------|
| User profile settings | user-settings.spec.ts | 🟡 High |
| Theme toggle | theme-toggle.spec.ts | 🟡 High |
| Security settings | security-settings.spec.ts | 🟢 Medium |

## Dependencies

- Playwright installed and configured
- Dev2 server running and accessible
- Test Matrix accounts created
- Node.js environment

## Deliverables

1. **Test Suite** — Complete Playwright test files
2. **Configuration** — playwright.config.ts with Dev2 settings
3. **Fixtures** — Page objects, helpers, test data
4. **Documentation** — README with setup and run instructions
5. **NPM Scripts** — test:e2e commands in package.json
6. **CI Integration** — GitHub Actions workflow (optional)

## Review History

- v1: 2026-02-27 — Initial plan created by Sophie (direct Aaron request)
