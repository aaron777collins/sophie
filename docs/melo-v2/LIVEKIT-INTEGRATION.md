# LiveKit Integration Audit for MELO v2

**Audit Date:** 2025-02-13
**Status:** ✅ Compatible with minor configuration changes

## Overview

The Discord clone uses LiveKit for voice/video calls. Our dev2 environment already runs a LiveKit server integrated with Matrix/Element Call. The implementations are compatible with configuration changes.

## Discord Clone's LiveKit Architecture

### Components

1. **MediaRoom Component** (`components/media-room.tsx`)
   - Uses `@livekit/components-react` package
   - Wraps `LiveKitRoom` and `VideoConference` components
   - Fetches token from `/api/livekit` endpoint on mount
   - Props: `chatId`, `video`, `audio`
   - Connects to server URL via `NEXT_PUBLIC_LIVEKIT_URL` env var

2. **Token Generation API** (`app/api/livekit/route.ts`)
   - Server-side Next.js route handler
   - Uses `livekit-server-sdk` to generate JWT tokens
   - Requires: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`
   - Grants: `roomJoin`, `canPublish`, `canSubscribe`

3. **Video Button** (`components/chat/chat-video-button.tsx`)
   - Toggle button for video calls
   - Uses URL query params (`?video=true`) to control state
   - Shows Video/VideoOff icon based on state

### NPM Packages
```json
"@livekit/components-react": "^1.1.7",
"@livekit/components-styles": "^1.0.6",
"livekit-client": "^1.13.2",
"livekit-server-sdk": "^1.2.6"
```

### Token Generation Flow
```
Client → GET /api/livekit?room={chatId}&username={name}
       → AccessToken(apiKey, apiSecret, { identity: username })
       → addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true })
       → Response: { token: jwt }
```

### Features Supported
- ✅ Audio calls (audio-only mode)
- ✅ Video calls (video + audio)
- ✅ Multi-participant rooms
- ✅ Screen sharing (via VideoConference component)
- ✅ Mute/unmute controls (built into VideoConference)
- ✅ Camera toggle (built into VideoConference)

## Our Dev2 LiveKit Setup

### Infrastructure (docker-compose on dev2)

```yaml
livekit:
  image: livekit/livekit-server:latest
  container_name: matrix-livekit
  ports:
    - "7880:7880"       # HTTP/WebSocket API
    - "7881:7881"       # TCP (TURN fallback)
    - "7882:7882/udp"   # UDP (WebRTC media)
    - "50000-50100:50000-50100/udp"  # RTP ports
  volumes:
    - ./livekit/livekit.yaml:/etc/livekit.yaml:ro

livekit-jwt:
  image: ghcr.io/element-hq/lk-jwt-service:latest
  container_name: matrix-livekit-jwt
  environment:
    - LIVEKIT_URL=wss://livekit.dev2.aaroncollins.info
    - LIVEKIT_KEY=devkey
    - LIVEKIT_SECRET=LiveKit2026SecretKeyForMatrix
  ports:
    - "8380:8080"
```

### LiveKit Server Config (`livekit/livekit.yaml`)
```yaml
port: 7880
bind_addresses:
  - 0.0.0.0
rtc:
  port_range_start: 50000
  port_range_end: 50100
  tcp_port: 7881
  use_external_ip: true

keys:
  devkey: LiveKit2026SecretKeyForMatrix

logging:
  level: info
  json: false
```

### Connection Details

| Service | URL | Purpose |
|---------|-----|---------|
| LiveKit Server | `wss://livekit.dev2.aaroncollins.info` | WebSocket API |
| LiveKit HTTP | `https://livekit.dev2.aaroncollins.info:7880` | HTTP API |
| JWT Service | `http://dev2:8380` | Element Call token service |
| API Key | `devkey` | Authentication key |
| API Secret | `LiveKit2026SecretKeyForMatrix` | JWT signing secret |

### Synapse Integration
```yaml
experimental_features:
  msc3401_enabled: true

rtc:
  livekit_service_url: "https://livekit.dev2.aaroncollins.info"
  livekit_api_key: "devkey"
  livekit_api_secret: "LiveKit2026SecretKeyForMatrix"
```

## Compatibility Assessment

### ✅ Fully Compatible
- Same LiveKit server version works
- Same token generation pattern (API key + secret → JWT)
- Same client SDK packages
- Same WebSocket connection method

### 🔧 Required Changes

| Area | Discord Clone | MELO v2 Change |
|------|---------------|----------------|
| **Auth Provider** | Clerk (`user.firstName`) | Matrix SDK (`matrixUser.displayName`) |
| **Environment** | Clerk-based setup | Matrix-based setup |
| **Username Source** | `user.firstName` | Matrix user ID or display name |
| **Room ID** | Prisma channel ID | Matrix room ID |

### Key Difference: Token Service

Discord clone generates tokens **in-app** via `/api/livekit`. Our setup has a separate **lk-jwt-service** container for Element Call.

**Options:**
1. **Keep both** - Discord clone pattern for MELO, JWT service for Element Call (recommended)
2. **Migrate to JWT service** - Modify API route to proxy to `livekit-jwt` container
3. **Consolidate** - Use Discord clone's approach for both

**Recommendation:** Keep the in-app token generation. It's simpler and doesn't require network calls between services.

## Implementation Steps

### 1. Configure Environment Variables

Add to `/home/ubuntu/repos/melo-v2/.env`:
```bash
# LiveKit Configuration (using dev2's existing server)
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=LiveKit2026SecretKeyForMatrix
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.dev2.aaroncollins.info
```

### 2. Update MediaRoom Component

Replace Clerk user with Matrix context:

```tsx
// components/media-room.tsx
"use client";

import React, { useEffect, useState } from "react";
import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { Loader2 } from "lucide-react";
import { useMatrix } from "@/hooks/use-matrix"; // Our Matrix hook

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export function MediaRoom({ chatId, video, audio }: MediaRoomProps) {
  const { user } = useMatrix(); // Matrix user context
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user?.displayName && !user?.userId) return;

    const username = user.displayName || user.userId;

    (async () => {
      try {
        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${encodeURIComponent(username)}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [user, chatId]);

  if (token === "")
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );

  return (
    <LiveKitRoom
      video={video}
      audio={audio}
      token={token}
      connect={true}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
```

### 3. Token API Route (Already Compatible)

The existing `/app/api/livekit/route.ts` needs no changes. It's framework-agnostic and just needs env vars.

### 4. Add Matrix User Hook (if not exists)

```tsx
// hooks/use-matrix.ts
import { useContext } from "react";
import { MatrixContext } from "@/providers/matrix-provider";

export function useMatrix() {
  return useContext(MatrixContext);
}
```

### 5. Verify Room ID Format

Ensure room IDs passed to LiveKit are valid:
- Matrix room IDs: `!roomid:server.com`
- May need to sanitize for LiveKit (alphanumeric preferred)

```tsx
// Sanitize Matrix room ID for LiveKit
const livekitRoomId = roomId.replace(/[^a-zA-Z0-9]/g, '_');
```

## Feature Verification

### Audio Features
- ✅ Microphone capture
- ✅ Mute/unmute
- ✅ Speaker selection (via browser)
- ✅ Noise suppression (LiveKit built-in)

### Video Features  
- ✅ Camera capture
- ✅ Camera toggle
- ✅ Resolution adaptation
- ✅ Bandwidth adaptation

### Screen Sharing
- ✅ `VideoConference` component includes screen share button
- ✅ Works out of the box with LiveKit
- ⚠️ Requires HTTPS for `getDisplayMedia()` API
- ⚠️ Some browsers require user gesture to initiate

### Multi-Participant
- ✅ Grid view for multiple participants
- ✅ Active speaker detection
- ✅ Participant list

## Styling Integration

### Current Theme
Discord clone uses `data-lk-theme="default"` which provides basic styling.

### MELO Customization Options

1. **CSS Variables** - Override LiveKit's CSS custom properties:
```css
:root {
  --lk-theme-color: #5865F2;
  --lk-border-radius: 8px;
  --lk-bg: #313338;
  --lk-bg-2: #2B2D31;
}
```

2. **Custom Theme** - Create `data-lk-theme="melo"`:
```tsx
<LiveKitRoom data-lk-theme="melo">
```

3. **Replace Components** - Use individual LiveKit hooks instead of `VideoConference`:
```tsx
import { 
  useParticipants,
  useLocalParticipant,
  VideoTrack,
  AudioTrack 
} from "@livekit/components-react";
```

## Security Considerations

### Token Security
- ✅ Tokens generated server-side (API route)
- ✅ Short expiry (default: 6 hours)
- ⚠️ Consider adding Matrix session validation before issuing tokens

### Recommended: Add Auth Check
```tsx
// app/api/livekit/route.ts
export async function GET(req: NextRequest) {
  // Verify Matrix session before issuing LiveKit token
  const matrixSession = await getMatrixSession(req);
  if (!matrixSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // ... rest of token generation
}
```

## Production Considerations

### SSL/TLS
- LiveKit URL must be `wss://` (secure WebSocket)
- Screen sharing requires HTTPS

### TURN Server
- Dev2 has coturn configured for NAT traversal
- LiveKit can use built-in TURN or external coturn
- Verify: Users behind strict firewalls can connect

### Scaling
- Single LiveKit server handles ~100 concurrent participants
- For larger scale: LiveKit Cloud or horizontal scaling

## Summary

| Item | Status | Notes |
|------|--------|-------|
| LiveKit Server | ✅ Ready | Running on dev2 |
| NPM Packages | ✅ Ready | Already in melo-v2 |
| Token Generation | ✅ Ready | API route exists |
| Auth Integration | 🔧 Needed | Swap Clerk → Matrix |
| Environment Config | 🔧 Needed | Add 3 env vars |
| Styling | 🔧 Optional | Works with defaults |
| Screen Share | ✅ Ready | Built into VideoConference |

**Estimated Integration Effort:** 2-4 hours
- Auth swap: 1-2 hours
- Environment config: 15 minutes
- Testing: 1-2 hours
