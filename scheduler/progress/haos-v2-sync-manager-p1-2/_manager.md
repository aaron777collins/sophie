# Manager: haos-v2-sync-manager-p1-2 — Real-Time Sync Migration

## Overview
Migrate HAOS v2 from Socket.io to Matrix sync for real-time functionality.

## Sub-Tasks

| Task | Description | Status | Depends On |
|------|-------------|--------|------------|
| p1-2-a | Matrix Client Singleton | ✅ completed | - |
| p1-2-b | MatrixProvider Context | pending | a |
| p1-2-c | useMatrixClient Hook | pending | b |
| p1-2-d | useRoom Hook | pending | b |
| p1-2-e | useRoomMessages Hook | pending | d |

## Execution Order

1. **p1-2-a first** — Client singleton is foundation
2. **p1-2-b next** — Provider wraps app
3. **p1-2-c and p1-2-d parallel** — Both depend on b
4. **p1-2-e after d** — Messages hook needs room hook

## Manager Notes

- [01:01 EST] Manager created, 5 initial tasks populated
- Starting with p1-2-a (no dependencies)

## Integration Notes

- Auth system (p1-1) is complete
- MatrixAuthProvider exists at `components/providers/matrix-auth-provider.tsx`
- Need to coordinate with auth for session handoff to Matrix client
