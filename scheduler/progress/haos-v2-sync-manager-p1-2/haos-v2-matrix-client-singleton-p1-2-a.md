# Task: haos-v2-matrix-client-singleton-p1-2-a — Matrix Client Singleton

## Summary
- **Status:** pending
- **Parent:** haos-v2-sync-manager-p1-2
- **Model:** sonnet

## What to Build
Create a singleton Matrix SDK client at `lib/matrix/client.ts`:
- `initializeClient(session: MatrixSession): MatrixClient` — Create and start client
- `getClient(): MatrixClient | null` — Get existing client
- `destroyClient(): void` — Clean shutdown

## Prior Context
- Auth system complete (p1-1)
- MatrixSession type exists in `lib/matrix/types/auth.ts`
- Will be used by MatrixProvider (p1-2-b)

## Requirements
- Only one client instance at a time
- Client persists across React navigation
- Must start sync when initialized
- Clean shutdown on logout (stop sync, clear state)
- Use matrix-js-sdk (already installed)

## Success Criteria
- [ ] Singleton pattern implemented
- [ ] initializeClient starts sync
- [ ] getClient returns current instance
- [ ] destroyClient stops sync and clears
- [ ] Build passes
- [ ] Lint passes

## Work Log
(Agent will fill this in)

## Validation
(Agent will fill this in)
