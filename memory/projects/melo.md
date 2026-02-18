# Melo - Matrix-based Chat App

## Overview
Discord-like chat application using Matrix protocol for decentralized/federated messaging.

## Repository
- **Location:** `~/repos/melo/`
- **Remote:** `github.com/aaron777collins/melo`
- **Main branch:** `discord-ui-migration`

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui
- **Protocol:** Matrix (decentralized)
- **Client SDK:** matrix-js-sdk
- **Auth:** Matrix authentication (replacing Clerk)
- **Database:** Matrix server (replacing Prisma/PostgreSQL)

## Architecture Mapping
| Discord Concept | Matrix Equivalent |
|----------------|-------------------|
| Server | Space |
| Channel | Room |
| DM | E2EE Room |
| Message | Event |
| Role | Power Levels |

## Status
- [2026-02-18] Project started
- [2026-02-18] UI migration from discord-clone in progress
- [2026-02-18] Core Matrix integration files created
- [2026-02-18] Auth/route pages still being migrated

## Key Files
- `lib/matrix-client.ts` - Matrix client singleton
- `components/providers/matrix-provider.tsx` - React context
- `hooks/use-chat-query.ts` - Message fetching
- `hooks/use-chat-socket.ts` - Real-time sync

## Credits
See `CREDITS.md` - Based on discord-clone UI, Element patterns (AGPL-3.0)

## Next Milestones
1. Complete migration (build passes)
2. Basic Matrix login/register
3. Room creation/joining
4. Message sending/receiving
5. File uploads via Matrix
