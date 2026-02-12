# HAOS Project Overview

## Current Status: PIVOTING TO HAOS-V2

**[2026-02-11]** The original Element Web fork has been **abandoned** due to intractable build issues.

### Strategic Decision
- **Old approach:** Reskin Element Web (Matrix client)
- **New approach:** Discord clone frontend + Matrix backend

See: `docs/haos-v2/` for the new architecture.

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

### Phase 2: HAOS-V2 (ACTIVE)
- [2026-02-11] Discord clone source audited
- [2026-02-11] Task breakdown created (94 tasks, 4 phases)
- [2026-02-11] Monorepo initialized, TypeScript/ESLint configured
- [2026-02-11] UI components copied, Tailwind configured

**Current focus:** Fixing build, then continuing Phase 0 tasks.

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/haos-v2/TASK-BREAKDOWN.md` | Full 94-task implementation plan |
| `docs/haos-v2/ARCHITECTURE.md` | System architecture |
| `docs/haos-v2/DISCORD-CLONE-INVENTORY.md` | Component audit |
| `/home/ubuntu/repos/haos/DEPRECATED.md` | Why the fork was abandoned |
| `PROACTIVE-JOBS.md` | Active tasks |

---

## What HAOS Is

A Discord-like chat app that uses Matrix for:
- Federated messaging
- End-to-end encryption
- Self-hosting capability

But with Discord's UX:
- Servers with channels
- Voice/video calls
- Modern UI patterns
