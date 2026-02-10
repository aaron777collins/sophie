# HAOS Project

**Status:** Active - Full Feature Parity Mode  
**Started:** 2026-02-09  
**Target:** Complete Discord Clone on Matrix  
**Estimated Timeline:** 6-18 months

## Goal

Transform Element-web (Matrix client) into a pixel-perfect Discord clone with:
- Full Discord-style UI/UX
- LiveKit voice integration for persistent voice channels
- Custom role system with 50+ permissions
- Stage channels, screen sharing, video
- Server discovery, AutoMod, premium features

## Master Plan

**847 tasks across 8 phases** (see `docs/IMPLEMENTATION-MASTER.md`):

| Phase | Name | Tasks | Status |
|-------|------|-------|--------|
| 1 | Foundation & Core UI | 68 | 70% ✅ |
| 2 | Messaging & Channels | 160 | 60% ✅ |
| 3 | Servers & Roles | 138 | 20% 🟡 |
| 4 | Voice & Video | 105 | 10% (CSS done) |
| 5 | User System & Social | 138 | 10% (CSS done) |
| 6 | Moderation & AutoMod | 85 | 0% |
| 7 | Search & Discovery | 68 | 5% |
| 8 | Polish & Premium | 85 | 0% |

## Current State

### [2026-02-10 00:15 EST] Full Parity Mode Activated
- Aaron committed to full Discord feature parity
- Set up 7 parallel proactive tasks for continuous work
- Created MASTER-TODO.md for detailed task tracking
- Build is passing (`yarn build` successful)

### [2026-02-09] Phase 2/3 CSS+TSX Complete
- 26 CSS component files created (~550KB total)
- 9 new Haos TSX components
- Multiple Element components modified
- Sub-agents completed all CSS and core TSX work

## Completed Work

### CSS Design System ✅
- Design tokens, typography, spacing, animations, layout
- 26 component CSS files (buttons, messages, channels, voice, etc.)

### React Components ✅
- HaosChannelSidebar, HaosChannelItem, HaosChannelCategory
- HaosServerHeader, HaosUserPanel, HaosVoicePanel
- Modified: LoggedInView, SpacePanel, LeftPanel, MessagePanel, EventTile, MemberList, etc.

## Active Proactive Tasks

1. **haos-phase1-themes** - Light/AMOLED themes, switcher
2. **haos-phase2-autocomplete** - @mention, #channel, :emoji: completion
3. **haos-phase2-embeds** - URL previews, platform embeds
4. **haos-phase2-threads** - Full thread functionality
5. **haos-phase3-server-wizard** - Server creation with templates
6. **haos-phase3-roles** - Role system (CRITICAL, Opus)
7. **haos-phase4-voice-infra** - LiveKit integration (Opus)

## Key Files

- **Repo:** `/home/ubuntu/repos/haos`
- **Web App:** `/home/ubuntu/repos/haos/apps/web`
- **Master Plan:** `docs/IMPLEMENTATION-MASTER.md`
- **Progress:** `PROGRESS.md`
- **Master TODO:** `MASTER-TODO.md`
- **CSS:** `apps/web/res/css/haos/`
- **Components:** `apps/web/src/components/haos/`

## Commands

```bash
# Build
cd /home/ubuntu/repos/haos/apps/web && yarn build

# Dev server
cd /home/ubuntu/repos/haos/apps/web && yarn start

# Git
cd /home/ubuntu/repos/haos && git status
cd /home/ubuntu/repos/haos && git add -A && git commit -m "msg" && git push
```

## Blocking Issues

1. **LiveKit Server** - Need instance for voice testing
2. **Custom State Events** - io.haos.* events need definition
3. **Role System Complexity** - Needs careful Matrix power level mapping

## Notes

This is a marathon, not a sprint. Sub-agents work continuously via proactive scheduler. Each phase builds on previous phases. Voice (Phase 4) is a major milestone - once that works, it's a usable product.

---

*Updated: 2026-02-10 00:15 EST*
