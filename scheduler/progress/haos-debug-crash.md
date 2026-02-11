# HAOS Debug Crash Progress

## Status: IN PROGRESS - Found and fixed some issues, but root cause not fully resolved

## Work Log

### [2026-02-11 00:30 UTC] Started investigation
- Build exists, 134MB output looks correct
- Config on dev2 looks fine

### [2026-02-11 00:35 UTC] Found Issue #1: Invalid exports in haos/index.ts
The `/home/ubuntu/repos/haos/apps/web/src/haos/index.ts` was exporting from 12 non-existent modules:
- ./theme, ./voice, ./roles, ./performance, ./emoji, ./attachments
- ./moderation, ./automod, ./hooks, ./animations, ./accessibility, ./notifications

**Fixed:** Commented out these exports

### [2026-02-11 00:45 UTC] Found Issue #2: Conditional hook call in HaosChannelItem.tsx
Line 95 had: `const voiceParticipants = call ? useParticipatingMembers(call) : [];`

This violates React's Rules of Hooks - hooks cannot be called conditionally.

**Fixed:** Changed to always call the hook, updated `useParticipatingMembers` to accept `Call | null`

### [2026-02-11 00:50 UTC] Found Issue #3: Non-null assertion in HaosVoicePanel.tsx
Line 90 had: `const participants = useParticipatingMembers(connectedCall!);`

**Fixed:** Removed the `!` assertion

### [2026-02-11 01:00 UTC] Changed default sidebar setting
Changed `feature_haos_channel_sidebar` default from `true` to `false` in LeftPanel.tsx to test if sidebar is the root cause.

### [2026-02-11 01:10 UTC] Rebuilt and deployed 3 times
- All builds completed successfully (no TypeScript/build errors)
- Deployed to dev2 via rsync
- Page still hangs (title stays "about:blank" when loading https://dev2.aaroncollins.info/)

## Files Changed
- `/home/ubuntu/repos/haos/apps/web/src/haos/index.ts` - Commented out invalid exports
- `/home/ubuntu/repos/haos/apps/web/src/components/haos/channels/HaosChannelItem.tsx` - Fixed conditional hook call
- `/home/ubuntu/repos/haos/apps/web/src/hooks/useCall.ts` - Made useParticipatingMembers accept null
- `/home/ubuntu/repos/haos/apps/web/src/components/haos/channels/HaosVoicePanel.tsx` - Removed non-null assertion
- `/home/ubuntu/repos/haos/apps/web/src/components/structures/LeftPanel.tsx` - Changed sidebar default to false

## Current State
The page still hangs even with HAOS sidebar feature disabled. This suggests:
1. The issue is in core boot/initialization, not just the sidebar
2. Some HAOS code runs at module load time that's causing issues
3. Possibly circular dependencies or infinite loops in module initialization

## Next Steps Needed
1. Compare HAOS bundle with original Element Web bundle
2. Check if any HAOS modifications to core Element files are causing issues
3. Try bisecting: deploy vanilla Element Web to dev2 to confirm it works
4. Use browser performance profiler to identify the hanging JS

## Open Questions
- Is there HAOS code running at module load that blocks the main thread?
- Are there circular import dependencies in the HAOS modules?
- Did HAOS modify any core Element files that could cause this?

## Blockers
- Unable to get browser console output to identify exact JS error
- Need to compare with vanilla Element Web to isolate HAOS-specific issues
