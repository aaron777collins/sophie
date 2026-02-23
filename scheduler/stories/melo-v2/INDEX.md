# Melo V2 - Epic & Story Index

**Last Updated:** 2026-02-22 23:45 EST
**Status:** In Progress - Major Audit

---

## Vision

> "We're trying to make a Matrix client that feels like Discord, a common platform."

See: [VISION.md](VISION.md)

---

## Epics Overview

| Epic ID | Title | Priority | Stories | Status |
|---------|-------|----------|---------|--------|
| MELO-E001 | Authentication | P0 | 10 | ⏳ needs-audit |
| MELO-E002 | Servers/Spaces | P0 | 14 | ⏳ needs-audit |
| MELO-E003 | Channels/Rooms | P0 | 14 | ⏳ needs-audit |
| MELO-E004 | Messaging | P0 | 20 | ⏳ needs-audit |
| MELO-E005 | Direct Messages | P0 | 10 | ⏳ needs-audit |
| MELO-E006 | Voice/Video | P0 | 12 | ⏳ needs-audit |
| MELO-E007 | Moderation | P1 | 12 | ⏳ needs-audit |
| MELO-E008 | User Settings | P1 | 11 | ⏳ needs-audit |
| MELO-E009 | Notifications | P1 | 7 | ⏳ needs-audit |
| MELO-E010 | E2EE/Privacy | P0 | 8 | ⏳ needs-audit |
| MELO-E011 | Mobile/PWA | P1 | 7 | ⏳ needs-audit |
| MELO-E012 | Roles/Permissions | P1 | 9 | ⏳ needs-audit |

**Total Stories:** ~134

---

## Brainstorming Documents

Multi-perspective brainstorming completed:

| Perspective | Document | Stories |
|-------------|----------|---------|
| User | [USER-PERSPECTIVE.md](brainstorm/USER-PERSPECTIVE.md) | ~60 |
| Admin | [ADMIN-PERSPECTIVE.md](brainstorm/ADMIN-PERSPECTIVE.md) | ~50 |
| Moderator | [MODERATOR-PERSPECTIVE.md](brainstorm/MODERATOR-PERSPECTIVE.md) | ~40 |
| Technical | [TECHNICAL-PERSPECTIVE.md](brainstorm/TECHNICAL-PERSPECTIVE.md) | ~50 |

---

## Directory Structure

```
scheduler/stories/melo-v2/
├── INDEX.md (this file)
├── VISION.md
├── FEATURE-AUDIT.md (when complete)
├── brainstorm/
│   ├── USER-PERSPECTIVE.md
│   ├── ADMIN-PERSPECTIVE.md
│   ├── MODERATOR-PERSPECTIVE.md
│   └── TECHNICAL-PERSPECTIVE.md
├── epics/
│   ├── MELO-E001-authentication.md
│   ├── MELO-E002-servers-spaces.md
│   ├── MELO-E003-channels-rooms.md
│   ├── MELO-E004-messaging.md
│   ├── MELO-E005-direct-messages.md
│   ├── MELO-E006-voice-video.md
│   ├── MELO-E007-moderation.md
│   ├── MELO-E008-user-settings.md
│   ├── MELO-E009-notifications.md
│   ├── MELO-E010-e2ee-privacy.md
│   ├── MELO-E011-mobile-pwa.md
│   └── MELO-E012-roles-permissions.md
└── stories/ (to be populated)
```

---

## Next Steps

1. ✅ Create vision document
2. ✅ Multi-perspective brainstorming
3. ✅ Create 12 epics
4. ⏳ Complete feature audit (sub-agent running)
5. ⏳ Create detailed user stories per epic
6. ⏳ Review with fresh-context agents
7. ⏳ Break stories into tasks
8. ⏳ Begin implementation
9. ⏳ Validate with Playwright screenshots

---

## Validation Requirements

All stories must be validated with:
- Desktop (1920x1080) screenshots
- Tablet (768x1024) screenshots
- Mobile (375x667) screenshots

Evidence stored in: `scheduler/validation/screenshots/melo-v2/`
