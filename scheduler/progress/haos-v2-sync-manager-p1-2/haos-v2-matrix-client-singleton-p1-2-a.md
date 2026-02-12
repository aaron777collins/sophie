# Task: haos-v2-matrix-client-singleton-p1-2-a — Matrix Client Singleton

## Summary
- **Status:** completed ✅
- **Parent:** haos-v2-sync-manager-p1-2
- **Model:** opus (assigned sonnet, escalated)
- **Completed:** [2026-02-12 02:20 EST]

## What Was Built
Created `lib/matrix/client.ts` with a singleton Matrix SDK client:
- `initializeClient(session: MatrixSession): MatrixClient` — Creates client, starts sync, stores singleton
- `getClient(): MatrixClient | null` — Returns current client or null
- `hasClient(): boolean` — Quick check if client exists
- `destroyClient(): void` — Stops sync, removes listeners, clears singleton

## Implementation Details
- Uses `matrix-js-sdk` (added as dependency, version 40.3.0-rc.0)
- Validates session has required fields (homeserverUrl, accessToken, userId)
- Auto-destroys existing client before creating new one (idempotent)
- Starts sync with sensible defaults (initialSyncLimit: 10, no archived rooms)
- Removes all event listeners on destroy to prevent memory leaks
- Re-exports MatrixClient type for consumers

## Files Changed
- `/home/ubuntu/repos/haos-v2/lib/matrix/client.ts` — New file (singleton implementation)
- `/home/ubuntu/repos/haos-v2/package.json` — Added matrix-js-sdk dependency

## Success Criteria - All Met
- [x] Singleton pattern (only one client at a time)
- [x] initializeClient starts sync
- [x] getClient returns current instance
- [x] destroyClient stops sync and clears
- [x] TypeScript types (no 'any')
- [x] Build passes
- [x] Lint passes

## Work Log
- [02:15 EST] Read context docs, manager notes, auth types
- [02:16 EST] Claimed task via heartbeat
- [02:17 EST] Installed matrix-js-sdk (wasn't in package.json despite docs)
- [02:18 EST] Created lib/matrix/client.ts with full implementation
- [02:19 EST] Build passed (had to clear .next cache due to stale state)
- [02:20 EST] Lint passed
- [02:20 EST] Git commit: e6eb73b

## Notes for Next Agent (p1-2-b: MatrixProvider)
- Import from `@/lib/matrix/client`
- Use `initializeClient(session)` when user logs in (from MatrixAuthProvider)
- Call `destroyClient()` on logout
- The client emits events for sync state - listen for 'sync' event
- Consider wrapping in React context that tracks sync state

## Validation
```bash
cd /home/ubuntu/repos/haos-v2
pnpm build  # ✅ Passes
pnpm lint   # ✅ No warnings or errors
```
