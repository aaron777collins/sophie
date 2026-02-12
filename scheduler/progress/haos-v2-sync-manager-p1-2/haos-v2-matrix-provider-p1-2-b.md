# Task: haos-v2-matrix-provider-p1-2-b — MatrixProvider Context

## Summary
- **Status:** in-progress
- **Parent:** haos-v2-sync-manager-p1-2
- **Depends On:** haos-v2-matrix-client-singleton-p1-2-a (✅ completed)
- **Model:** opus

## What it does
React context that manages the Matrix client lifecycle:
- Initializes client when user logs in (using session from MatrixAuthProvider)
- Destroys client on logout
- Exposes sync state to components
- Tracks rooms list that updates in real-time

## Context Values to Expose
- `client: MatrixClient | null`
- `syncState: SyncState`
- `rooms: Room[]`
- `isReady: boolean`

## Work Log
- [08:05 EST] Started: Read context docs, manager notes, prior task notes
- [08:05 EST] Claimed task with heartbeat
- [08:05 EST] Starting implementation

## Files to Create
- `components/providers/matrix-provider.tsx`

## Dependencies
- `lib/matrix/client.ts` — singleton client (from p1-2-a)
- `matrix-js-sdk` — Room, SyncState types
- `MatrixAuthProvider` — session state (coordinate with auth context)

## Notes
- Previous task (p1-2-a) notes: "Use `initializeClient(session)` when user logs in, call `destroyClient()` on logout, listen for 'sync' event"
