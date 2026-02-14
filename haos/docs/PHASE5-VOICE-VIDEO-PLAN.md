# Phase 5: Voice & Video Integration Plan

> **Status:** ACTIVE — Full Implementation
> **Authorized:** 2026-02-13 21:45 EST by Aaron
> **Target:** Complete implementation + deploy to dev2
> **Requirements:** NO STUBS — Production-ready code only

## Overview

Implement full voice and video calling capabilities for HAOS using LiveKit as the WebRTC infrastructure. This provides Discord-style voice channels and video calling integrated with the Matrix protocol.

## Technology Stack

- **LiveKit** — Open-source WebRTC infrastructure (self-hosted on dev2)
- **@livekit/components-react** — React components for voice/video UI
- **livekit-client** — JavaScript SDK for LiveKit
- **Matrix Signaling** — Use Matrix rooms for call signaling (MSC3401 style)

## Implementation Phases

### Phase 5.1: LiveKit Infrastructure Setup
**Priority:** CRITICAL (blocks all other work)

1. **LiveKit Server Deployment (dev2)**
   - Install LiveKit server on dev2
   - Configure TURN/STUN servers
   - Set up SSL certificates
   - Configure firewall rules (UDP ports for WebRTC)
   - Create API keys for authentication

2. **LiveKit Integration in HAOS**
   - Add `livekit-client` and `@livekit/components-react` dependencies
   - Create LiveKit service for token generation
   - Set up environment configuration

### Phase 5.2: Voice Channel Infrastructure
**Priority:** HIGH

1. **Voice Channel Service** (`services/voice-channel.ts`)
   - Room creation for voice channels
   - Participant management
   - Audio track handling
   - Mute/unmute functionality
   - Speaking indicators
   - Voice activity detection

2. **Voice Hooks** (`hooks/use-voice-channel.ts`)
   - `useVoiceChannel` — Join/leave voice channels
   - `useParticipants` — Track participants and their states
   - `useLocalAudio` — Manage local microphone
   - `useSpeakingState` — Voice activity indicators

### Phase 5.3: Voice Channel UI
**Priority:** HIGH

1. **Voice Channel List Component**
   - Display voice channels in server sidebar
   - Show connected users with avatars
   - Speaking indicators (green ring animation)
   - User count badges

2. **Voice Controls Component**
   - Mute/Unmute button
   - Deafen button
   - Settings button
   - Disconnect button
   - Connection status indicator

3. **Voice Channel Panel**
   - Current channel info
   - Participant grid with avatars
   - Volume controls per user
   - Screen share indicator

### Phase 5.4: Video Calling
**Priority:** HIGH

1. **Video Service** (`services/video-call.ts`)
   - Video track management
   - Camera selection
   - Video quality settings
   - Bandwidth adaptation

2. **Video Hooks**
   - `useVideoCall` — Video call state management
   - `useLocalVideo` — Camera controls
   - `useRemoteVideos` — Remote participant videos

3. **Video UI Components**
   - Video grid layout (auto-resize based on participant count)
   - Picture-in-picture support
   - Camera on/off controls
   - Video preview before joining

### Phase 5.5: Screen Sharing
**Priority:** MEDIUM

1. **Screen Share Service**
   - Screen/window/tab selection
   - Audio sharing (system audio)
   - Quality settings

2. **Screen Share UI**
   - Share button in voice/video controls
   - Screen share overlay in video grid
   - Stop sharing controls
   - Viewer count indicator

### Phase 5.6: Integration & Polish
**Priority:** HIGH

1. **Matrix Integration**
   - Voice channel state sync with Matrix
   - Presence updates when in voice
   - Call history in room timeline
   - Notifications for incoming calls

2. **Settings**
   - Audio device selection
   - Video device selection
   - Noise suppression toggle
   - Echo cancellation
   - Voice activity threshold
   - Push-to-talk option

3. **Error Handling & Recovery**
   - Connection retry logic
   - Network quality indicators
   - Graceful degradation
   - User-friendly error messages

## File Structure

```
haos/apps/web/
├── services/
│   ├── livekit.ts              # LiveKit client setup
│   ├── voice-channel.ts        # Voice channel management
│   ├── video-call.ts           # Video call management
│   └── screen-share.ts         # Screen sharing
├── hooks/
│   ├── use-voice-channel.ts    # Voice channel hook
│   ├── use-video-call.ts       # Video call hook
│   ├── use-participants.ts     # Participant tracking
│   ├── use-local-media.ts      # Local audio/video
│   └── use-screen-share.ts     # Screen sharing hook
├── components/
│   ├── voice/
│   │   ├── voice-channel-list.tsx
│   │   ├── voice-channel-panel.tsx
│   │   ├── voice-controls.tsx
│   │   ├── participant-tile.tsx
│   │   └── speaking-indicator.tsx
│   ├── video/
│   │   ├── video-grid.tsx
│   │   ├── video-tile.tsx
│   │   ├── video-controls.tsx
│   │   └── camera-preview.tsx
│   └── screen-share/
│       ├── screen-share-button.tsx
│       └── screen-share-view.tsx
└── stores/
    └── voice-store.ts          # Zustand store for voice state
```

## Dependencies to Add

```json
{
  "livekit-client": "^2.0.0",
  "@livekit/components-react": "^2.0.0",
  "@livekit/components-styles": "^1.0.0"
}
```

## Environment Variables

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.dev2.example.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

## Deployment to dev2

1. **LiveKit Server**
   - Docker container with LiveKit server
   - Nginx reverse proxy for WebSocket
   - SSL via Let's Encrypt

2. **HAOS Application**
   - Update Docker compose with LiveKit env vars
   - Deploy updated HAOS container
   - Configure CORS for LiveKit URLs

## Code Review Requirements

- All code must be reviewed before merge
- TypeScript strict mode compliance
- Unit tests for services
- Integration tests for voice/video flows
- Accessibility compliance (keyboard controls, screen reader)
- Performance testing (CPU/memory usage)

## Success Criteria

- [ ] Users can join voice channels and talk
- [ ] Voice activity indicators work correctly
- [ ] Video calls work with multiple participants
- [ ] Screen sharing works reliably
- [ ] All controls are intuitive and responsive
- [ ] Connection is stable and recovers from issues
- [ ] Deployed and running on dev2
- [ ] Code review completed on all components

## Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| 5.1 Infrastructure | 4-6 hours |
| 5.2 Voice Service | 6-8 hours |
| 5.3 Voice UI | 6-8 hours |
| 5.4 Video | 6-8 hours |
| 5.5 Screen Share | 4-6 hours |
| 5.6 Integration | 4-6 hours |
| **Total** | **30-42 hours** |

---

*Created: 2026-02-13 21:45 EST*
*Author: Sophie (per Aaron's directive)*
