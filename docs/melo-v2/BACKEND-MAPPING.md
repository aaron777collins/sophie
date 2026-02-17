# MELO v2 Backend Mapping: Prisma → Matrix

> **Audit Task:** `audit-02-backend-mapping`  
> **Date:** 2025-06-29 (Updated: 2025-06-29)  
> **Source:** `/home/ubuntu/repos/discord-clone-reference`

This document maps every Prisma model and API route from the Discord clone reference to their Matrix SDK equivalents for MELO v2.

---

## Table of Contents

1. [Entity Relationship Overview](#0-entity-relationship-overview)
2. [Prisma Models → Matrix Equivalents](#1-prisma-models--matrix-equivalents)
3. [API Routes → Matrix SDK Methods](#2-api-routes--matrix-sdk-methods)
4. [Socket.io Real-time → Matrix Sync](#3-socketio-real-time--matrix-sync)
5. [Complex Mappings](#4-complex-mappings)
6. [Authentication Flow](#5-authentication-flow)
7. [Implementation Notes](#6-implementation-notes)

---

## 0. Entity Relationship Overview

### Original Prisma Schema (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DISCORD CLONE DATA MODEL                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   Profile    │
                              ├──────────────┤
                              │ id           │
                              │ userId       │◄──── Clerk Auth ID
                              │ name         │
                              │ imageUrl     │
                              │ email        │
                              └──────┬───────┘
                                     │ 1:N
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────┐    ┌───────────┐    ┌───────────┐
            │  Server   │    │  Member   │    │  Channel  │
            ├───────────┤    ├───────────┤    ├───────────┤
            │ id        │    │ id        │    │ id        │
            │ name      │    │ role      │    │ name      │
            │ imageUrl  │    │ profileId │    │ type      │
            │ inviteCode│    │ serverId  │    │ profileId │
            │ profileId │    └─────┬─────┘    │ serverId  │
            └─────┬─────┘          │          └─────┬─────┘
                  │                │                │
                  │ 1:N            │                │ 1:N
                  │        ┌───────┴───────┐       │
                  │        │               │       │
                  │        ▼               ▼       ▼
                  │  ┌──────────┐   ┌─────────────────┐
                  │  │ Message  │   │ DirectMessage   │
                  │  ├──────────┤   ├─────────────────┤
                  │  │ id       │   │ id              │
                  │  │ content  │   │ content         │
                  │  │ fileUrl  │   │ fileUrl         │
                  │  │ memberId │   │ memberId        │
                  │  │ channelId│   │ conversationId  │
                  │  │ deleted  │   │ deleted         │
                  │  └──────────┘   └────────┬────────┘
                  │                          │
                  │                          │ N:1
                  │                          ▼
                  │                 ┌─────────────────┐
                  │                 │  Conversation   │
                  │                 ├─────────────────┤
                  └─────────────────┤ id              │
                                    │ memberOneId     │
                                    │ memberTwoId     │
                                    └─────────────────┘

ENUMS:
┌─────────────────┐    ┌─────────────────┐
│   MemberRole    │    │   ChannelType   │
├─────────────────┤    ├─────────────────┤
│ ADMIN           │    │ TEXT            │
│ MODERATOR       │    │ AUDIO           │
│ GUEST           │    │ VIDEO           │
└─────────────────┘    └─────────────────┘
```

### Matrix Equivalent Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MATRIX DATA MODEL (MELO)                          │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌────────────────────────┐
                        │   Matrix User          │
                        │   @userId:homeserver   │
                        ├────────────────────────┤
                        │ displayname            │
                        │ avatar_url (mxc://)    │
                        │ account_data:          │
                        │   io.melo.profile      │
                        └───────────┬────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────────┐     ┌─────────────────┐         ┌──────────────────┐
│   Space (Server)  │     │  Room Member    │         │ Direct Room (DM) │
│   type: m.space   │     │  m.room.member  │         │ is_direct: true  │
├───────────────────┤     ├─────────────────┤         ├──────────────────┤
│ m.room.name       │     │ membership      │         │ m.room.message   │
│ m.room.avatar     │     │ power_level     │         │ (timeline events)│
│ io.melo.server    │     │ io.melo.role    │         │ tracked in       │
│ m.space.child[]   │     └─────────────────┘         │ m.direct acct    │
└────────┬──────────┘                                 └──────────────────┘
         │
         │ m.space.child / m.space.parent
         ▼
┌───────────────────┐
│  Room (Channel)   │
├───────────────────┤
│ m.room.name       │
│ io.melo.channel   │
│   type: TEXT/etc  │
│ m.room.message[]  │◄──── Timeline Events
└───────────────────┘

STATE EVENTS (Custom):
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   io.melo.server    │  │  io.melo.channel    │  │ io.melo.member_role │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ inviteCode: string  │  │ type: TEXT|AUDIO|   │  │ role: ADMIN|MOD|    │
│ ownerId: mxid       │  │       VIDEO         │  │       GUEST         │
│                     │  │ creatorId: mxid     │  │ (state_key=userId)  │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 1. Prisma Models → Matrix Equivalents

### Summary Table

| Prisma Model | Matrix Equivalent | State Event Type | Notes |
|--------------|-------------------|------------------|-------|
| **Profile** | Matrix User | N/A (user identity) | `@userId:homeserver` |
| **Server** | Matrix Space | `m.space.child` / `m.space.parent` | Room with `type: "m.space"` |
| **Channel** | Matrix Room | `m.room.*` state events | Child of space |
| **Member** | Room Membership | `m.room.member` | Per-room power levels |
| **MemberRole** | Power Levels + Custom State | `m.room.power_levels` + `io.melo.role` | See [Role Mapping](#role-mapping) |
| **Message** | Room Event | `m.room.message` | Timeline event |
| **Conversation** | Direct Room | `m.direct` account data | `is_direct: true` flag |
| **DirectMessage** | Room Event | `m.room.message` | In direct room |
| **ChannelType** | Room Purpose | `io.melo.channel_type` | Custom state event |

### Enum Mappings

#### MemberRole → Power Levels

```typescript
// Prisma enum
enum MemberRole {
  ADMIN      // Full server control
  MODERATOR  // Manage channels, kick/ban, delete messages
  GUEST      // Send messages, basic access
}

// Matrix power level mapping
const ROLE_TO_POWER_LEVEL: Record<MemberRole, number> = {
  ADMIN: 100,
  MODERATOR: 50,
  GUEST: 0
};

// Reverse lookup
function powerLevelToRole(level: number): MemberRole {
  if (level >= 100) return 'ADMIN';
  if (level >= 50) return 'MODERATOR';
  return 'GUEST';
}
```

#### ChannelType → Custom State

```typescript
// Prisma enum
enum ChannelType {
  TEXT   // Standard text channel
  AUDIO  // Voice channel (LiveKit)
  VIDEO  // Video channel (LiveKit)
}

// Matrix state event
interface MeloChannelState {
  type: 'TEXT' | 'AUDIO' | 'VIDEO';
  creatorId: string;  // @userId:homeserver
  // Optional LiveKit config for AUDIO/VIDEO
  livekit?: {
    enabled: boolean;
    roomName?: string;
  };
}

// Store in: io.melo.channel state event
await client.sendStateEvent(roomId, 'io.melo.channel', {
  type: 'AUDIO',
  creatorId: '@user:homeserver',
  livekit: { enabled: true }
});
```

---

### Detailed Model Mappings

#### Profile → Matrix User

```prisma
model Profile {
  id       String @id @default(uuid())
  userId   String @unique    // Clerk/Auth user ID
  name     String
  imageUrl String @db.Text
  email    String @db.Text

  servers  Server[]
  members  Member[]
  channels Channel[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Matrix Equivalent:**
- User identity: `@{userId}:{homeserver}`
- Profile data stored in account data or displayname/avatar_url

```typescript
// Matrix SDK - Profile Operations
interface MatrixProfileService {
  // Get user profile
  async getProfile(userId: string): Promise<Profile> {
    const user = await client.getUser(userId);
    const accountData = await client.getAccountData('io.melo.profile');
    
    return {
      id: userId,
      userId: accountData?.clerkId || userId,
      name: user.displayName,
      imageUrl: client.mxcUrlToHttp(user.avatarUrl),
      email: accountData?.email || ''
    };
  }

  // Update profile
  async updateProfile(name: string, imageUrl: string): Promise<void> {
    await client.setDisplayName(name);
    if (imageUrl) {
      const mxcUrl = await client.uploadContent(imageUrl);
      await client.setAvatarUrl(mxcUrl);
    }
  }

  // Store extended profile data
  async setExtendedProfile(email: string, clerkId: string): Promise<void> {
    await client.setAccountData('io.melo.profile', {
      email,
      clerkId,
      updatedAt: new Date().toISOString()
    });
  }
}
```

**Key Difference:** Matrix doesn't store email in profile; use account data for extended fields.

**Index Mapping:**
| Prisma Index | Matrix Query |
|--------------|--------------|
| `userId @unique` | User ID is unique by definition (`@userId:homeserver`) |

---

#### Server → Matrix Space

```prisma
model Server {
  id         String @id @default(uuid())
  name       String
  imageUrl   String @db.Text
  inviteCode String @unique

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  members  Member[]
  channels Channel[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([profileId])
}
```

**Matrix Equivalent:**
- Matrix Space (special room with `type: "m.space"`)
- Server metadata in state events

```typescript
// Create server (space) - matches POST /api/servers
interface ServerCreateRequest {
  name: string;
  imageUrl: string;
}

async function createServer(
  req: ServerCreateRequest, 
  userId: string
): Promise<{ spaceId: string; generalChannelId: string }> {
  const homeserver = extractHomeserver(userId);
  const inviteCode = uuidv4();

  // 1. Create space
  const spaceRoom = await client.createRoom({
    name: req.name,
    creation_content: {
      type: 'm.space'
    },
    initial_state: [
      {
        type: 'm.room.avatar',
        content: { url: await uploadToMxc(req.imageUrl) }
      },
      {
        type: 'io.melo.server',
        state_key: '',
        content: {
          inviteCode,
          ownerId: userId,
          createdAt: new Date().toISOString()
        }
      }
    ],
    power_level_content_override: {
      users: { [userId]: 100 },  // Creator is ADMIN
      events: {
        'm.room.name': 50,
        'm.room.avatar': 50,
        'm.space.child': 50,
        'io.melo.server': 100,
        'io.melo.channel': 50
      }
    }
  });

  // 2. Create default "general" channel (matches Discord clone behavior)
  const generalRoom = await client.createRoom({
    name: 'general',
    initial_state: [
      { 
        type: 'm.space.parent', 
        state_key: spaceRoom.room_id, 
        content: { via: [homeserver] } 
      },
      { 
        type: 'io.melo.channel', 
        content: { type: 'TEXT', creatorId: userId } 
      }
    ]
  });

  // 3. Add general to space
  await client.sendStateEvent(
    spaceRoom.room_id, 
    'm.space.child',
    { via: [homeserver] }, 
    generalRoom.room_id
  );

  return { 
    spaceId: spaceRoom.room_id, 
    generalChannelId: generalRoom.room_id 
  };
}
```

**State Events:**
| Event Type | Purpose | State Key |
|------------|---------|-----------|
| `m.room.name` | Server name | `''` (empty) |
| `m.room.avatar` | Server icon | `''` (empty) |
| `io.melo.server` | Custom: invite code, owner | `''` (empty) |
| `m.space.child` | Links to channel rooms | `{childRoomId}` |

---

#### Channel → Matrix Room

```prisma
model Channel {
  id   String      @id @default(uuid())
  name String
  type ChannelType @default(TEXT)

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  serverId String
  server   Server @relation(fields: [serverId], references: [id], onDelete: Cascade)

  messages Message[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([profileId])
  @@index([serverId])
}
```

**Matrix Equivalent:**
- Regular Matrix room, child of the space
- Channel type in custom state event

```typescript
// Create channel - matches POST /api/channels
async function createChannel(
  serverId: string,
  name: string,
  type: ChannelType,
  userId: string
): Promise<string> {
  const homeserver = extractHomeserver(userId);
  
  // 1. Verify user has permission (ADMIN or MODERATOR)
  const powerLevels = await client.getStateEvent(serverId, 'm.room.power_levels');
  const userLevel = powerLevels.users?.[userId] ?? powerLevels.users_default ?? 0;
  
  if (userLevel < 50) {
    throw new Error('Unauthorized: requires ADMIN or MODERATOR role');
  }

  // 2. Validate name (matches Discord clone restriction)
  if (name.toLowerCase() === 'general') {
    throw new Error("Name cannot be 'general'");
  }

  // 3. Create channel room
  const channelRoom = await client.createRoom({
    name,
    initial_state: [
      {
        type: 'm.space.parent',
        state_key: serverId,
        content: { via: [homeserver] }
      },
      {
        type: 'io.melo.channel',
        content: {
          type,
          creatorId: userId,
          createdAt: new Date().toISOString()
        }
      }
    ]
  });

  // 4. Add to space
  await client.sendStateEvent(
    serverId, 
    'm.space.child', 
    { via: [homeserver] }, 
    channelRoom.room_id
  );

  return channelRoom.room_id;
}
```

**ChannelType Mapping:**
| Discord Type | Matrix Room Config | Additional Config |
|--------------|-------------------|-------------------|
| `TEXT` | Standard room | None |
| `AUDIO` | Room + `io.melo.channel.type: 'AUDIO'` | LiveKit room created |
| `VIDEO` | Room + `io.melo.channel.type: 'VIDEO'` | LiveKit room created |

---

#### Member → Room Membership

```prisma
model Member {
  id   String     @id @default(uuid())
  role MemberRole @default(GUEST)

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  serverId String
  server   Server @relation(fields: [serverId], references: [id], onDelete: Cascade)

  messages       Message[]
  directMessages DirectMessage[]

  conversationsInitiated Conversation[] @relation("MemberOne")
  conversationsReceived  Conversation[] @relation("MemberTwo")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([profileId])
  @@index([serverId])
}
```

**Matrix Equivalent:**
- `m.room.member` state event (join state)
- Power levels for permissions
- Custom role state event for role metadata

```typescript
// Member management - matches API routes
interface MemberService {
  // Join server (become member)
  async joinServer(spaceId: string, userId: string): Promise<void> {
    await client.joinRoom(spaceId);
    
    // Also join all child rooms (channels)
    const spaceState = await client.roomState(spaceId);
    const childRooms = spaceState
      .filter(e => e.type === 'm.space.child')
      .map(e => e.state_key);
    
    for (const childId of childRooms) {
      await client.joinRoom(childId);
    }
  }

  // Update member role - matches PATCH /api/members/[memberId]
  async updateRole(
    serverId: string, 
    targetUserId: string, 
    newRole: MemberRole,
    requesterId: string
  ): Promise<void> {
    // Verify requester is owner (profileId match)
    const serverState = await client.getStateEvent(serverId, 'io.melo.server');
    if (serverState.ownerId !== requesterId) {
      throw new Error('Unauthorized: only server owner can change roles');
    }
    
    // Prevent self-demotion
    if (targetUserId === requesterId) {
      throw new Error('Cannot change own role');
    }

    // Update power level
    const powerLevels = await client.getStateEvent(serverId, 'm.room.power_levels');
    powerLevels.users[targetUserId] = ROLE_TO_POWER_LEVEL[newRole];
    await client.sendStateEvent(serverId, 'm.room.power_levels', powerLevels);
    
    // Store role name for display
    await client.sendStateEvent(
      serverId, 
      'io.melo.member_role', 
      { role: newRole }, 
      targetUserId
    );
  }

  // Kick member - matches DELETE /api/members/[memberId]
  async kickMember(
    serverId: string,
    targetUserId: string,
    requesterId: string
  ): Promise<void> {
    // Verify requester is owner
    const serverState = await client.getStateEvent(serverId, 'io.melo.server');
    if (serverState.ownerId !== requesterId) {
      throw new Error('Unauthorized');
    }

    // Prevent kicking self
    if (targetUserId === requesterId) {
      throw new Error('Cannot kick yourself');
    }

    // Kick from space and all child rooms
    await client.kick(serverId, targetUserId);
    
    const spaceState = await client.roomState(serverId);
    const childRooms = spaceState
      .filter(e => e.type === 'm.space.child')
      .map(e => e.state_key);
    
    for (const childId of childRooms) {
      try {
        await client.kick(childId, targetUserId);
      } catch (e) {
        // User may not be in this room
      }
    }
  }
}
```

<a id="role-mapping"></a>
**Role Mapping:**
| MemberRole | Power Level | Capabilities |
|------------|-------------|--------------|
| `ADMIN` | 100 | Full control, delete server, manage all |
| `MODERATOR` | 50 | Manage channels, kick/ban, delete messages |
| `GUEST` | 0 | Send messages, basic access |

---

#### Message → Matrix Event

```prisma
model Message {
  id      String @id @default(uuid())
  content String @db.Text

  fileUrl String? @db.Text

  memberId String
  member   Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  channelId String
  channel   Channel @relation(fields: [channelId], references: [id], onDelete: Cascade)

  deleted Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([channelId])
  @@index([memberId])
}
```

**Matrix Equivalent:**
- `m.room.message` event in room timeline
- File attachments via `m.file`, `m.image`, etc.
- Soft delete via redaction

```typescript
// Message operations - matches socket/messages routes
interface MessageService {
  // Send message - matches POST /api/socket/messages
  async sendMessage(
    channelId: string,
    content: string,
    fileUrl?: string,
    userId: string
  ): Promise<string> {
    // Verify user is member of server containing this channel
    const parentState = await client.getStateEvent(channelId, 'm.space.parent');
    const serverId = Object.keys(parentState)[0]; // state_key is parent room ID
    
    const membership = await client.getStateEvent(serverId, 'm.room.member', userId);
    if (membership?.membership !== 'join') {
      throw new Error('Not a member of this server');
    }

    let eventContent: any;

    if (fileUrl) {
      // Upload file to Matrix
      const mxcUrl = await client.uploadContent(fileUrl);
      const mimeType = getMimeType(fileUrl);
      
      eventContent = {
        msgtype: getMsgType(mimeType), // m.image, m.file, m.video, etc.
        body: content || extractFilename(fileUrl),
        url: mxcUrl,
        info: { mimetype: mimeType }
      };
    } else {
      eventContent = {
        msgtype: 'm.text',
        body: content
      };
    }

    const response = await client.sendMessage(channelId, eventContent);
    return response.event_id;
  }

  // Edit message - matches PATCH /api/socket/messages/[messageId]
  async editMessage(
    channelId: string,
    messageId: string,
    newContent: string,
    userId: string
  ): Promise<void> {
    // Get original message to verify ownership
    const original = await client.fetchRoomEvent(channelId, messageId);
    
    if (original.sender !== userId) {
      throw new Error('Can only edit own messages');
    }

    await client.sendMessage(channelId, {
      msgtype: 'm.text',
      body: `* ${newContent}`,
      'm.new_content': {
        msgtype: 'm.text',
        body: newContent
      },
      'm.relates_to': {
        rel_type: 'm.replace',
        event_id: messageId
      }
    });
  }

  // Delete message - matches DELETE /api/socket/messages/[messageId]
  async deleteMessage(
    channelId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const original = await client.fetchRoomEvent(channelId, messageId);
    
    // Check if user can delete (owner, or ADMIN/MODERATOR)
    const isOwner = original.sender === userId;
    const powerLevels = await client.getStateEvent(channelId, 'm.room.power_levels');
    const userLevel = powerLevels.users?.[userId] ?? 0;
    const canModerate = userLevel >= 50;

    if (!isOwner && !canModerate) {
      throw new Error('Unauthorized');
    }

    // Matrix redaction (equivalent to soft delete)
    await client.redactEvent(channelId, messageId, 'Message deleted');
  }

  // Get messages with pagination - matches GET /api/messages
  async getMessages(
    channelId: string,
    cursor?: string,
    limit: number = 10
  ): Promise<{ items: MatrixEvent[]; nextCursor: string | null }> {
    let messages: any[];
    let nextCursor: string | null = null;

    if (cursor) {
      // Paginate backwards from cursor
      const result = await client.createMessagesRequest(
        channelId,
        cursor,
        limit,
        'b'  // backwards direction
      );
      messages = result.chunk.filter(e => e.type === 'm.room.message');
      nextCursor = result.end || null;
    } else {
      // Get latest messages
      const room = client.getRoom(channelId);
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents()
        .filter(e => e.getType() === 'm.room.message')
        .slice(-limit)
        .reverse();  // Newest first (matches Discord clone)
      
      messages = events;
      nextCursor = timeline.getPaginationToken('b') || null;
    }

    return { items: messages, nextCursor };
  }
}
```

**Key Differences:**
1. Matrix uses event IDs (`$eventId`), not UUIDs
2. Deleted messages are redacted (content removed, event shell remains)
3. Files uploaded to Matrix content repo (`mxc://` URLs)
4. Sender is Matrix user ID, not member ID (need to look up membership for role)

---

#### Conversation → Direct Room

```prisma
model Conversation {
  id String @id @default(uuid())

  memberOneId String
  memberOne   Member @relation("MemberOne", fields: [memberOneId], references: [id], onDelete: Cascade)

  memberTwoId String
  memberTwo   Member @relation("MemberTwo", fields: [memberTwoId], references: [id], onDelete: Cascade)

  directMessages DirectMessage[]

  @@unique([memberOneId, memberTwoId])
  @@index([memberTwoId])
}
```

**Matrix Equivalent:**
- Direct room with `is_direct: true`
- Tracked in `m.direct` account data

```typescript
// Conversation service - matches lib/conversation.ts
interface ConversationService {
  // getOrCreateConversation equivalent
  async getOrCreateDM(otherUserId: string, myUserId: string): Promise<string> {
    // Check existing DMs in account data
    const directRooms = await client.getAccountData('m.direct') || {};
    
    // Try both directions (matches findConversation logic)
    const existingRoomId = directRooms[otherUserId]?.[0];
    
    if (existingRoomId) {
      // Verify room still exists and we're joined
      const room = client.getRoom(existingRoomId);
      if (room && room.getMyMembership() === 'join') {
        return existingRoomId;
      }
    }

    // Create new DM (matches createNewConversation)
    const dmRoom = await client.createRoom({
      is_direct: true,
      invite: [otherUserId],
      preset: 'trusted_private_chat',
      initial_state: []
    });

    // Update m.direct account data
    directRooms[otherUserId] = [dmRoom.room_id];
    await client.setAccountData('m.direct', directRooms);

    return dmRoom.room_id;
  }

  // Find existing conversation
  async findConversation(
    memberOneUserId: string,
    memberTwoUserId: string
  ): Promise<string | null> {
    const directRooms = await client.getAccountData('m.direct') || {};
    
    // Check both directions
    return directRooms[memberTwoUserId]?.[0] || null;
  }
}
```

**Key Difference:** Matrix allows multiple DM rooms with same user; typically use first one.

---

#### DirectMessage → Room Event (in DM)

```prisma
model DirectMessage {
  id      String  @id @default(uuid())
  content String  @db.Text
  fileUrl String? @db.Text

  memberId String
  member   Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  deleted Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([memberId])
  @@index([conversationId])
}
```

**Matrix Equivalent:** Same as `Message`, just sent to a direct room instead of a channel room.

```typescript
// DirectMessage operations - matches /api/socket/direct-messages routes
interface DirectMessageService {
  // Send DM - matches POST /api/socket/direct-messages
  async sendDirectMessage(
    conversationId: string,  // This is the DM room ID
    content: string,
    fileUrl?: string,
    userId: string
  ): Promise<string> {
    // Verify user is part of this conversation
    const room = client.getRoom(conversationId);
    if (!room || room.getMyMembership() !== 'join') {
      throw new Error('Not a member of this conversation');
    }

    // Verify it's actually a DM
    const createEvent = await client.getStateEvent(conversationId, 'm.room.create');
    // Note: is_direct might be on room or in account data

    // Send message (same as regular message)
    return this.messageService.sendMessage(
      conversationId, 
      content, 
      fileUrl, 
      userId
    );
  }

  // Get DM history - matches GET /api/direct-messages
  async getDirectMessages(
    conversationId: string,
    cursor?: string,
    limit: number = 10
  ): Promise<{ items: MatrixEvent[]; nextCursor: string | null }> {
    // Same as regular message pagination
    return this.messageService.getMessages(conversationId, cursor, limit);
  }
}
```

---

## 2. API Routes → Matrix SDK Methods

### Complete API Route Mapping

#### Server Routes (`/api/servers/*`)

| Route | Method | Prisma Operations | Matrix SDK Equivalent |
|-------|--------|-------------------|----------------------|
| `POST /api/servers` | Create | `db.server.create` with channels + members | `createRoom({ type: 'm.space' })` + create general channel + set power levels |
| `PATCH /api/servers/[id]` | Update | `db.server.update({ name, imageUrl })` | `sendStateEvent('m.room.name')` + `sendStateEvent('m.room.avatar')` |
| `DELETE /api/servers/[id]` | Delete | `db.server.delete` | Leave all child rooms + space, or send `io.melo.server_deleted` state |
| `PATCH /api/servers/[id]/invite-code` | Regenerate | `db.server.update({ inviteCode })` | `sendStateEvent('io.melo.server', { inviteCode: newCode })` |
| `PATCH /api/servers/[id]/leave` | Leave | `db.server.update` removing member | `client.leave(spaceId)` + leave all child rooms |

**Implementation Notes:**
- Server deletion in Matrix: Either leave (room persists for others) or redact all content
- Owner check: Compare `io.melo.server.ownerId` with requesting user

#### Channel Routes (`/api/channels/*`)

| Route | Method | Prisma Operations | Matrix SDK Equivalent |
|-------|--------|-------------------|----------------------|
| `POST /api/channels` | Create | `db.server.update` creating channel | `createRoom()` + `sendStateEvent('m.space.child')` |
| `PATCH /api/channels/[id]` | Update | `db.channel.update` | `sendStateEvent('m.room.name')` |
| `DELETE /api/channels/[id]` | Delete | `db.channel.delete` | Remove `m.space.child` + leave room or mark deleted |

**Permission Check:**
```typescript
// Matches: members: { some: { profileId, role: { in: [ADMIN, MODERATOR] } } }
async function canManageChannels(spaceId: string, userId: string): Promise<boolean> {
  const powerLevels = await client.getStateEvent(spaceId, 'm.room.power_levels');
  const userLevel = powerLevels.users?.[userId] ?? powerLevels.users_default ?? 0;
  return userLevel >= 50; // MODERATOR or higher
}
```

#### Member Routes (`/api/members/*`)

| Route | Method | Prisma Operations | Matrix SDK Equivalent |
|-------|--------|-------------------|----------------------|
| `PATCH /api/members/[id]` | Update role | `db.server.update({ members: { update: { role } } })` | Update `m.room.power_levels.users[userId]` + `io.melo.member_role` |
| `DELETE /api/members/[id]` | Kick | `db.server.update({ members: { deleteMany } })` | `client.kick(roomId, userId)` for space + all children |

#### Message Routes

| Route | Method | Prisma Operations | Matrix SDK Equivalent |
|-------|--------|-------------------|----------------------|
| `GET /api/messages` | List | `db.message.findMany` with cursor pagination | `createMessagesRequest()` or `room.timeline` |
| `POST /socket/messages` | Create | `db.message.create` | `room.sendMessage()` |
| `PATCH /socket/messages/[id]` | Edit | `db.message.update({ content })` | `sendMessage()` with `m.replace` relation |
| `DELETE /socket/messages/[id]` | Delete | `db.message.update({ deleted: true, content: 'deleted' })` | `client.redactEvent()` |

#### Direct Message Routes

| Route | Method | Matrix SDK Equivalent |
|-------|--------|----------------------|
| `GET /api/direct-messages` | List | Same as messages, in DM room |
| `POST /socket/direct-messages` | Create | `room.sendMessage()` in DM room |
| `PATCH /socket/direct-messages/[id]` | Edit | Same as message edit |
| `DELETE /socket/direct-messages/[id]` | Delete | `client.redactEvent()` |

#### Auxiliary Routes

| Route | Method | Matrix SDK Equivalent |
|-------|--------|----------------------|
| `POST /api/uploadthing` | Upload file | `client.uploadContent()` → returns `mxc://` URL |
| `GET /api/livekit` | Get token | **Keep as-is** (LiveKit is separate from Matrix) |

---

## 3. Socket.io Real-time → Matrix Sync

### Event Mapping

| Socket.io Event Pattern | Matrix Equivalent |
|------------------------|-------------------|
| `chat:${channelId}:messages` | `Room.timeline` event for `m.room.message` |
| `chat:${channelId}:messages:update` | `Room.timeline` with `m.replace` relation |
| Connection status | Matrix sync state (`SYNCING`, `PREPARED`, etc.) |

### Socket.io Emit → Matrix Event Listener

```typescript
// Original Socket.io pattern (from Discord clone)
res?.socket?.server?.io?.emit(`chat:${channelId}:messages`, message);

// Matrix equivalent - events come through sync automatically
client.on('Room.timeline', (event, room, toStartOfTimeline) => {
  if (event.getType() !== 'm.room.message') return;
  if (toStartOfTimeline) return; // Historical, not new

  const isEdit = event.getContent()['m.relates_to']?.rel_type === 'm.replace';
  
  if (isEdit) {
    const originalId = event.getContent()['m.relates_to'].event_id;
    // Emit to React state: message update
    emitMessageUpdate(room.roomId, originalId, event);
  } else {
    // Emit to React state: new message
    emitNewMessage(room.roomId, event);
  }
});

client.on('Room.redaction', (event, room) => {
  // Emit to React state: message deleted
  emitMessageDelete(room.roomId, event.event.redacts);
});
```

### React Hook Pattern

```typescript
// Replace useSocket + Tanstack Query with Matrix sync
function useRoomMessages(roomId: string) {
  const [messages, setMessages] = useState<MatrixEvent[]>([]);
  const client = useMatrixClient();

  useEffect(() => {
    const room = client.getRoom(roomId);
    if (!room) return;

    // Initial load
    const initialEvents = room.getLiveTimeline()
      .getEvents()
      .filter(e => e.getType() === 'm.room.message');
    setMessages(initialEvents);

    // Live updates (replaces Socket.io listeners)
    const handleTimeline = (event: MatrixEvent, eventRoom: Room) => {
      if (eventRoom.roomId !== roomId) return;
      if (event.getType() !== 'm.room.message') return;
      
      setMessages(prev => {
        const isEdit = event.getContent()['m.relates_to']?.rel_type === 'm.replace';
        if (isEdit) {
          const targetId = event.getContent()['m.relates_to'].event_id;
          return prev.map(m => 
            m.getId() === targetId ? event : m
          );
        }
        return [...prev, event];
      });
    };

    const handleRedaction = (event: MatrixEvent, eventRoom: Room) => {
      if (eventRoom.roomId !== roomId) return;
      const redactedId = event.event.redacts;
      setMessages(prev => prev.filter(m => m.getId() !== redactedId));
    };

    client.on('Room.timeline', handleTimeline);
    client.on('Room.redaction', handleRedaction);

    return () => {
      client.off('Room.timeline', handleTimeline);
      client.off('Room.redaction', handleRedaction);
    };
  }, [client, roomId]);

  return messages;
}
```

---

## 4. Complex Mappings

### 4.1 Invite Codes

**Discord Clone:** UUID-based invite codes stored in database.

```typescript
// Discord clone pattern
const server = await db.server.create({
  data: { inviteCode: uuidv4(), ... }
});

// Regenerate
await db.server.update({
  where: { id: serverId },
  data: { inviteCode: uuidv4() }
});
```

**Matrix Options:**

**Option A: Room Aliases (Public servers)**
```typescript
// Set alias
await client.createAlias(`#${serverSlug}:${homeserver}`, spaceRoomId);
// Join via alias
await client.joinRoom(`#${serverSlug}:${homeserver}`);
```

**Option B: Custom Invite Codes (Private servers) - RECOMMENDED**
```typescript
// Store in state event
await client.sendStateEvent(spaceId, 'io.melo.server', {
  inviteCode: generateInviteCode(),
  ownerId: userId
});

// Backend lookup service (Redis or DB)
class InviteCodeService {
  private redis: Redis;

  async registerCode(code: string, roomId: string): Promise<void> {
    await this.redis.set(`invite:${code}`, roomId, 'EX', 86400 * 7); // 7 days
  }

  async lookupCode(code: string): Promise<string | null> {
    return this.redis.get(`invite:${code}`);
  }

  async regenerateCode(roomId: string): Promise<string> {
    const newCode = generateInviteCode();
    
    // Update Matrix state
    const current = await client.getStateEvent(roomId, 'io.melo.server');
    await client.sendStateEvent(roomId, 'io.melo.server', {
      ...current,
      inviteCode: newCode
    });
    
    // Update lookup cache
    await this.registerCode(newCode, roomId);
    
    return newCode;
  }
}
```

**Option C: Matrix Invite Links**
```typescript
// Built-in Matrix invite system
const invite = await client.invite(roomId, userToInvite);
```

**Recommendation:** Use Option B with Redis lookup for fastest resolution.

---

### 4.2 Permission Cascading

When a user's role changes in a server, it needs to propagate to all channels.

```typescript
async function updateRoleAcrossServer(
  spaceId: string, 
  userId: string, 
  newRole: MemberRole
): Promise<void> {
  const powerLevel = ROLE_TO_POWER_LEVEL[newRole];

  // 1. Update space power levels
  await updatePowerLevel(spaceId, userId, powerLevel);
  await client.sendStateEvent(spaceId, 'io.melo.member_role', { role: newRole }, userId);

  // 2. Get all child rooms
  const spaceState = await client.roomState(spaceId);
  const childRoomIds = spaceState
    .filter(e => e.type === 'm.space.child')
    .map(e => e.state_key);

  // 3. Update each child room (in parallel with rate limiting)
  const results = await Promise.allSettled(
    childRoomIds.map(roomId => updatePowerLevel(roomId, userId, powerLevel))
  );

  // Log any failures
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`Failed to update power in ${childRoomIds[i]}:`, result.reason);
    }
  });
}

async function updatePowerLevel(
  roomId: string, 
  userId: string, 
  level: number
): Promise<void> {
  const powerLevels = await client.getStateEvent(roomId, 'm.room.power_levels');
  powerLevels.users = powerLevels.users || {};
  powerLevels.users[userId] = level;
  await client.sendStateEvent(roomId, 'm.room.power_levels', powerLevels);
}
```

---

### 4.3 Channel Ordering

Matrix spaces don't preserve ordering. Need custom state.

```typescript
// Store order in space state
interface ChannelOrder {
  channels: Array<{
    roomId: string;
    position: number;
  }>;
}

await client.sendStateEvent(spaceId, 'io.melo.channel_order', {
  channels: [
    { roomId: '!general:hs', position: 0 },
    { roomId: '!random:hs', position: 1 },
    { roomId: '!dev:hs', position: 2 }
  ]
});

// Query ordered channels
async function getOrderedChannels(spaceId: string): Promise<string[]> {
  const order = await client.getStateEvent(spaceId, 'io.melo.channel_order');
  const spaceState = await client.roomState(spaceId);
  
  const childIds = new Set(
    spaceState
      .filter(e => e.type === 'm.space.child')
      .map(e => e.state_key)
  );

  // Return ordered, with unordered channels at end
  const ordered = (order?.channels || [])
    .filter(c => childIds.has(c.roomId))
    .sort((a, b) => a.position - b.position)
    .map(c => c.roomId);

  const unordered = [...childIds].filter(id => !ordered.includes(id));
  
  return [...ordered, ...unordered];
}
```

---

### 4.4 Member List

```typescript
// Discord clone: Query from DB with join
// Matrix: Aggregate from room state

async function getServerMembers(spaceId: string): Promise<MemberWithProfile[]> {
  const room = client.getRoom(spaceId);
  const members = room.getJoinedMembers();
  
  return Promise.all(members.map(async (member) => {
    const roleState = await client.getStateEvent(
      spaceId, 
      'io.melo.member_role', 
      member.userId
    ).catch(() => null);

    const powerLevels = await client.getStateEvent(spaceId, 'm.room.power_levels');
    const userPower = powerLevels.users?.[member.userId] ?? 0;

    return {
      id: member.userId,
      role: roleState?.role || powerLevelToRole(userPower),
      profile: {
        id: member.userId,
        name: member.name || member.userId,
        imageUrl: member.getAvatarUrl(client.baseUrl, 96, 96, 'crop'),
        email: '' // From account data if available
      }
    };
  }));
}
```

---

### 4.5 Additional Matrix Features (Not in Discord Clone)

These come "for free" with Matrix:

#### Reactions
```typescript
await client.sendEvent(roomId, 'm.reaction', {
  'm.relates_to': {
    rel_type: 'm.annotation',
    event_id: messageEventId,
    key: '👍'
  }
});
```

#### Threads
```typescript
await room.sendMessage({
  msgtype: 'm.text',
  body: 'Thread reply',
  'm.relates_to': {
    rel_type: 'm.thread',
    event_id: threadRootEventId,
    is_falling_back: true
  }
});
```

#### Typing Indicators
```typescript
await client.sendTyping(roomId, true, 30000);
client.on('RoomMember.typing', (event, member) => { /* ... */ });
```

#### Read Receipts
```typescript
await client.sendReadReceipt(latestEvent);
const receipts = room.getReceiptsForEvent(event);
```

#### Presence
```typescript
await client.setPresence({ presence: 'online', status_msg: 'Working' });
client.on('User.presence', (event, user) => { /* ... */ });
```

---

## 5. Authentication Flow

### Discord Clone: Clerk Auth → Profile

```typescript
// lib/initial-profile.ts
export const initialProfile = async () => {
  const user = await currentUser();  // Clerk
  if (!user) return redirectToSignIn();

  let profile = await db.profile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    profile = await db.profile.create({
      data: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress
      }
    });
  }

  return profile;
};
```

### MELO: Auth → Matrix Login

```typescript
// Matrix authentication options:

// Option A: Existing Matrix account (SSO or password)
async function loginWithCredentials(
  homeserver: string,
  username: string,
  password: string
): Promise<MatrixClient> {
  const client = createClient({ baseUrl: homeserver });
  await client.loginWithPassword(username, password);
  return client;
}

// Option B: OpenID Connect (integrate with Clerk/Auth0/etc)
async function loginWithOIDC(
  homeserver: string,
  oidcToken: string
): Promise<MatrixClient> {
  const client = createClient({ baseUrl: homeserver });
  // Matrix 1.7+ supports OIDC natively
  await client.login('m.login.token', { token: oidcToken });
  return client;
}

// Option C: Application service (bot-style, for development)
async function loginAsAppService(
  homeserver: string,
  asToken: string,
  userId: string
): Promise<MatrixClient> {
  const client = createClient({
    baseUrl: homeserver,
    accessToken: asToken,
    userId: userId
  });
  return client;
}

// After login, ensure MELO profile data exists
async function ensureMeloProfile(
  client: MatrixClient,
  authProviderData: { email: string; clerkId: string }
): Promise<void> {
  const existing = await client.getAccountData('io.melo.profile').catch(() => null);
  
  if (!existing) {
    await client.setAccountData('io.melo.profile', {
      email: authProviderData.email,
      clerkId: authProviderData.clerkId,
      createdAt: new Date().toISOString()
    });
  }
}
```

---

## 6. Implementation Notes

### 6.1 What Matrix Gives Us for Free

| Feature | Matrix Built-in | Notes |
|---------|----------------|-------|
| Real-time sync | ✅ Native | No Socket.io needed |
| End-to-end encryption | ✅ Megolm/Olm | Optional per-room |
| Message history | ✅ Federation | Persists across servers |
| Typing indicators | ✅ m.typing | Built-in |
| Read receipts | ✅ m.receipt | Built-in |
| Reactions | ✅ m.reaction | Built-in |
| Threads | ✅ m.thread | Built-in |
| File upload | ✅ Content repository | mxc:// URLs |
| Presence | ✅ m.presence | Online/offline status |
| Push notifications | ✅ Push rules | Configurable |

### 6.2 What We Need to Build

| Feature | Implementation | Complexity |
|---------|----------------|------------|
| Invite codes | Custom state event + Redis lookup | Medium |
| Server icons/banners | Standard avatar + custom state | Low |
| Channel types (voice/video) | Custom state + LiveKit integration | Medium |
| Role display | Custom state events | Low |
| Server discovery | Custom directory service | Medium |
| Channel ordering | Custom state event | Low |

### 6.3 Database Changes

**From:** MySQL/Prisma centralized database

**To:** 
- **Primary:** Matrix homeserver (all event storage, user data)
- **Optional:** Redis for invite code lookup, caching, rate limiting
- **Optional:** PostgreSQL for MELO-specific metadata not suited for Matrix state

### 6.4 Custom State Events Summary

| Event Type | Room Type | Purpose | State Key |
|------------|-----------|---------|-----------|
| `io.melo.server` | Space | Server metadata (inviteCode, ownerId) | `''` |
| `io.melo.channel` | Room | Channel type (TEXT/AUDIO/VIDEO), creator | `''` |
| `io.melo.channel_order` | Space | Ordered list of channel room IDs | `''` |
| `io.melo.member_role` | Space/Room | Role name for display | `{userId}` |
| `io.melo.profile` | Account Data | Extended profile (email, auth provider ID) | N/A |

### 6.5 Migration Strategy

1. **Phase 1:** Build Matrix SDK service layer matching current API signatures
   - Create `MatrixServerService`, `MatrixChannelService`, etc.
   - Same function signatures as current Prisma-based code
   
2. **Phase 2:** Replace Prisma calls with Matrix SDK calls behind same interface
   - Swap implementation, keep API routes identical
   - Frontend unchanged initially
   
3. **Phase 3:** Remove Socket.io, use Matrix sync directly
   - Replace `useSocket` hooks with Matrix event listeners
   - Remove Socket.io server setup
   
4. **Phase 4:** Remove Prisma/MySQL entirely
   - Delete schema.prisma
   - Remove database dependency

### 6.6 Error Handling Patterns

```typescript
// Matrix SDK errors to HTTP status codes
function matrixToHttpError(error: MatrixError): { status: number; message: string } {
  const code = error.errcode;
  
  const mapping: Record<string, { status: number; message: string }> = {
    'M_FORBIDDEN': { status: 403, message: 'Forbidden' },
    'M_NOT_FOUND': { status: 404, message: 'Not found' },
    'M_UNKNOWN_TOKEN': { status: 401, message: 'Unauthorized' },
    'M_LIMIT_EXCEEDED': { status: 429, message: 'Rate limited' },
    'M_ROOM_IN_USE': { status: 409, message: 'Room already exists' },
  };

  return mapping[code] || { status: 500, message: 'Internal error' };
}
```

---

## 7. Quick Reference: SDK Methods

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SPACES (SERVERS)
// ═══════════════════════════════════════════════════════════════════════════
client.createRoom({ creation_content: { type: 'm.space' } })  // Create space
client.sendStateEvent(spaceId, 'm.space.child', {}, childId)  // Add child room
client.getRoom(spaceId).getChildren()                          // List children

// ═══════════════════════════════════════════════════════════════════════════
// ROOMS (CHANNELS)
// ═══════════════════════════════════════════════════════════════════════════
client.createRoom({ name, preset, initial_state })  // Create room
client.getRoom(roomId)                               // Get room object
client.joinRoom(roomIdOrAlias)                       // Join room
client.leave(roomId)                                 // Leave room

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
client.getStateEvent(roomId, eventType, stateKey?)           // Get state
client.sendStateEvent(roomId, eventType, content, stateKey?) // Set state
client.roomState(roomId)                                      // All room state

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════════════════
room.sendMessage({ msgtype, body, ... })                 // Send message
client.redactEvent(roomId, eventId)                      // Delete/redact
client.createMessagesRequest(roomId, from, limit, dir)   // Paginate history
room.getLiveTimeline().getEvents()                       // Current timeline

// ═══════════════════════════════════════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════════════════════════════════════
client.invite(roomId, userId)          // Invite user
client.kick(roomId, userId, reason?)   // Kick user
client.ban(roomId, userId, reason?)    // Ban user
room.getJoinedMembers()                // List members

// ═══════════════════════════════════════════════════════════════════════════
// FILES
// ═══════════════════════════════════════════════════════════════════════════
client.uploadContent(file)           // Upload → mxc:// URL
client.mxcUrlToHttp(mxcUrl)          // Convert to HTTP URL

// ═══════════════════════════════════════════════════════════════════════════
// SYNC & EVENTS
// ═══════════════════════════════════════════════════════════════════════════
client.startClient()                           // Start sync
client.on('Room.timeline', handler)            // New events
client.on('Room.redaction', handler)           // Deletions
client.on('RoomMember.typing', handler)        // Typing
client.on('Room.receipt', handler)             // Read receipts

// ═══════════════════════════════════════════════════════════════════════════
// ACCOUNT DATA
// ═══════════════════════════════════════════════════════════════════════════
client.getAccountData(type)           // Get account data
client.setAccountData(type, content)  // Set account data
```

---

## 8. Key Complexity Summary

| Area | Complexity | Reason |
|------|------------|--------|
| Invite codes | **Medium** | Need external lookup service (Redis) |
| Power levels cascading | **Medium** | Must update all rooms in space when role changes |
| Message pagination | **Low-Medium** | Matrix tokens vs Prisma cursor (different patterns, same concept) |
| File uploads | **Low** | UploadThing → Matrix content repo (straightforward swap) |
| Channel ordering | **Low** | Custom state event maintains order |
| Member list | **Low** | Aggregate from room state, not DB query |
| Basic CRUD | **Low** | Direct mapping to Matrix SDK |
| Real-time sync | **Very Low** | Matrix handles natively |
| DMs | **Low** | Direct rooms work well |

---

**End of Backend Mapping Document**

*Last updated: 2025-06-29 by audit-02-backend-mapping subagent*
