# Task: melo-v2-matrix-provider-p1-2-b — MatrixProvider Context

## Summary
- **Status:** completed ✅
- **Parent:** melo-v2-sync-manager-p1-2
- **Model:** opus
- **Completed:** [2026-02-12 08:15 EST]

## What Was Built
Created `components/providers/matrix-provider.tsx` — React context managing Matrix client lifecycle:

### Context Values
- `client: MatrixClient | null` — Current client instance
- `syncState: SyncState | null` — Sync state enum (Error, Prepared, Stopped, Syncing, Catchup, Reconnecting)
- `rooms: Room[]` — List of joined rooms, updates in real-time
- `isReady: boolean` — True when synced at least once (Prepared or Syncing)
- `isSyncing: boolean` — True when actively syncing
- `syncError: Error | null` — Sync error if any

### Actions
- `getRoom(roomId: string): Room | null` — Get room by ID
- `refreshRooms(): void` — Force refresh rooms list

### Integration
- Uses `useMatrixAuth()` to get session from MatrixAuthProvider
- Calls `initializeClient(session)` when session appears
- Calls `destroyClient()` when session is null (logout)
- Listens to `ClientEvent.Sync` for sync state changes
- Listens to `ClientEvent.Room` and `ClientEvent.DeleteRoom` for room updates

## Files Changed
- `/home/ubuntu/repos/melo-v2/components/providers/matrix-provider.tsx` — New file (381 lines)

## Success Criteria - All Met
- [x] Client initializes when user logs in
- [x] Sync state exposed to components
- [x] Rooms update in real-time
- [x] Build passes
- [x] Lint passes
- [x] TypeScript types (no 'any')

## Work Log
- [08:05 EST] Started: Read context docs, manager notes, prior task (p1-2-a) notes
- [08:05 EST] Claimed task with heartbeat
- [08:07 EST] Investigated matrix-js-sdk types (SyncState, ClientEvent, Room)
- [08:10 EST] Created MatrixProvider component
- [08:12 EST] Fixed .next cache issue (rm -rf .next)
- [08:14 EST] Build passed ✅
- [08:14 EST] Lint passed ✅
- [08:15 EST] Git commit: c56367d

## Validation
```bash
cd /home/ubuntu/repos/melo-v2
rm -rf .next     # Clear stale cache
pnpm build       # ✅ Passes
pnpm lint        # ✅ No warnings or errors
```

## Notes for Next Agent (p1-2-c: useMatrixClient, p1-2-d: useRoom)
- Import `useMatrix` from `@/components/providers/matrix-provider`
- `useMatrix()` returns `{ client, syncState, rooms, isReady, getRoom, ... }`
- For `useMatrixClient` hook: just re-export relevant parts from useMatrix
- For `useRoom` hook: use `getRoom(roomId)` and listen for room state changes
- SyncState is re-exported from the provider for convenience

## Integration Example
```tsx
// In root layout (AFTER MatrixAuthProvider)
import { MatrixAuthProvider } from '@/components/providers/matrix-auth-provider';
import { MatrixProvider } from '@/components/providers/matrix-provider';

export default function RootLayout({ children }) {
  return (
    <MatrixAuthProvider>
      <MatrixProvider>
        {children}
      </MatrixProvider>
    </MatrixAuthProvider>
  );
}

// In a component
function RoomList() {
  const { rooms, isReady } = useMatrix();
  if (!isReady) return <Spinner />;
  return rooms.map(r => <div key={r.roomId}>{r.name}</div>);
}
```
