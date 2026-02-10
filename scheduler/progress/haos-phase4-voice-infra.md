# Task: haos-phase4-voice-infra

## Status: In Progress
**Started:** 2025-02-02 15:45 EST
**Agent:** agent:main:subagent:0e08fb18-ba9c-4649-8655-0fb62e7d0faa

## Task Description
Create LiveKit voice integration - token service, VoiceConnectionManager, state events

## Context
- HAOS is a Discord-style UI for Element Web
- Element already has sophisticated voice/video via Element Call (LiveKit)
- Need to create Discord-style voice channel infrastructure on top of this

## Work Log

### [15:45] Initial Research
- Read existing Call.ts model - ElementCall and JitsiCall classes
- Read CallStore.ts - manages connected calls, RTC transports
- Read existing HAOS voice components:
  - HaosVoicePanel.tsx - UI shell, uses CallStore
  - HaosVoiceControls.tsx - Has TODO comments for widget API integration
  - HaosVoiceUser.tsx - Speaking detection prop but not connected

### [15:50] Architecture Design
Files to create:
1. `src/haos/voice/types.ts` - State event types for io.haos.voice.*
2. `src/haos/voice/HaosVoiceStore.ts` - Store for voice channel state
3. `src/haos/voice/VoiceConnectionManager.ts` - Connection manager
4. `src/haos/voice/hooks/useHaosVoice.ts` - React hooks
5. `src/haos/voice/index.ts` - Barrel exports

Files to update:
- HaosVoicePanel.tsx - Use real voice state
- HaosVoiceControls.tsx - Integrate with widget API
- HaosVoiceUser.tsx - Real speaking detection

### [15:55] Starting Implementation
- Creating type definitions for voice state events
- Creating VoiceConnectionManager class

## Files Changed
(Will update as work progresses)

## Dependencies
- matrix-js-sdk MatrixRTCSession
- Existing Call model and CallStore
- Element Call embedded widget

## Open Questions
- None currently - using existing LiveKit infrastructure via Element Call

## Validation Checklist
- [ ] TypeScript compiles without errors
- [ ] Voice state events defined with proper types
- [ ] VoiceConnectionManager handles reconnection
- [ ] Integration with existing Call infrastructure
- [ ] Build passes
