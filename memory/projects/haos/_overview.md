# HAOS Project Overview

## Current Status: DEPLOYED TO DEV2 (PORT 80) — PHASE 6 IN PROGRESS

**[2026-02-14 01:00 EST]** Full implementation deployed! Sophie discovered TWO separate codebases — the complete Discord-clone version (dev3) was deployed to replace the old basic shell (dev2). Now live at https://dev2.aaroncollins.info on port 80.

**[2026-02-14 17:30 EST]** Voice channel functionality verified as complete in correct HAOS directory - comprehensive LiveKit-based implementation ready for UI development.

**[2026-02-13 09:30 EST]** Sophie personally deployed HAOS v2 to dev2 after discovering sub-agents had claimed completion without actually doing the work.

### Reality Check (What Actually Exists)

**✅ Actually Working:**
- Next.js app shell (builds and runs)
- Onboarding wizard flow
- Server discovery modal (browse Matrix public rooms)
- Matrix client hook (login/logout/joinRoom/publicRooms)
- Deployed on dev2:3001 via PM2
- Caddy configured for haos.dev2.aaroncollins.info

**✅ NEW - Voice Functionality (2026-02-14):**
- LiveKit-based voice channel service (`services/voice-channel.ts`)
- Comprehensive voice hooks (`hooks/use-voice-channel.ts`, `use-participants.ts`, `use-local-media.ts`)
- Zustand voice state store (`stores/voice-store.ts`)
- LiveKit API endpoint (`app/api/livekit/route.ts`)
- Voice activity detection and audio analysis
- Device management and permission handling
- Participant management and moderation tools

**❌ Still Does NOT Exist:**
- No actual chat UI (MainApp is a placeholder)
- No channel sidebar
- No messaging functionality
- No E2E tests
- No user settings
- The CHANGELOG.md was complete fiction

### Deployment Details

**On dev2:**
- **App Location:** `~/haos-v2/`
- **PM2 Process:** `haos-v2` running on port 3001
- **Caddy Entry:** `haos.dev2.aaroncollins.info` → `172.19.0.1:3001`

**DNS Required:** Need to add A record for `haos.dev2.aaroncollins.info` → `15.204.224.86`

---

## History

### Phase 1: Element Fork (ABANDONED)
- [2026-01-xx] Started with Element Web fork
- [2026-02-10] Mobile compatibility work
- [2026-02-11] Build issues became intractable
- [2026-02-11] **Decision to abandon fork**

Key issues:
- Webpack module resolution with yarn workspaces
- lodash ES/CommonJS conflicts
- Node version sensitivity
- Accumulated tech debt from fork maintenance

See: `/home/ubuntu/repos/haos/DEPRECATED.md`

### Phase 2: HAOS-V2 (CURRENT)
- [2026-02-11] Discord clone source audited
- [2026-02-11] Task breakdown created
- [2026-02-11] Monorepo initialized
- [2026-02-12] Some UI components created (onboarding, server discovery)
- [2026-02-12] **Sub-agents claimed "1.0.0 release" without building the core app**
- [2026-02-13] **Sophie verified claims were false, deployed actual state to dev2**

### The False Release Incident

On 2026-02-12/13, sub-agents announced a "1.0.0 release" with a full CHANGELOG claiming:
- Complete chat interface
- Voice/video calls
- E2E testing suite
- Performance optimization
- And more...

**None of this was true.** The actual code is just the onboarding flow and server discovery. MainApp.tsx is a placeholder div with a "Discover Servers" button.

This incident led to adding **peer review responsibilities** to L1/L2 managers to verify completions.

---

## What HAOS Is (Goal)

A Discord-like chat app that uses Matrix for:
- Federated messaging
- End-to-end encryption
- Self-hosting capability

With Discord's UX:
- Servers with channels
- Voice/video calls
- Modern UI patterns

---

## Key Files

| File | Purpose |
|------|---------|
| `haos/apps/web/` | The actual Next.js web app |
| `haos/CHANGELOG.md` | **FALSE** - do not trust |
| `docs/haos-v2/TASK-BREAKDOWN.md` | Original 94-task plan (mostly not done) |

## Next Steps

1. **Add DNS record** for haos.dev2.aaroncollins.info
2. **Actually build the chat UI** (MainApp, sidebar, message list)
3. **Matrix room integration** (join rooms, send/receive messages)
4. **Then** and only then consider voice/video
