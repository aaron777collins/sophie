# HAOS v2 Real-Time Strategy: Socket.io → Matrix Sync Migration

> **Audit Task:** `audit-04-realtime-strategy`  
> **Date:** 2026-02-11  
> **Source:** `/home/ubuntu/repos/discord-clone-reference`

This document provides a comprehensive strategy for migrating from Socket.io to Matrix sync for all real-time features in HAOS v2.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Socket.io Architecture](#2-current-socketio-architecture)
3. [Complete Socket.io Event Inventory](#3-complete-socketio-event-inventory)
4. [Matrix Sync API Overview](#4-matrix-sync-api-overview)
5. [Event-by-Event Migration Mapping](#5-event-by-event-migration-mapping)
6. [Implementation Approach](#6-implementation-approach)
7. [Challenges and Solutions](#7-challenges-and-solutions)
8. [Code Migration Guide](#8-code-migration-guide)
9. [Testing Strategy](#9-testing-strategy)
10. [Timeline and Phases](#10-timeline-and-phases)

---

## 1. Executive Summary

### Current State
The Discord clone reference uses **Socket.io** for real-time features:
- Message delivery (new messages, edits, deletes)
- Connection status indication
- Fallback polling when disconnected

### Target State
HAOS v2 will use **Matrix sync API** which provides:
- Built-in real-time event streaming
- Typing indicators (native)
- Presence (native)
- Read receipts (native)
- Reactions (native)
- End-to-end encryption support
- Federation across servers

### Key Benefits of Migration
| Aspect | Socket.io | Matrix Sync |
|--------|-----------|-------------|
| **Infrastructure** | Custom WebSocket server | Homeserver handles it |
| **Scalability** | Manual scaling | Homeserver federation |
| **Offline support** | Manual implementation | Built-in sync |
| **Typing indicators** | Would need custom | Native `m.typing` |
| **Presence** | Would need custom | Native `m.presence` |
| **Read receipts** | Would need custom | Native `m.receipt` |
| **E2E Encryption** | Not supported | Native Megolm/Olm |

---

## 2. Current Socket.io Architecture

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DISCORD CLONE SOCKET.IO ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────────┘

  CLIENT (Browser)                          SERVER (Next.js)
  ================                          =================
                                            
  ┌──────────────────┐                     ┌──────────────────────────────────┐
  │  SocketProvider  │                     │  /api/socket/io                  │
  │  (Context)       │◄───WebSocket────────┤  Socket.io Server Setup          │
  │                  │                     │                                  │
  │  - socket        │                     │  ┌────────────────────────────┐  │
  │  - isConnected   │                     │  │ res.socket.server.io       │  │
  └────────┬─────────┘                     │  │ (Socket.IO Server)         │  │
           │                               │  └────────────┬───────────────┘  │
           │                               └───────────────┼──────────────────┘
           │                                               │
  ┌────────▼─────────┐                                     │
  │  useChatSocket   │                                     │
  │  (Hook)          │                                     │
  │                  │                     ┌───────────────▼──────────────────┐
  │  Listens for:    │                     │  /api/socket/messages            │
  │  - addKey        │◄────emit────────────┤  - POST: Create message          │
  │  - updateKey     │                     │  - Emits: chat:${id}:messages    │
  └────────┬─────────┘                     ├──────────────────────────────────┤
           │                               │  /api/socket/messages/[id]       │
           │                               │  - PATCH: Edit message           │
  ┌────────▼─────────┐                     │  - DELETE: Delete message        │
  │  React Query     │                     │  - Emits: chat:${id}:messages:   │
  │  Cache Update    │                     │           update                 │
  │                  │                     └──────────────────────────────────┘
  │  Updates UI      │                                     │
  │  immediately     │                     ┌───────────────▼──────────────────┐
  └──────────────────┘                     │  /api/socket/direct-messages     │
                                           │  (Same pattern for DMs)          │
                                           └──────────────────────────────────┘
```

### 2.2 File Structure

```
discord-clone-reference/
├── components/
│   └── providers/
│       └── socket-provider.tsx      # Socket.io client context
│   └── socket-indicatior.tsx        # Connection status badge
│
├── hooks/
│   └── use-chat-socket.ts           # Real-time message updates
│   └── use-chat-query.ts            # Polling fallback when disconnected
│
├── pages/
│   └── api/
│       └── socket/
│           ├── io.ts                # Socket.io server initialization
│           ├── messages/
│           │   ├── index.ts         # Channel message create
│           │   └── [messageId].ts   # Channel message edit/delete
│           └── direct-messages/
│               ├── index.ts         # DM create
│               └── [directMessageId].ts  # DM edit/delete
│
└── types.ts                         # NextApiResponseServerIo type
```

### 2.3 Server Setup (`pages/api/socket/io.ts`)

```typescript
// Minimal Socket.io server initialization
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false
    });
    res.socket.server.io = io;
  }
  res.end();
};
```

**Key Points:**
- Lazy initialization (creates io only once)
- Attaches to Next.js's underlying HTTP server
- No namespaces or rooms used
- Global broadcast pattern (all connected clients receive all events)

### 2.4 Client Provider (`socket-provider.tsx`)

```typescript
// Context providing socket and connection state
const socketInstance = new ClientIO(
  process.env.NEXT_PUBLIC_SITE_URL!,
  {
    path: "/api/socket/io",
    addTrailingSlash: false
  }
);

socketInstance.on("connect", () => setIsConnected(true));
socketInstance.on("disconnect", () => setIsConnected(false));
```

**Key Points:**
- Single global socket connection
- Simple connected/disconnected state
- No authentication on socket level (auth via API cookies)

### 2.5 Message Hook (`use-chat-socket.ts`)

```typescript
// Listens for real-time message events
export const useChatSocket = ({ addKey, updateKey, queryKey }) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    // New message listener
    socket.on(addKey, (message) => {
      queryClient.setQueryData([queryKey], (oldData) => {
        // Prepend new message to first page
        newData[0].items = [message, ...newData[0].items];
        return { ...oldData, pages: newData };
      });
    });

    // Updated message listener
    socket.on(updateKey, (message) => {
      queryClient.setQueryData([queryKey], (oldData) => {
        // Find and replace the message
        return updated;
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [socket, addKey, updateKey, queryKey]);
};
```

---

## 3. Complete Socket.io Event Inventory

### 3.1 Event Summary Table

| Event Pattern | Direction | Trigger | Payload | Handler Location |
|---------------|-----------|---------|---------|------------------|
| `connect` | Server→Client | WebSocket connected | None | `socket-provider.tsx` |
| `disconnect` | Server→Client | WebSocket disconnected | None | `socket-provider.tsx` |
| `chat:{channelId}:messages` | Server→Client | New channel message | `Message` object | `use-chat-socket.ts` |
| `chat:{channelId}:messages:update` | Server→Client | Message edited/deleted | `Message` object | `use-chat-socket.ts` |
| `chat:{conversationId}:messages` | Server→Client | New DM | `DirectMessage` object | `use-chat-socket.ts` |
| `chat:{conversationId}:messages:update` | Server→Client | DM edited/deleted | `DirectMessage` object | `use-chat-socket.ts` |

### 3.2 Detailed Event Specifications

#### Event: `chat:{channelId}:messages` (New Channel Message)

**Triggered by:** `POST /api/socket/messages`

**Payload:**
```typescript
interface MessagePayload {
  id: string;
  content: string;
  fileUrl: string | null;
  memberId: string;
  channelId: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  member: {
    id: string;
    role: 'ADMIN' | 'MODERATOR' | 'GUEST';
    profileId: string;
    serverId: string;
    profile: {
      id: string;
      userId: string;
      name: string;
      imageUrl: string;
      email: string;
    };
  };
}
```

**Emission Code:**
```typescript
// pages/api/socket/messages/index.ts
const channelKey = `chat:${channelId}:messages`;
res?.socket?.server?.io?.emit(channelKey, message);
```

#### Event: `chat:{channelId}:messages:update` (Channel Message Edit/Delete)

**Triggered by:** `PATCH/DELETE /api/socket/messages/[messageId]`

**Payload:** Same as above (message object with updated content)

**Emission Code:**
```typescript
// pages/api/socket/messages/[messageId].ts
const updateKey = `chat:${channelId}:messages:update`;
res?.socket?.server?.io?.emit(updateKey, message);
```

#### Event: `chat:{conversationId}:messages` (New Direct Message)

**Triggered by:** `POST /api/socket/direct-messages`

**Payload:** Same structure as channel message

**Emission Code:**
```typescript
// pages/api/socket/direct-messages/index.ts
const channelKey = `chat:${conversationId}:messages`;
res?.socket?.server?.io?.emit(channelKey, message);
```

#### Event: `chat:{conversationId}:messages:update` (DM Edit/Delete)

**Triggered by:** `PATCH/DELETE /api/socket/direct-messages/[directMessageId]`

**Payload:** Same structure as channel message

### 3.3 Events NOT Implemented (But Common in Discord)

The reference implementation is minimal. These features would need custom Socket.io events but come free with Matrix:

| Feature | Would-Be Socket.io Event | Matrix Native |
|---------|--------------------------|---------------|
| **Typing indicators** | `chat:{id}:typing` | `m.typing` EDU |
| **User presence** | `user:{id}:presence` | `m.presence` |
| **Read receipts** | `chat:{id}:read` | `m.receipt` |
| **Reactions** | `chat:{id}:reaction` | `m.reaction` event |
| **Voice channel join/leave** | `voice:{id}:join/leave` | LiveKit handles this |
| **User went online/offline** | `user:online/offline` | `m.presence` |
| **Server member join** | `server:{id}:member:join` | `m.room.member` state |
| **Server member leave** | `server:{id}:member:leave` | `m.room.member` state |
| **Channel created** | `server:{id}:channel:create` | `m.space.child` state |
| **Channel deleted** | `server:{id}:channel:delete` | `m.space.child` removal |

---

## 4. Matrix Sync API Overview

### 4.1 How Matrix Sync Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MATRIX SYNC ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

  CLIENT (Browser/SDK)                      HOMESERVER (Synapse/Conduit/etc)
  ====================                      ================================

  ┌──────────────────┐     GET /sync        ┌──────────────────────────────┐
  │  Matrix Client   │────(long-poll)──────►│  Event Store                 │
  │                  │                       │                              │
  │  startClient()   │◄────JSON response────│  - Room timelines            │
  │                  │     (events batch)    │  - State events              │
  └────────┬─────────┘                       │  - Ephemeral (typing, etc)   │
           │                                 │  - To-device messages        │
           │                                 │  - Account data              │
  ┌────────▼─────────┐                       └──────────────────────────────┘
  │  Event Emitters  │
  │                  │
  │  Room.timeline   │─── New messages, edits
  │  Room.redaction  │─── Message deletions
  │  RoomMember.typing│── Typing indicators
  │  Room.receipt    │─── Read receipts
  │  User.presence   │─── Online/offline
  │  Room.name       │─── Room name changes
  │  Room.member     │─── Membership changes
  │  accountData     │─── User settings
  └──────────────────┘
```

### 4.2 The `/sync` Endpoint

**Request:**
```http
GET /_matrix/client/v3/sync?
  since={next_batch}&          # Token for incremental sync
  timeout=30000&               # Long-poll timeout (ms)
  full_state=false&            # Full state or incremental
  filter={filter_id}           # Optional server-side filter
```

**Response Structure:**
```json
{
  "next_batch": "s72595_4483_1934",
  "rooms": {
    "join": {
      "!roomId:server": {
        "timeline": {
          "events": [...],
          "prev_batch": "t34-23535_0_0",
          "limited": false
        },
        "state": {
          "events": [...]
        },
        "ephemeral": {
          "events": [...]  // Typing, receipts
        },
        "account_data": {
          "events": [...]
        },
        "unread_notifications": {
          "highlight_count": 0,
          "notification_count": 5
        }
      }
    },
    "invite": {...},
    "leave": {...}
  },
  "presence": {
    "events": [...]
  },
  "account_data": {
    "events": [...]
  },
  "to_device": {
    "events": [...]
  }
}
```

### 4.3 Key Matrix Event Types

#### Timeline Events (Room Events)

| Event Type | Purpose | Equivalent To |
|------------|---------|---------------|
| `m.room.message` | Text, images, files | Channel/DM messages |
| `m.room.encrypted` | E2E encrypted message | Same, encrypted |
| `m.reaction` | Emoji reactions | Not in clone |
| `m.sticker` | Sticker messages | Not in clone |

#### State Events

| Event Type | Purpose | Equivalent To |
|------------|---------|---------------|
| `m.room.name` | Room/channel name | Channel name |
| `m.room.topic` | Room description | Channel topic |
| `m.room.avatar` | Room/server icon | Server/channel icon |
| `m.room.member` | Membership state | Server members |
| `m.room.power_levels` | Permissions | Member roles |
| `m.space.child` | Space hierarchy | Server→Channel relation |
| `m.space.parent` | Space hierarchy | Channel→Server relation |

#### Ephemeral Events (To-Device, EDUs)

| Event Type | Purpose | Equivalent To |
|------------|---------|---------------|
| `m.typing` | Typing indicators | Not in clone |
| `m.receipt` | Read receipts | Not in clone |
| `m.presence` | Online/offline status | Not in clone |

### 4.4 Matrix JS SDK Event System

```typescript
import { createClient, MatrixClient, Room, MatrixEvent } from 'matrix-js-sdk';

const client: MatrixClient = createClient({
  baseUrl: 'https://matrix.example.org',
  accessToken: 'syt_...',
  userId: '@user:example.org'
});

// Start the sync loop
await client.startClient({ initialSyncLimit: 10 });

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

// New timeline events (messages, reactions, etc.)
client.on('Room.timeline', (event: MatrixEvent, room: Room, toStartOfTimeline: boolean) => {
  if (toStartOfTimeline) return; // Historical event, not new
  
  const eventType = event.getType();
  const roomId = room.roomId;
  
  if (eventType === 'm.room.message') {
    // New message!
    const content = event.getContent();
    const sender = event.getSender();
    const isEdit = content['m.relates_to']?.rel_type === 'm.replace';
    
    if (isEdit) {
      // Message was edited
      const originalEventId = content['m.relates_to'].event_id;
      handleMessageEdit(roomId, originalEventId, content);
    } else {
      // New message
      handleNewMessage(roomId, event);
    }
  }
});

// Message deletions (redactions)
client.on('Room.redaction', (event: MatrixEvent, room: Room) => {
  const redactedEventId = event.event.redacts;
  handleMessageDelete(room.roomId, redactedEventId);
});

// Typing indicators
client.on('RoomMember.typing', (event: MatrixEvent, member: RoomMember) => {
  const roomId = member.roomId;
  const userId = member.userId;
  const isTyping = member.typing;
  handleTypingIndicator(roomId, userId, isTyping);
});

// Read receipts
client.on('Room.receipt', (event: MatrixEvent, room: Room) => {
  const content = event.getContent();
  // Process read receipts
  for (const eventId in content) {
    const readers = content[eventId]['m.read'];
    handleReadReceipt(room.roomId, eventId, readers);
  }
});

// Presence (online/offline/unavailable)
client.on('User.presence', (event: MatrixEvent, user: User) => {
  const presence = user.presence; // 'online' | 'offline' | 'unavailable'
  const lastActive = user.lastActiveAgo;
  const statusMsg = user.presenceStatusMsg;
  handlePresenceChange(user.userId, presence, statusMsg);
});

// Room membership changes
client.on('RoomMember.membership', (event: MatrixEvent, member: RoomMember) => {
  const membership = member.membership; // 'join' | 'leave' | 'invite' | 'ban'
  handleMembershipChange(member.roomId, member.userId, membership);
});

// Room state changes
client.on('RoomState.events', (event: MatrixEvent, state: RoomState) => {
  const eventType = event.getType();
  if (eventType === 'm.room.name') {
    handleRoomNameChange(state.roomId, event.getContent().name);
  }
});
```

---

## 5. Event-by-Event Migration Mapping

### 5.1 Complete Mapping Table

| Socket.io Event | Matrix Event | SDK Method/Listener | Notes |
|-----------------|--------------|---------------------|-------|
| `connect` | Sync state: `PREPARED` | `client.on('sync', (state) => ...)` | State = 'PREPARED' means ready |
| `disconnect` | Sync state: `STOPPED`/`ERROR` | `client.on('sync', (state) => ...)` | Handle reconnection |
| `chat:{id}:messages` (new) | `m.room.message` in timeline | `client.on('Room.timeline', ...)` | Filter by `!toStartOfTimeline` |
| `chat:{id}:messages:update` (edit) | `m.room.message` with `m.replace` | `client.on('Room.timeline', ...)` | Check `m.relates_to.rel_type` |
| `chat:{id}:messages:update` (delete) | `m.room.redaction` | `client.on('Room.redaction', ...)` | Redacted event ID in `event.redacts` |
| *(not impl)* typing | `m.typing` | `client.on('RoomMember.typing', ...)` | Native support |
| *(not impl)* presence | `m.presence` | `client.on('User.presence', ...)` | Native support |
| *(not impl)* read receipt | `m.receipt` | `client.on('Room.receipt', ...)` | Native support |
| *(not impl)* reaction | `m.reaction` | `client.on('Room.timeline', ...)` | Event type = `m.reaction` |

### 5.2 Detailed Migration: New Message

**Before (Socket.io):**
```typescript
// Server: pages/api/socket/messages/index.ts
const message = await db.message.create({ data: {...} });
const channelKey = `chat:${channelId}:messages`;
res?.socket?.server?.io?.emit(channelKey, message);

// Client: hooks/use-chat-socket.ts
socket.on(`chat:${chatId}:messages`, (message) => {
  queryClient.setQueryData([queryKey], (oldData) => {
    newData[0].items = [message, ...newData[0].items];
    return { ...oldData, pages: newData };
  });
});
```

**After (Matrix):**
```typescript
// Server: Message creation
// NO SERVER CODE NEEDED - client sends directly to Matrix
await client.sendMessage(roomId, {
  msgtype: 'm.text',
  body: content,
  ...(fileUrl && {
    msgtype: 'm.file',
    url: await uploadToMxc(fileUrl)
  })
});

// Client: Real-time listener
client.on('Room.timeline', (event, room, toStartOfTimeline) => {
  if (toStartOfTimeline) return;
  if (event.getType() !== 'm.room.message') return;
  if (room.roomId !== currentRoomId) return;
  
  // Check if it's an edit
  const content = event.getContent();
  if (content['m.relates_to']?.rel_type === 'm.replace') {
    return; // Handled by edit listener
  }
  
  // Add to messages state
  setMessages(prev => [...prev, event]);
});
```

### 5.3 Detailed Migration: Message Edit

**Before (Socket.io):**
```typescript
// Server: pages/api/socket/messages/[messageId].ts (PATCH)
message = await db.message.update({
  where: { id: messageId },
  data: { content }
});
const updateKey = `chat:${channelId}:messages:update`;
res?.socket?.server?.io?.emit(updateKey, message);

// Client
socket.on(`chat:${chatId}:messages:update`, (message) => {
  queryClient.setQueryData([queryKey], (oldData) => {
    return oldData.pages.map(page => ({
      ...page,
      items: page.items.map(item => 
        item.id === message.id ? message : item
      )
    }));
  });
});
```

**After (Matrix):**
```typescript
// Client sends edit directly
await client.sendMessage(roomId, {
  msgtype: 'm.text',
  body: `* ${newContent}`,  // Fallback for clients without edit support
  'm.new_content': {
    msgtype: 'm.text',
    body: newContent
  },
  'm.relates_to': {
    rel_type: 'm.replace',
    event_id: originalEventId
  }
});

// Client listener
client.on('Room.timeline', (event, room, toStartOfTimeline) => {
  if (toStartOfTimeline) return;
  
  const content = event.getContent();
  if (content['m.relates_to']?.rel_type === 'm.replace') {
    const originalEventId = content['m.relates_to'].event_id;
    const newContent = content['m.new_content'];
    
    setMessages(prev => prev.map(msg => 
      msg.getId() === originalEventId 
        ? { ...msg, content: newContent }
        : msg
    ));
  }
});
```

### 5.4 Detailed Migration: Message Delete

**Before (Socket.io):**
```typescript
// Server: Soft delete
message = await db.message.update({
  where: { id: messageId },
  data: { 
    deleted: true, 
    content: "This message has been deleted.",
    fileUrl: null 
  }
});
res?.socket?.server?.io?.emit(updateKey, message);

// Client: Shows "deleted" placeholder
```

**After (Matrix):**
```typescript
// Client sends redaction directly
await client.redactEvent(roomId, eventId, 'User deleted message');

// Client listener
client.on('Room.redaction', (event, room) => {
  const redactedEventId = event.event.redacts;
  
  setMessages(prev => prev.map(msg => 
    msg.getId() === redactedEventId
      ? { ...msg, redacted: true, content: { body: 'This message has been deleted.' } }
      : msg
  ));
  // OR filter out completely:
  // setMessages(prev => prev.filter(msg => msg.getId() !== redactedEventId));
});
```

### 5.5 Detailed Migration: Connection Status

**Before (Socket.io):**
```typescript
// socket-provider.tsx
socketInstance.on("connect", () => setIsConnected(true));
socketInstance.on("disconnect", () => setIsConnected(false));

// socket-indicator.tsx
if (!isConnected) return <Badge>Fallback: Polling every 1s</Badge>;
return <Badge>Live: Real-time updates</Badge>;

// use-chat-query.ts - Polling fallback
useInfiniteQuery({
  refetchInterval: isConnected ? false : 1000  // Poll every 1s when disconnected
});
```

**After (Matrix):**
```typescript
// Matrix sync states
type SyncState = 
  | 'PREPARED'    // Initial sync complete, ready
  | 'SYNCING'     // Actively syncing
  | 'STOPPED'     // Sync stopped (call stopClient)
  | 'CATCHUP'     // Catching up after reconnect
  | 'RECONNECTING'// Reconnecting
  | 'ERROR';      // Error occurred

// Connection state provider
const [syncState, setSyncState] = useState<SyncState>('STOPPED');

client.on('sync', (state: SyncState, prevState: SyncState | null, data: object) => {
  setSyncState(state);
  
  if (state === 'ERROR') {
    console.error('Sync error:', data);
    // Matrix SDK handles reconnection automatically
  }
});

// Connection indicator
function ConnectionIndicator() {
  const { syncState } = useMatrixClient();
  
  if (syncState === 'PREPARED' || syncState === 'SYNCING') {
    return <Badge className="bg-emerald-600">Live: Real-time updates</Badge>;
  }
  if (syncState === 'RECONNECTING' || syncState === 'CATCHUP') {
    return <Badge className="bg-yellow-600">Reconnecting...</Badge>;
  }
  if (syncState === 'ERROR') {
    return <Badge className="bg-red-600">Connection Error</Badge>;
  }
  return <Badge className="bg-gray-600">Connecting...</Badge>;
}
```

---

## 6. Implementation Approach

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HAOS v2 MATRIX ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                           REACT APPLICATION                              │
  │  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐   │
  │  │ MatrixProvider  │   │ useRoomMessages │   │ useTypingIndicator  │   │
  │  │ (Context)       │   │ (Hook)          │   │ (Hook)              │   │
  │  │                 │   │                 │   │                     │   │
  │  │ - client        │   │ - messages[]    │   │ - typingUsers[]     │   │
  │  │ - syncState     │   │ - sendMessage() │   │ - sendTyping()      │   │
  │  │ - rooms[]       │   │ - editMessage() │   └─────────────────────┘   │
  │  └────────┬────────┘   │ - deleteMsg()   │   ┌─────────────────────┐   │
  │           │            └────────┬────────┘   │ usePresence         │   │
  │           │                     │            │ (Hook)              │   │
  │           │                     │            │ - presence          │   │
  │           │                     │            │ - setPresence()     │   │
  │           │                     │            └─────────────────────┘   │
  └───────────┼─────────────────────┼──────────────────────────────────────┘
              │                     │
              │  Matrix JS SDK      │
              │                     │
  ┌───────────▼─────────────────────▼──────────────────────────────────────┐
  │                         MATRIX HOMESERVER                               │
  │  ┌─────────────────────────────────────────────────────────────────┐   │
  │  │                    /sync (Long-Poll)                             │   │
  │  │  • Timeline events (messages)                                    │   │
  │  │  • State events (room names, members, power levels)              │   │
  │  │  • Ephemeral data (typing, receipts)                             │   │
  │  │  • Presence                                                      │   │
  │  │  • To-device messages (E2E keys)                                 │   │
  │  └─────────────────────────────────────────────────────────────────┘   │
  └────────────────────────────────────────────────────────────────────────┘
```

### 6.2 New File Structure

```
haos/apps/web/
├── lib/
│   └── matrix/
│       ├── client.ts              # Matrix client singleton
│       ├── events.ts              # Event type definitions
│       └── transforms.ts          # Event → UI data transforms
│
├── providers/
│   └── matrix-provider.tsx        # MatrixClient context
│
├── hooks/
│   ├── use-matrix-client.ts       # Access client from context
│   ├── use-room-messages.ts       # Real-time messages for a room
│   ├── use-room-state.ts          # Room state (name, topic, etc.)
│   ├── use-typing-indicator.ts    # Typing indicators
│   ├── use-presence.ts            # User presence
│   ├── use-read-receipts.ts       # Read receipts
│   └── use-room-members.ts        # Room membership
│
├── components/
│   ├── connection-indicator.tsx   # Sync state badge
│   ├── typing-indicator.tsx       # "User is typing..." 
│   └── presence-dot.tsx           # Online/offline dot
│
└── (deleted)
    ├── socket-provider.tsx        # REMOVED
    ├── use-chat-socket.ts         # REMOVED
    └── pages/api/socket/          # REMOVED (entire directory)
```

### 6.3 Core Implementation: Matrix Provider

```typescript
// providers/matrix-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, MatrixClient, SyncState, Room } from 'matrix-js-sdk';

interface MatrixContextValue {
  client: MatrixClient | null;
  syncState: SyncState;
  rooms: Room[];
  isReady: boolean;
}

const MatrixContext = createContext<MatrixContextValue>({
  client: null,
  syncState: 'STOPPED',
  rooms: [],
  isReady: false
});

export function MatrixProvider({ 
  children,
  homeserver,
  accessToken,
  userId 
}: {
  children: ReactNode;
  homeserver: string;
  accessToken: string;
  userId: string;
}) {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('STOPPED');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const matrixClient = createClient({
      baseUrl: homeserver,
      accessToken,
      userId,
      // Store for E2E encryption (optional)
      // store: new IndexedDBStore({ indexedDB: window.indexedDB }),
    });

    // Sync state listener
    matrixClient.on('sync', (state: SyncState, prevState: SyncState | null) => {
      setSyncState(state);
      if (state === 'PREPARED') {
        setRooms(matrixClient.getRooms());
        setIsReady(true);
      }
    });

    // Room list updates
    matrixClient.on('Room', (room: Room) => {
      setRooms(matrixClient.getRooms());
    });
    matrixClient.on('Room.myMembership', () => {
      setRooms(matrixClient.getRooms());
    });

    // Start sync
    matrixClient.startClient({ initialSyncLimit: 20 });
    setClient(matrixClient);

    return () => {
      matrixClient.stopClient();
    };
  }, [homeserver, accessToken, userId]);

  return (
    <MatrixContext.Provider value={{ client, syncState, rooms, isReady }}>
      {children}
    </MatrixContext.Provider>
  );
}

export const useMatrixClient = () => useContext(MatrixContext);
```

### 6.4 Core Implementation: Room Messages Hook

```typescript
// hooks/use-room-messages.ts
import { useEffect, useState, useCallback } from 'react';
import { MatrixEvent, Room, Direction } from 'matrix-js-sdk';
import { useMatrixClient } from '@/providers/matrix-provider';

interface MessageData {
  eventId: string;
  content: string;
  sender: string;
  senderName: string;
  senderAvatar: string | null;
  timestamp: number;
  edited: boolean;
  redacted: boolean;
  fileUrl: string | null;
}

export function useRoomMessages(roomId: string) {
  const { client, isReady } = useMatrixClient();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Transform Matrix event to our format
  const transformEvent = useCallback((event: MatrixEvent): MessageData | null => {
    if (event.getType() !== 'm.room.message') return null;
    
    const content = event.getContent();
    const sender = event.getSender()!;
    const room = client?.getRoom(roomId);
    const member = room?.getMember(sender);
    
    return {
      eventId: event.getId()!,
      content: content.body || '',
      sender,
      senderName: member?.name || sender,
      senderAvatar: member?.getAvatarUrl(client!.getHomeserverUrl(), 40, 40, 'crop', false, false) || null,
      timestamp: event.getTs(),
      edited: !!content['m.relates_to']?.rel_type === 'm.replace',
      redacted: event.isRedacted(),
      fileUrl: content.url ? client!.mxcUrlToHttp(content.url) : null
    };
  }, [client, roomId]);

  // Load initial messages
  useEffect(() => {
    if (!client || !isReady) return;
    
    const room = client.getRoom(roomId);
    if (!room) {
      setIsLoading(false);
      return;
    }

    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents()
      .filter(e => e.getType() === 'm.room.message' && !e.isRedacted())
      .map(transformEvent)
      .filter(Boolean) as MessageData[];
    
    setMessages(events);
    setIsLoading(false);
  }, [client, isReady, roomId, transformEvent]);

  // Listen for new messages
  useEffect(() => {
    if (!client) return;

    const handleTimeline = (event: MatrixEvent, room: Room | undefined, toStartOfTimeline: boolean) => {
      if (!room || room.roomId !== roomId) return;
      if (toStartOfTimeline) return;
      if (event.getType() !== 'm.room.message') return;

      const content = event.getContent();
      
      // Handle edit
      if (content['m.relates_to']?.rel_type === 'm.replace') {
        const targetId = content['m.relates_to'].event_id;
        const newContent = content['m.new_content'];
        setMessages(prev => prev.map(msg => 
          msg.eventId === targetId
            ? { ...msg, content: newContent.body, edited: true }
            : msg
        ));
        return;
      }

      // New message
      const msgData = transformEvent(event);
      if (msgData) {
        setMessages(prev => [...prev, msgData]);
      }
    };

    const handleRedaction = (event: MatrixEvent, room: Room | undefined) => {
      if (!room || room.roomId !== roomId) return;
      const redactedId = event.event.redacts;
      setMessages(prev => prev.map(msg =>
        msg.eventId === redactedId
          ? { ...msg, redacted: true, content: 'This message has been deleted.' }
          : msg
      ));
    };

    client.on('Room.timeline', handleTimeline);
    client.on('Room.redaction', handleRedaction);

    return () => {
      client.off('Room.timeline', handleTimeline);
      client.off('Room.redaction', handleRedaction);
    };
  }, [client, roomId, transformEvent]);

  // Send message
  const sendMessage = useCallback(async (content: string, fileUrl?: string) => {
    if (!client) throw new Error('Client not ready');
    
    if (fileUrl) {
      // Upload file first
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const upload = await client.uploadContent(blob);
      
      await client.sendMessage(roomId, {
        msgtype: 'm.file',
        body: content || 'File',
        url: upload.content_uri
      });
    } else {
      await client.sendMessage(roomId, {
        msgtype: 'm.text',
        body: content
      });
    }
  }, [client, roomId]);

  // Edit message
  const editMessage = useCallback(async (eventId: string, newContent: string) => {
    if (!client) throw new Error('Client not ready');
    
    await client.sendMessage(roomId, {
      msgtype: 'm.text',
      body: `* ${newContent}`,
      'm.new_content': {
        msgtype: 'm.text',
        body: newContent
      },
      'm.relates_to': {
        rel_type: 'm.replace',
        event_id: eventId
      }
    });
  }, [client, roomId]);

  // Delete message
  const deleteMessage = useCallback(async (eventId: string) => {
    if (!client) throw new Error('Client not ready');
    await client.redactEvent(roomId, eventId);
  }, [client, roomId]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!client || !hasMore) return;
    
    const room = client.getRoom(roomId);
    if (!room) return;

    try {
      const result = await client.scrollback(room, 30);
      if (result === null || result.chunk.length === 0) {
        setHasMore(false);
      } else {
        const timeline = room.getLiveTimeline();
        const events = timeline.getEvents()
          .filter(e => e.getType() === 'm.room.message' && !e.isRedacted())
          .map(transformEvent)
          .filter(Boolean) as MessageData[];
        setMessages(events);
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    }
  }, [client, roomId, hasMore, transformEvent]);

  return {
    messages,
    isLoading,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore
  };
}
```

### 6.5 Core Implementation: Typing Indicator Hook

```typescript
// hooks/use-typing-indicator.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { MatrixEvent, RoomMember } from 'matrix-js-sdk';
import { useMatrixClient } from '@/providers/matrix-provider';

export function useTypingIndicator(roomId: string) {
  const { client } = useMatrixClient();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for typing events
  useEffect(() => {
    if (!client) return;

    const handleTyping = (event: MatrixEvent, member: RoomMember) => {
      if (member.roomId !== roomId) return;
      
      const room = client.getRoom(roomId);
      if (!room) return;

      // Get list of typing users (excluding self)
      const myUserId = client.getUserId();
      const typing = room.currentState.getStateEvents('m.typing', '')
        ?.getContent()?.user_ids || [];
      
      setTypingUsers(typing.filter((id: string) => id !== myUserId));
    };

    client.on('RoomMember.typing', handleTyping);
    return () => {
      client.off('RoomMember.typing', handleTyping);
    };
  }, [client, roomId]);

  // Send typing indicator (with debounce)
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!client) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing state
    client.sendTyping(roomId, isTyping, isTyping ? 30000 : 0);

    // Auto-stop typing after 30s
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        client.sendTyping(roomId, false, 0);
      }, 30000);
    }
  }, [client, roomId]);

  // Get display names
  const typingDisplayNames = typingUsers.map(userId => {
    const room = client?.getRoom(roomId);
    const member = room?.getMember(userId);
    return member?.name || userId;
  });

  return {
    typingUsers: typingDisplayNames,
    isTyping: typingUsers.length > 0,
    sendTyping
  };
}
```

### 6.6 Core Implementation: Presence Hook

```typescript
// hooks/use-presence.ts
import { useEffect, useState, useCallback } from 'react';
import { User, MatrixEvent } from 'matrix-js-sdk';
import { useMatrixClient } from '@/providers/matrix-provider';

type PresenceState = 'online' | 'offline' | 'unavailable';

interface PresenceData {
  presence: PresenceState;
  lastActiveAgo: number | null;
  statusMessage: string | null;
}

export function usePresence(userId?: string) {
  const { client } = useMatrixClient();
  const [presence, setPresence] = useState<PresenceData>({
    presence: 'offline',
    lastActiveAgo: null,
    statusMessage: null
  });

  // Get presence for a specific user
  useEffect(() => {
    if (!client || !userId) return;

    const user = client.getUser(userId);
    if (user) {
      setPresence({
        presence: user.presence as PresenceState || 'offline',
        lastActiveAgo: user.lastActiveAgo || null,
        statusMessage: user.presenceStatusMsg || null
      });
    }

    const handlePresence = (event: MatrixEvent, user: User) => {
      if (user.userId !== userId) return;
      setPresence({
        presence: user.presence as PresenceState || 'offline',
        lastActiveAgo: user.lastActiveAgo || null,
        statusMessage: user.presenceStatusMsg || null
      });
    };

    client.on('User.presence', handlePresence);
    return () => {
      client.off('User.presence', handlePresence);
    };
  }, [client, userId]);

  // Set my presence
  const setMyPresence = useCallback(async (
    state: PresenceState, 
    statusMsg?: string
  ) => {
    if (!client) return;
    await client.setPresence({
      presence: state,
      status_msg: statusMsg
    });
  }, [client]);

  return {
    presence,
    setMyPresence
  };
}
```

---

## 7. Challenges and Solutions

### 7.1 Challenge: Initial Sync Performance

**Problem:** First sync can be slow for users in many rooms with lots of history.

**Solution:**
```typescript
// Use lazy loading and filters
const client = createClient({
  baseUrl: homeserver,
  accessToken,
  userId,
  timelineSupport: true,
});

// Limit initial sync
await client.startClient({
  initialSyncLimit: 10,  // Only 10 events per room initially
  lazyLoadMembers: true, // Don't load all members upfront
});

// Filter to only sync relevant events
const filter = {
  room: {
    timeline: {
      limit: 20,
      types: ['m.room.message', 'm.room.encrypted']
    },
    state: {
      lazy_load_members: true
    }
  }
};
await client.startClient({ filter });
```

### 7.2 Challenge: Offline Support / Sync Recovery

**Problem:** Socket.io had polling fallback. What happens when Matrix sync fails?

**Solution:** Matrix SDK handles this automatically, but we should show appropriate UI:

```typescript
client.on('sync', (state, prevState, data) => {
  switch (state) {
    case 'RECONNECTING':
      showToast('Reconnecting to server...');
      break;
    case 'ERROR':
      showToast('Connection error. Retrying...', { type: 'error' });
      // SDK will retry automatically
      break;
    case 'CATCHUP':
      showToast('Syncing missed messages...');
      break;
    case 'PREPARED':
    case 'SYNCING':
      hideToast();
      break;
  }
});

// For truly offline scenarios, use IndexedDB store
import { IndexedDBStore } from 'matrix-js-sdk';

const store = new IndexedDBStore({
  indexedDB: window.indexedDB,
  dbName: 'haos-matrix-store'
});
await store.startup();

const client = createClient({
  baseUrl: homeserver,
  accessToken,
  userId,
  store
});
```

### 7.3 Challenge: Message Ordering

**Problem:** Socket.io events arrive in order. Matrix events might arrive out of order during catchup.

**Solution:** Use event timestamp for ordering:

```typescript
// Always sort messages by timestamp
const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);

// Or use the SDK's timeline ordering
const room = client.getRoom(roomId);
const events = room.getLiveTimeline().getEvents();
// Events are already in correct order
```

### 7.4 Challenge: Rate Limiting Typing Indicators

**Problem:** Sending typing indicator on every keystroke is wasteful.

**Solution:** Debounce typing indicator:

```typescript
import { useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export function useTypingIndicator(roomId: string) {
  const { client } = useMatrixClient();
  const lastTypingRef = useRef<number>(0);
  
  // Debounced typing sender
  const debouncedSendTyping = useCallback(
    debounce((isTyping: boolean) => {
      client?.sendTyping(roomId, isTyping, isTyping ? 30000 : 0);
    }, 1000, { leading: true, trailing: true }),
    [client, roomId]
  );

  // Call on input change
  const onInputChange = useCallback(() => {
    debouncedSendTyping(true);
    
    // Reset typing after 5s of no activity
    clearTimeout(lastTypingRef.current);
    lastTypingRef.current = window.setTimeout(() => {
      debouncedSendTyping(false);
    }, 5000);
  }, [debouncedSendTyping]);

  return { onInputChange };
}
```

### 7.5 Challenge: Event Deduplication

**Problem:** During sync catchup, we might receive events we already have.

**Solution:** Use event IDs for deduplication:

```typescript
const [messages, setMessages] = useState<Map<string, MessageData>>(new Map());

// When adding new message
const addMessage = (event: MatrixEvent) => {
  const eventId = event.getId()!;
  setMessages(prev => {
    if (prev.has(eventId)) return prev;
    const newMap = new Map(prev);
    newMap.set(eventId, transformEvent(event)!);
    return newMap;
  });
};

// Convert to array for rendering
const messageList = Array.from(messages.values())
  .sort((a, b) => a.timestamp - b.timestamp);
```

### 7.6 Challenge: Large Media Files

**Problem:** Discord clone used UploadThing. Matrix has its own media repo.

**Solution:** Use Matrix content repository:

```typescript
// Upload file to Matrix
async function uploadFile(file: File): Promise<string> {
  const client = getMatrixClient();
  const response = await client.uploadContent(file, {
    type: file.type,
    name: file.name,
    progressHandler: (progress) => {
      console.log(`Upload: ${Math.round((progress.loaded / progress.total) * 100)}%`);
    }
  });
  return response.content_uri; // mxc:// URL
}

// Convert mxc:// to HTTP for display
function getHttpUrl(mxcUrl: string): string {
  const client = getMatrixClient();
  return client.mxcUrlToHttp(mxcUrl, 800, 600, 'scale', true)!;
}

// Download file
function getDownloadUrl(mxcUrl: string): string {
  const client = getMatrixClient();
  return client.mxcUrlToHttp(mxcUrl)!;
}
```

### 7.7 Challenge: Permissions / Power Levels

**Problem:** Discord clone checks `member.role` for permissions. Matrix uses power levels.

**Solution:** Map power levels to roles:

```typescript
const POWER_LEVEL_ROLES = {
  100: 'ADMIN',
  50: 'MODERATOR',
  0: 'GUEST'
} as const;

function getUserRole(room: Room, userId: string): string {
  const powerLevels = room.currentState.getStateEvents('m.room.power_levels', '');
  const content = powerLevels?.getContent() || {};
  const userLevel = content.users?.[userId] ?? content.users_default ?? 0;
  
  if (userLevel >= 100) return 'ADMIN';
  if (userLevel >= 50) return 'MODERATOR';
  return 'GUEST';
}

function canUserDoAction(room: Room, userId: string, action: string): boolean {
  const powerLevels = room.currentState.getStateEvents('m.room.power_levels', '');
  const content = powerLevels?.getContent() || {};
  const userLevel = content.users?.[userId] ?? content.users_default ?? 0;
  const requiredLevel = content.events?.[action] ?? content.events_default ?? 0;
  
  return userLevel >= requiredLevel;
}
```

---

## 8. Code Migration Guide

### 8.1 Component Migration Checklist

| Original Component | Migration Action |
|-------------------|------------------|
| `socket-provider.tsx` | Replace with `matrix-provider.tsx` |
| `socket-indicator.tsx` | Update to read Matrix sync state |
| `use-chat-socket.ts` | Replace with `use-room-messages.ts` |
| `use-chat-query.ts` | Merge into `use-room-messages.ts` (no separate polling needed) |
| `pages/api/socket/*` | **DELETE** (messages go directly to Matrix) |
| `chat-input.tsx` | Update to use `sendMessage` from hook |
| `chat-messages.tsx` | Update to use `useRoomMessages` hook |
| `chat-item.tsx` | Update event structure access |

### 8.2 API Route Migration

| Original Route | Matrix Action |
|----------------|---------------|
| `POST /api/socket/messages` | `client.sendMessage(roomId, {...})` |
| `PATCH /api/socket/messages/[id]` | `client.sendMessage(roomId, { 'm.relates_to': {...} })` |
| `DELETE /api/socket/messages/[id]` | `client.redactEvent(roomId, eventId)` |
| `POST /api/socket/direct-messages` | Same as above, DM room |
| `PATCH /api/socket/direct-messages/[id]` | Same as above |
| `DELETE /api/socket/direct-messages/[id]` | Same as above |

### 8.3 Type Migration

```typescript
// Before: Discord clone types
interface Message {
  id: string;
  content: string;
  fileUrl: string | null;
  memberId: string;
  channelId: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  member: Member & { profile: Profile };
}

// After: Matrix-based types
interface MatrixMessage {
  eventId: string;
  content: string;
  sender: string;                    // @user:homeserver
  senderName: string;
  senderAvatar: string | null;
  timestamp: number;
  edited: boolean;
  redacted: boolean;
  fileUrl: string | null;            // mxc:// converted to http
  replyTo?: string;                  // Reply thread support
  reactions?: Map<string, string[]>; // emoji -> userIds
}

// Conversion function
function prismaToMatrix(prismaMsg: Message): MatrixMessage {
  return {
    eventId: prismaMsg.id,
    content: prismaMsg.deleted ? 'This message has been deleted.' : prismaMsg.content,
    sender: `@${prismaMsg.member.profile.userId}:homeserver`,
    senderName: prismaMsg.member.profile.name,
    senderAvatar: prismaMsg.member.profile.imageUrl,
    timestamp: prismaMsg.createdAt.getTime(),
    edited: prismaMsg.createdAt.getTime() !== prismaMsg.updatedAt.getTime(),
    redacted: prismaMsg.deleted,
    fileUrl: prismaMsg.fileUrl
  };
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// Test message transformation
describe('transformEvent', () => {
  it('transforms m.room.message to MessageData', () => {
    const mockEvent = createMockEvent({
      type: 'm.room.message',
      content: { msgtype: 'm.text', body: 'Hello!' },
      sender: '@user:example.org',
      timestamp: Date.now()
    });
    
    const result = transformEvent(mockEvent);
    
    expect(result).toEqual({
      eventId: expect.any(String),
      content: 'Hello!',
      sender: '@user:example.org',
      timestamp: expect.any(Number),
      edited: false,
      redacted: false,
      fileUrl: null
    });
  });
  
  it('handles edit events correctly', () => {
    const mockEvent = createMockEvent({
      type: 'm.room.message',
      content: {
        msgtype: 'm.text',
        body: '* Edited message',
        'm.new_content': { msgtype: 'm.text', body: 'Edited message' },
        'm.relates_to': { rel_type: 'm.replace', event_id: '$original' }
      }
    });
    
    const result = transformEvent(mockEvent);
    expect(result?.edited).toBe(true);
  });
});
```

### 9.2 Integration Tests

```typescript
// Test real-time message flow
describe('useRoomMessages', () => {
  it('receives new messages in real-time', async () => {
    const { result } = renderHook(() => useRoomMessages('!room:example.org'));
    
    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Simulate incoming message
    act(() => {
      mockMatrixClient.emit('Room.timeline', createMockEvent({
        type: 'm.room.message',
        content: { msgtype: 'm.text', body: 'New message!' }
      }), mockRoom, false);
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('New message!');
  });
});
```

### 9.3 E2E Tests

```typescript
// Playwright test for message sending
test('sends and receives message', async ({ page, context }) => {
  // Create second browser context for recipient
  const page2 = await context.newPage();
  
  // Both users join the same room
  await page.goto('/channels/test-channel');
  await page2.goto('/channels/test-channel');
  
  // User 1 sends message
  await page.fill('[data-testid="message-input"]', 'Hello from user 1!');
  await page.press('[data-testid="message-input"]', 'Enter');
  
  // User 2 should see it
  await expect(page2.locator('text=Hello from user 1!')).toBeVisible();
  
  // Verify typing indicator
  await page.fill('[data-testid="message-input"]', 'typing...');
  await expect(page2.locator('[data-testid="typing-indicator"]')).toBeVisible();
});
```

---

## 10. Timeline and Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Matrix client singleton
- [ ] Create `MatrixProvider` context
- [ ] Implement `useMatrixClient` hook
- [ ] Create connection indicator component
- [ ] Write unit tests for client setup

### Phase 2: Message Migration (Week 2-3)
- [ ] Implement `useRoomMessages` hook
- [ ] Update `ChatMessages` component
- [ ] Update `ChatInput` component  
- [ ] Update `ChatItem` component
- [ ] Remove `/api/socket/messages/*` routes
- [ ] Write integration tests

### Phase 3: Enhanced Features (Week 3-4)
- [ ] Implement `useTypingIndicator` hook
- [ ] Add typing indicator UI
- [ ] Implement `usePresence` hook
- [ ] Add presence dots to user avatars
- [ ] Implement `useReadReceipts` hook
- [ ] Add read receipt UI

### Phase 4: Cleanup & Polish (Week 4)
- [ ] Remove all Socket.io code
- [ ] Remove socket-related dependencies
- [ ] Update environment variables
- [ ] Performance optimization
- [ ] E2E testing
- [ ] Documentation update

### Phase 5: Advanced Features (Future)
- [ ] End-to-end encryption (Megolm)
- [ ] Message reactions
- [ ] Message threads
- [ ] Push notifications

---

## Summary

The migration from Socket.io to Matrix sync is a significant architectural change that provides:

1. **Simpler backend** - No custom WebSocket server needed
2. **More features** - Typing, presence, receipts, reactions built-in
3. **Better scalability** - Homeserver handles federation and scaling
4. **Future-proof** - E2E encryption, cross-server communication

The key insight is that Matrix's `/sync` endpoint replaces the entire Socket.io infrastructure. Instead of:

```
Client → Socket.io → Server → Database → Socket.io → Client
```

We have:

```
Client → Matrix Homeserver → Client
```

The homeserver handles all the real-time event distribution, persistence, and sync recovery automatically.
