# HAOS v2 Backend Mapping: Prisma → Matrix

> **Audit Task:** `audit-02-backend-mapping`  
> **Date:** 2025-06-29  
> **Source:** `/home/ubuntu/repos/discord-clone-reference`

This document maps every Prisma model and API route from the Discord clone reference to their Matrix SDK equivalents for HAOS v2.

---

## Table of Contents

1. [Prisma Models → Matrix Equivalents](#1-prisma-models--matrix-equivalents)
2. [API Routes → Matrix SDK Methods](#2-api-routes--matrix-sdk-methods)
3. [Socket.io Real-time → Matrix Sync](#3-socketio-real-time--matrix-sync)
4. [Complex Mappings](#4-complex-mappings)
5. [Implementation Notes](#5-implementation-notes)

---

## 1. Prisma Models → Matrix Equivalents

### Summary Table

| Prisma Model | Matrix Equivalent | State Event Type | Notes |
|--------------|-------------------|------------------|-------|
| **Profile** | Matrix User | N/A (user identity) | `@userId:homeserver` |
| **Server** | Matrix Space | `m.space.child` / `m.space.parent` | Room with `type: "m.space"` |
| **Channel** | Matrix Room | `m.room.*` state events | Child of space |
| **Member** | Room Membership | `m.room.member` | Per-room power levels |
| **MemberRole** | Power Levels + Custom State | `m.room.power_levels` + `io.haos.role` | See [Role Mapping](#role-mapping) |
| **Message** | Room Event | `m.room.message` | Timeline event |
| **Conversation** | Direct Room | `m.direct` account data | `is_direct: true` flag |
| **DirectMessage** | Room Event | `m.room.message` | In direct room |
| **ChannelType** | Room Purpose | `io.haos.channel_type` | Custom state event |

---

### Detailed Model Mappings

#### Profile → Matrix User

```prisma
model Profile {
  id       String @id @default(uuid())
  userId   String @unique    // Clerk/Auth user ID
  name     String
  imageUrl String
  email    String
}
```

**Matrix Equivalent:**
- User identity: `@{userId}:{homeserver}`
- Profile data stored in account data or displayname/avatar_url

```typescript
// Matrix SDK
const user = await client.getUser(userId);
await client.setDisplayName("New Name");
await client.setAvatarUrl(mxcUrl);

// For extended profile (email, etc.) - use account data
await client.setAccountData('io.haos.profile', {
  email: 'user@example.com',
  // clerkId: original auth provider ID
});
```

**Key Difference:** Matrix doesn't store email in profile; use account data for extended fields.

---

#### Server → Matrix Space

```prisma
model Server {
  id         String @id
  name       String
  imageUrl   String
  inviteCode String @unique
  profileId  String  // Owner
}
```

**Matrix Equivalent:**
- Matrix Space (special room with `type: "m.space"`)
- Server metadata in state events

```typescript
// Create server (space)
const spaceRoom = await client.createRoom({
  name: serverName,
  creation_content: {
    type: 'm.space'
  },
  initial_state: [
    {
      type: 'm.room.avatar',
      content: { url: mxcAvatarUrl }
    },
    {
      type: 'io.haos.server',
      content: {
        inviteCode: generatedCode,
        ownerId: creatorUserId
      }
    }
  ],
  power_level_content_override: {
    users: { [creatorUserId]: 100 }
  }
});

// Add default "general" channel to space
const generalRoom = await client.createRoom({ ... });
await client.sendStateEvent(spaceRoom.roomId, 'm.space.child', {
  via: [homeserver]
}, generalRoom.roomId);
```

**State Events:**
| Event Type | Purpose |
|------------|---------|
| `m.room.name` | Server name |
| `m.room.avatar` | Server icon |
| `io.haos.server` | Custom: invite code, owner |
| `m.space.child` | Links to channel rooms |

---

#### Channel → Matrix Room

```prisma
model Channel {
  id        String
  name      String
  type      ChannelType  // TEXT, AUDIO, VIDEO
  serverId  String
  profileId String  // Creator
}
```

**Matrix Equivalent:**
- Regular Matrix room, child of the space
- Channel type in custom state event

```typescript
// Create channel
const channelRoom = await client.createRoom({
  name: channelName,
  initial_state: [
    {
      type: 'm.space.parent',
      state_key: spaceRoomId,
      content: { via: [homeserver] }
    },
    {
      type: 'io.haos.channel',
      content: {
        type: 'TEXT', // or 'AUDIO', 'VIDEO'
        creatorId: userId
      }
    }
  ]
});

// Add to space
await client.sendStateEvent(spaceRoomId, 'm.space.child', {
  via: [homeserver]
}, channelRoom.roomId);
```

**ChannelType Mapping:**
| Discord Type | HAOS Handling |
|--------------|---------------|
| `TEXT` | Standard Matrix room |
| `AUDIO` | Room + `io.haos.channel.type: 'AUDIO'` + LiveKit integration |
| `VIDEO` | Room + `io.haos.channel.type: 'VIDEO'` + LiveKit integration |

---

#### Member → Room Membership

```prisma
model Member {
  id        String
  role      MemberRole  // ADMIN, MODERATOR, GUEST
  profileId String
  serverId  String
}
```

**Matrix Equivalent:**
- `m.room.member` state event (join state)
- Power levels for permissions
- Custom role state event for role metadata

```typescript
// User joins a space (becomes member)
await client.joinRoom(spaceRoomId);

// Set role via power levels
const powerLevels = await room.getStateEvent('m.room.power_levels');
powerLevels.users[userId] = roleToLevel(role);
await client.sendStateEvent(roomId, 'm.room.power_levels', powerLevels);

// Store role name (for display)
await client.sendStateEvent(roomId, 'io.haos.member_role', {
  role: 'MODERATOR'
}, userId);
```

<a id="role-mapping"></a>
**Role Mapping:**
| MemberRole | Power Level | Capabilities |
|------------|-------------|--------------|
| `ADMIN` | 100 | Full control, delete server |
| `MODERATOR` | 50 | Manage channels, kick/ban, delete messages |
| `GUEST` | 0 | Send messages, basic access |

---

#### Message → Matrix Event

```prisma
model Message {
  id        String
  content   String
  fileUrl   String?
  memberId  String
  channelId String
  deleted   Boolean
}
```

**Matrix Equivalent:**
- `m.room.message` event in room timeline
- File attachments via `m.file`, `m.image`, etc.
- Soft delete via redaction or edit

```typescript
// Send text message
await room.sendMessage({
  msgtype: 'm.text',
  body: content
});

// Send with file attachment
await room.sendMessage({
  msgtype: 'm.file',  // or m.image, m.video
  body: filename,
  url: mxcUrl,
  info: { mimetype, size }
});

// "Delete" message (soft delete → redaction)
await client.redactEvent(roomId, eventId, 'Message deleted');

// Edit message
await room.sendMessage({
  msgtype: 'm.text',
  body: '* new content',
  'm.new_content': {
    msgtype: 'm.text',
    body: 'new content'
  },
  'm.relates_to': {
    rel_type: 'm.replace',
    event_id: originalEventId
  }
});
```

**Key Differences:**
1. Matrix uses event IDs, not UUIDs
2. Deleted messages are redacted (content removed, event shell remains)
3. Files uploaded to Matrix content repo (mxc:// URLs)

---

#### Conversation → Direct Room

```prisma
model Conversation {
  id          String
  memberOneId String
  memberTwoId String
}
```

**Matrix Equivalent:**
- Direct room with `is_direct: true`
- Tracked in `m.direct` account data

```typescript
// Create DM room
const dmRoom = await client.createRoom({
  is_direct: true,
  invite: [otherUserId],
  preset: 'trusted_private_chat'
});

// Update m.direct account data
const directRooms = await client.getAccountData('m.direct') || {};
directRooms[otherUserId] = [...(directRooms[otherUserId] || []), dmRoom.roomId];
await client.setAccountData('m.direct', directRooms);

// Find existing DM
const existingDm = directRooms[otherUserId]?.[0];
```

**Key Difference:** Matrix allows multiple DM rooms with same user; typically use first one.

---

#### DirectMessage → Room Event (in DM)

Same as `Message`, just sent to a direct room instead of a channel room.

---

## 2. API Routes → Matrix SDK Methods

### Server Routes

| API Route | Method | Purpose | Matrix SDK Equivalent |
|-----------|--------|---------|----------------------|
| `POST /api/servers` | POST | Create server | `client.createRoom({ type: 'm.space' })` + create general channel |
| `GET /api/servers/[id]` | GET | Get server | `client.getRoom(spaceId)` + state events |
| `PATCH /api/servers/[id]` | PATCH | Update server | `client.sendStateEvent('m.room.name')` / `m.room.avatar` |
| `DELETE /api/servers/[id]` | DELETE | Delete server | `client.leave()` all channels + space, or send `io.haos.server_deleted` |
| `PATCH /api/servers/[id]/invite-code` | PATCH | Regenerate invite | `client.sendStateEvent('io.haos.server', { inviteCode })` |
| `PATCH /api/servers/[id]/leave` | PATCH | Leave server | `client.leave(spaceId)` + all child rooms |

#### Create Server Implementation

```typescript
// POST /api/servers equivalent
async function createServer(name: string, imageUrl: string, userId: string) {
  // 1. Create space
  const space = await client.createRoom({
    name,
    creation_content: { type: 'm.space' },
    initial_state: [
      { type: 'm.room.avatar', content: { url: imageUrl } },
      { type: 'io.haos.server', content: { 
        inviteCode: generateInviteCode(),
        ownerId: userId 
      }}
    ],
    power_level_content_override: {
      users: { [userId]: 100 }  // Creator is ADMIN
    }
  });

  // 2. Create general channel
  const general = await client.createRoom({
    name: 'general',
    initial_state: [
      { type: 'm.space.parent', state_key: space.roomId, content: { via: [homeserver] } },
      { type: 'io.haos.channel', content: { type: 'TEXT', creatorId: userId } }
    ]
  });

  // 3. Add channel to space
  await client.sendStateEvent(space.roomId, 'm.space.child', 
    { via: [homeserver] }, 
    general.roomId
  );

  return { spaceId: space.roomId, generalChannelId: general.roomId };
}
```

---

### Channel Routes

| API Route | Method | Purpose | Matrix SDK Equivalent |
|-----------|--------|---------|----------------------|
| `POST /api/channels` | POST | Create channel | `client.createRoom()` + add `m.space.child` |
| `PATCH /api/channels/[id]` | PATCH | Update channel | `client.sendStateEvent('m.room.name')` |
| `DELETE /api/channels/[id]` | DELETE | Delete channel | Remove from space + leave all members |

#### Create Channel Implementation

```typescript
// POST /api/channels equivalent
async function createChannel(
  serverId: string, 
  name: string, 
  type: 'TEXT' | 'AUDIO' | 'VIDEO',
  userId: string
) {
  // Verify user is ADMIN or MODERATOR
  const powerLevels = await client.getStateEvent(serverId, 'm.room.power_levels');
  const userLevel = powerLevels.users[userId] || powerLevels.users_default || 0;
  if (userLevel < 50) throw new Error('Unauthorized');

  // Create channel room
  const channel = await client.createRoom({
    name,
    initial_state: [
      { type: 'm.space.parent', state_key: serverId, content: { via: [homeserver] } },
      { type: 'io.haos.channel', content: { type, creatorId: userId } }
    ]
  });

  // Add to space
  await client.sendStateEvent(serverId, 'm.space.child', 
    { via: [homeserver] }, 
    channel.roomId
  );

  return channel.roomId;
}
```

---

### Member Routes

| API Route | Method | Purpose | Matrix SDK Equivalent |
|-----------|--------|---------|----------------------|
| `DELETE /api/members/[id]` | DELETE | Kick member | `client.kick(roomId, userId)` |
| `PATCH /api/members/[id]` | PATCH | Change role | Update `m.room.power_levels` |

#### Change Role Implementation

```typescript
// PATCH /api/members/[memberId] equivalent
async function changeRole(serverId: string, targetUserId: string, newRole: MemberRole) {
  const powerLevels = await client.getStateEvent(serverId, 'm.room.power_levels');
  
  const levelMap = { ADMIN: 100, MODERATOR: 50, GUEST: 0 };
  powerLevels.users[targetUserId] = levelMap[newRole];
  
  await client.sendStateEvent(serverId, 'm.room.power_levels', powerLevels);
  
  // Also update custom role state for UI
  await client.sendStateEvent(serverId, 'io.haos.member_role', 
    { role: newRole }, 
    targetUserId
  );
}
```

---

### Message Routes

| API Route | Method | Purpose | Matrix SDK Equivalent |
|-----------|--------|---------|----------------------|
| `GET /api/messages` | GET | Paginated messages | `client.createMessagesRequest()` / `room.timeline` |
| `POST /api/socket/messages` | POST | Send message | `room.sendMessage()` |
| `PATCH /api/socket/messages/[id]` | PATCH | Edit message | `room.sendMessage()` with `m.replace` relation |
| `DELETE /api/socket/messages/[id]` | DELETE | Delete message | `client.redactEvent()` |

#### Get Messages (Pagination) Implementation

```typescript
// GET /api/messages equivalent
async function getMessages(channelId: string, cursor?: string, limit = 10) {
  const room = client.getRoom(channelId);
  
  if (cursor) {
    // Paginate backwards from cursor
    const result = await client.createMessagesRequest(
      channelId,
      cursor,  // from token
      limit,
      'b'  // backwards
    );
    return {
      items: result.chunk.filter(e => e.type === 'm.room.message'),
      nextCursor: result.end
    };
  } else {
    // Get latest messages
    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents()
      .filter(e => e.getType() === 'm.room.message')
      .slice(-limit);
    return {
      items: events,
      nextCursor: timeline.getPaginationToken('b')
    };
  }
}
```

---

### Direct Message Routes

| API Route | Method | Purpose | Matrix SDK Equivalent |
|-----------|--------|---------|----------------------|
| `GET /api/direct-messages` | GET | Get DM history | Same as messages, different room |
| `POST /api/socket/direct-messages` | POST | Send DM | `room.sendMessage()` in DM room |
| `PATCH /api/socket/direct-messages/[id]` | PATCH | Edit DM | Same as message edit |
| `DELETE /api/socket/direct-messages/[id]` | DELETE | Delete DM | `client.redactEvent()` |

#### Get/Create Conversation Implementation

```typescript
// getOrCreateConversation equivalent
async function getOrCreateDM(otherUserId: string): Promise<string> {
  // Check existing DMs
  const directRooms = await client.getAccountData('m.direct') || {};
  const existingRoomId = directRooms[otherUserId]?.[0];
  
  if (existingRoomId && client.getRoom(existingRoomId)) {
    return existingRoomId;
  }
  
  // Create new DM
  const dmRoom = await client.createRoom({
    is_direct: true,
    invite: [otherUserId],
    preset: 'trusted_private_chat'
  });
  
  // Update m.direct
  directRooms[otherUserId] = [dmRoom.roomId];
  await client.setAccountData('m.direct', directRooms);
  
  return dmRoom.roomId;
}
```

---

### Voice/Video Routes (LiveKit)

| API Route | Method | Purpose | Matrix SDK Equivalent |
|-----------|--------|---------|----------------------|
| `GET /api/livekit` | GET | Get LiveKit token | **Keep as-is** (LiveKit separate from Matrix) |

**Note:** Voice/video uses LiveKit, which is independent of Matrix. The channel's `io.haos.channel.type` indicates it's a voice/video channel, but actual WebRTC is handled by LiveKit.

---

### File Upload Routes

| API Route | Method | Purpose | Matrix SDK Equivalent |
|-----------|--------|---------|----------------------|
| `POST /api/uploadthing` | POST | Upload file | `client.uploadContent()` → returns mxc:// URL |

```typescript
// Upload file to Matrix
async function uploadFile(file: File): Promise<string> {
  const mxcUrl = await client.uploadContent(file, {
    name: file.name,
    type: file.type
  });
  return mxcUrl;  // mxc://homeserver/mediaId
}

// Get HTTP URL from mxc
function getMxcHttpUrl(mxcUrl: string): string {
  return client.mxcUrlToHttp(mxcUrl);
}
```

---

## 3. Socket.io Real-time → Matrix Sync

The Discord clone uses Socket.io for real-time events. Matrix has built-in sync.

### Event Mapping

| Socket.io Event | Matrix Equivalent |
|-----------------|-------------------|
| `chat:${channelId}:messages` | `m.room.message` in room sync |
| `chat:${channelId}:messages:update` | `m.room.message` with `m.replace` relation |
| Connection status | Matrix sync state |

### Implementation

```typescript
// Matrix SDK handles real-time natively
client.on('Room.timeline', (event, room) => {
  if (event.getType() === 'm.room.message') {
    // New message or edit
    const isEdit = event.getContent()['m.relates_to']?.rel_type === 'm.replace';
    
    if (isEdit) {
      // Handle message update
      const originalId = event.getContent()['m.relates_to'].event_id;
      onMessageUpdate(room.roomId, originalId, event);
    } else {
      // Handle new message
      onNewMessage(room.roomId, event);
    }
  }
});

client.on('Room.redaction', (event, room) => {
  // Handle message deletion
  onMessageDelete(room.roomId, event.event.redacts);
});

// React integration
function useRoomMessages(roomId: string) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const room = client.getRoom(roomId);
    if (!room) return;
    
    // Initial load
    setMessages(room.getLiveTimeline().getEvents());
    
    // Live updates
    const handler = (event, eventRoom) => {
      if (eventRoom.roomId === roomId) {
        setMessages(room.getLiveTimeline().getEvents());
      }
    };
    
    client.on('Room.timeline', handler);
    return () => client.off('Room.timeline', handler);
  }, [roomId]);
  
  return messages;
}
```

---

## 4. Complex Mappings

### 4.1 Invite Codes

**Discord Clone:** UUID-based invite codes stored in database.

**Matrix Options:**

1. **Room Aliases** (Public servers)
   ```typescript
   // Set alias
   await client.createAlias('#my-server:homeserver', spaceRoomId);
   // Join via alias
   await client.joinRoom('#my-server:homeserver');
   ```

2. **Custom Invite Codes** (Private servers)
   ```typescript
   // Store in state
   await client.sendStateEvent(spaceId, 'io.haos.server', {
     inviteCode: 'abc123',
     ownerId: userId
   });
   
   // Backend lookup service
   app.get('/invite/:code', async (req, res) => {
     // Lookup code → roomId mapping in Redis/DB
     const roomId = await lookupInviteCode(req.params.code);
     res.json({ roomId });
   });
   ```

3. **Matrix Invite Links** (Room invites)
   ```typescript
   // Generate Matrix invite
   const invite = await client.invite(roomId, userToInvite);
   ```

**Recommendation:** Use a hybrid approach:
- Store invite codes in `io.haos.server` state event
- Maintain a Redis/DB lookup table for code → roomId
- On join, validate code matches room's stored code

---

### 4.2 Permissions (Role-Based)

**Discord Clone:** Simple ADMIN/MODERATOR/GUEST roles.

**Matrix:** Power levels (0-100) with granular event permissions.

```typescript
// Power level template for HAOS
const powerLevelTemplate = {
  users_default: 0,  // GUEST
  events: {
    'm.room.message': 0,        // Anyone can send
    'm.room.name': 50,          // Moderator+ can rename
    'm.room.avatar': 50,        // Moderator+ can change icon
    'm.room.power_levels': 100, // Admin only
    'm.space.child': 50,        // Moderator+ can manage channels
    'io.haos.channel': 50,      // Moderator+ can configure channel
  },
  kick: 50,       // Moderator+
  ban: 50,        // Moderator+
  redact: 50,     // Moderator+ can delete any message
  invite: 0       // Anyone can invite
};

// Role to power level
const ROLE_LEVELS = {
  ADMIN: 100,
  MODERATOR: 50,
  GUEST: 0
};
```

---

### 4.3 Reactions

**Discord Clone:** Not implemented in reference.

**Matrix:**

```typescript
// Send reaction
await client.sendEvent(roomId, 'm.reaction', {
  'm.relates_to': {
    rel_type: 'm.annotation',
    event_id: messageEventId,
    key: '👍'  // emoji
  }
});

// Get reactions for event
const relations = await client.relations(roomId, eventId, 'm.annotation');
```

---

### 4.4 Threads

**Discord Clone:** Not implemented in reference.

**Matrix:**

```typescript
// Reply in thread
await room.sendMessage({
  msgtype: 'm.text',
  body: 'Thread reply',
  'm.relates_to': {
    rel_type: 'm.thread',
    event_id: threadRootEventId,
    is_falling_back: true,
    'm.in_reply_to': {
      event_id: threadRootEventId
    }
  }
});
```

---

### 4.5 Typing Indicators

**Discord Clone:** Not shown in reference.

**Matrix:**

```typescript
// Send typing notification
await client.sendTyping(roomId, true, 30000); // typing for 30s

// Stop typing
await client.sendTyping(roomId, false);

// Listen for typing
client.on('RoomMember.typing', (event, member) => {
  const typingMembers = room.getTypingMembers();
});
```

---

### 4.6 Read Receipts

**Discord Clone:** Not implemented.

**Matrix:**

```typescript
// Mark as read
await client.sendReadReceipt(latestEvent);

// Get read receipts
const receipts = room.getReceiptsForEvent(event);
```

---

## 5. Implementation Notes

### 5.1 What Matrix Gives Us for Free

| Feature | Matrix Built-in |
|---------|----------------|
| Real-time sync | ✅ Native |
| End-to-end encryption | ✅ Megolm/Olm |
| Message history | ✅ Federation |
| Typing indicators | ✅ m.typing |
| Read receipts | ✅ m.receipt |
| Reactions | ✅ m.reaction |
| Threads | ✅ m.thread |
| File upload | ✅ Content repository |
| Presence | ✅ m.presence |
| Push notifications | ✅ Push rules |

### 5.2 What We Need to Build

| Feature | Implementation |
|---------|----------------|
| Invite codes | Custom state event + lookup service |
| Server icons/banners | Standard avatar + custom state |
| Channel types (voice/video) | Custom state + LiveKit integration |
| Role display | Custom state events |
| Server discovery | Custom directory service |

### 5.3 Database Changes

**From:** MySQL/Prisma centralized database

**To:** 
- Matrix homeserver (event storage)
- Optional: Redis for invite code lookup, caching
- Optional: PostgreSQL for HAOS-specific metadata not in Matrix

### 5.4 Custom State Events Summary

| Event Type | Purpose |
|------------|---------|
| `io.haos.server` | Server metadata (inviteCode, ownerId) |
| `io.haos.channel` | Channel type, creator |
| `io.haos.member_role` | Role name for display |

### 5.5 Migration Strategy

1. **Phase 1:** Build Matrix SDK service layer matching current API signatures
2. **Phase 2:** Replace Prisma calls with Matrix SDK calls behind same interface
3. **Phase 3:** Remove Socket.io, use Matrix sync directly
4. **Phase 4:** Remove Prisma/MySQL entirely

---

## 6. Key Complexity Areas

### High Complexity
1. **Invite codes** - Need external lookup service
2. **Power levels cascading** - Must update all rooms in space when role changes
3. **Message pagination** - Matrix tokens vs Prisma cursor (different patterns)

### Medium Complexity
1. **File uploads** - UploadThing → Matrix content repo
2. **Channel ordering** - Matrix doesn't preserve order in spaces (need custom state)
3. **Member list** - Aggregate from room state, not DB query

### Low Complexity
1. **Basic CRUD** - Direct mapping to Matrix SDK
2. **Real-time sync** - Matrix handles natively
3. **DMs** - Direct rooms work well

---

## 7. Quick Reference: SDK Methods

```typescript
// Spaces
client.createRoom({ creation_content: { type: 'm.space' } })
client.sendStateEvent(spaceId, 'm.space.child', {}, childRoomId)

// Rooms
client.createRoom({ name, preset, initial_state })
client.getRoom(roomId)
client.joinRoom(roomIdOrAlias)
client.leave(roomId)

// State
client.getStateEvent(roomId, eventType, stateKey?)
client.sendStateEvent(roomId, eventType, content, stateKey?)

// Messages
room.sendMessage({ msgtype, body, ... })
client.redactEvent(roomId, eventId)
client.createMessagesRequest(roomId, from, limit, dir)

// Members
client.invite(roomId, userId)
client.kick(roomId, userId, reason?)
client.ban(roomId, userId, reason?)

// Files
client.uploadContent(file)
client.mxcUrlToHttp(mxcUrl)

// Sync
client.startClient()
client.on('Room.timeline', handler)
client.on('Room.redaction', handler)
```

---

**End of Backend Mapping Document**
