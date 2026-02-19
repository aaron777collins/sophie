# Matrix Backend Integration for MELO V2 Discord-Clone

This documentation covers the comprehensive Matrix backend integration that provides Discord-like functionality to the MELO V2 frontend.

## Overview

The Matrix backend integration consists of three main layers:

1. **Core Matrix Hooks** (`/lib/matrix/matrix-backend-hooks.ts`) - Direct Matrix SDK integration
2. **Discord Features Service** (`/lib/matrix/discord-features-service.ts`) - Discord-specific functionality
3. **React Integration Hooks** (`/hooks/matrix/use-discord-features.ts`) - Frontend React hooks

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Discord-Clone Frontend                        │
├─────────────────────────────────────────────────────────────────┤
│  React Components (Discord UI)                                   │
│  ├── DiscordChatInterface                                        │
│  ├── DiscordServerSidebar                                        │
│  └── Other Discord UI Components                                 │
├─────────────────────────────────────────────────────────────────┤
│  React Integration Hooks                                         │
│  ├── useFileUpload()                                            │
│  ├── useSlashCommands()                                         │
│  ├── useThreads()                                               │
│  ├── useServerTemplates()                                       │
│  ├── useVoiceChannels()                                         │
│  └── useDirectMessages()                                        │
├─────────────────────────────────────────────────────────────────┤
│  Core Matrix Hooks                                              │
│  ├── useMatrixServers()                                         │
│  ├── useMatrixChannels()                                        │
│  ├── useMatrixMessages()                                        │
│  └── useMatrixPresence()                                        │
├─────────────────────────────────────────────────────────────────┤
│  Discord Features Service                                        │
│  ├── File Upload & Media Handling                               │
│  ├── Slash Commands                                             │
│  ├── Thread Management                                          │
│  ├── Voice Channels                                             │
│  ├── Server Templates                                           │
│  └── Advanced Discord Features                                  │
├─────────────────────────────────────────────────────────────────┤
│                    Matrix SDK                                    │
│  ├── Matrix Client                                              │
│  ├── Room Management                                            │
│  ├── Event Handling                                             │
│  └── State Synchronization                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Core Matrix Hooks

### useMatrixServers()
Manages Discord-like servers using Matrix Spaces.

**Features:**
- Lists all joined Matrix spaces as Discord servers
- Real-time updates for server changes
- Server creation, joining, and leaving
- Unread count and mention tracking

**Usage:**
```typescript
const { servers, loading, joinServer, leaveServer, createServer } = useMatrixServers();

// Create a new server
const serverId = await createServer("My Gaming Server", avatarFile);

// Join an existing server
await joinServer("!serverId:matrix.org");
```

### useMatrixChannels(serverId)
Manages channels within a server using Matrix Rooms.

**Features:**
- Lists channels (Matrix rooms) within a space
- Channel creation and deletion
- Organizes channels into categories
- Real-time updates for channel changes

**Usage:**
```typescript
const { channels, categories, createChannel, deleteChannel } = useMatrixChannels(serverId);

// Create a text channel
const channelId = await createChannel("general", "text");

// Create a voice channel
const voiceChannelId = await createChannel("voice-chat", "voice");
```

### useMatrixMessages(channelId)
Manages Discord-like messaging within a channel.

**Features:**
- Real-time message loading and updates
- Message sending, editing, and deletion
- Reply threading and reactions
- Attachment handling
- Mention and notification support

**Usage:**
```typescript
const { messages, sendMessage, editMessage, addReaction } = useMatrixMessages(channelId);

// Send a message
await sendMessage("Hello, world!");

// Reply to a message
await sendMessage("That's great!", parentMessageId);

// Add a reaction
await addReaction(messageId, "👍");
```

### useMatrixPresence()
Manages user presence and profile information.

**Features:**
- Real-time user presence (online/offline/away)
- Profile management (display name, avatar)
- User status messages
- Presence updates across the application

**Usage:**
```typescript
const { users, currentUser, setPresence, updateProfile } = useMatrixPresence();

// Set your presence
await setPresence("online", "Working on MELO V2");

// Update profile
await updateProfile("New Display Name", avatarFile);
```

## Discord Features Service

The `DiscordFeaturesService` class provides advanced Discord-like functionality built on top of Matrix.

### File Upload and Media Handling

**Features:**
- Progress tracking during uploads
- Automatic thumbnail generation for images
- Support for all file types with proper MIME type detection
- Integration with Matrix media repository

**Example:**
```typescript
const service = new DiscordFeaturesService(matrixClient);

const messageId = await service.uploadFile(
  file,
  channelId,
  (progress) => console.log(`Upload: ${progress}%`)
);
```

### Slash Commands

**Supported Commands:**
- `/nick <nickname>` - Change display name
- `/kick <@user> [reason]` - Kick user from server
- `/ban <@user> [reason]` - Ban user from server
- `/mute <@user> [duration]` - Mute user
- `/topic <topic>` - Set channel topic
- `/invite <@user>` - Invite user to channel

**Example:**
```typescript
await service.handleSlashCommand("nick", ["MyNewNick"], channelId);
await service.handleSlashCommand("kick", ["@troublemaker:matrix.org", "Spam"], channelId);
```

### Thread Management

Creates Discord-style message threads using Matrix's thread relation support.

**Example:**
```typescript
const threadMessageId = await service.createThread(
  parentMessageId,
  channelId,
  "Starting a discussion about this topic"
);
```

### Voice Channel Support

Creates voice channels using Matrix widgets (Jitsi integration).

**Example:**
```typescript
const voiceChannelId = await service.createVoiceChannel(serverId, "General Voice");
```

### Server Templates

Pre-configured server structures for common use cases.

**Available Templates:**
- **Gaming**: Voice channels, LFG, game discussions
- **Study**: Study halls, homework help, collaboration
- **Community**: General social structure with welcome areas

**Example:**
```typescript
const serverId = await service.createServerFromTemplate(SERVER_TEMPLATES.gaming);
```

## React Integration Hooks

### useFileUpload()
React hook for file uploads with progress tracking and state management.

**Features:**
- Multiple concurrent uploads
- Progress tracking per file
- Error handling and retry logic
- Upload cancellation

**Usage:**
```typescript
const { uploads, uploadFile, cancelUpload } = useFileUpload();

// Upload a file
const messageId = await uploadFile(file, channelId);

// Track upload progress
uploads.forEach(upload => {
  console.log(`${upload.file.name}: ${upload.progress}%`);
});
```

### useSlashCommands()
React hook for slash command execution with validation and error handling.

**Usage:**
```typescript
const { executeCommand, getAvailableCommands, isExecuting } = useSlashCommands();

// Execute a command
await executeCommand("/nick MyNewNick", channelId);

// Get command suggestions for autocomplete
const commands = getAvailableCommands();
```

### useThreads(channelId)
React hook for thread management within a channel.

**Usage:**
```typescript
const { threads, createThread, getThread } = useThreads(channelId);

// Create a new thread
const threadId = await createThread(parentMessageId, "Thread starter message");

// Get thread info
const threadInfo = getThread(parentMessageId);
```

### useServerTemplates()
React hook for server template management.

**Usage:**
```typescript
const { createServerFromTemplate, getAvailableTemplates, isCreating } = useServerTemplates();

// Create server from template
const serverId = await createServerFromTemplate("gaming", "My Gaming Community");

// Get available templates for UI
const templates = getAvailableTemplates();
```

### useVoiceChannels(serverId)
React hook for voice channel management within a server.

**Usage:**
```typescript
const { voiceChannels, connectedChannel, joinVoiceChannel, leaveVoiceChannel } = useVoiceChannels(serverId);

// Join a voice channel
await joinVoiceChannel(channelId);

// Leave current voice channel
await leaveVoiceChannel();
```

### useDirectMessages()
React hook for direct message management.

**Usage:**
```typescript
const { directMessages, createDirectMessage, loading } = useDirectMessages();

// Create a new DM
const dmChannelId = await createDirectMessage("@user:matrix.org");
```

## Integration Examples

### Complete Chat Interface

```typescript
function ChatInterface({ serverId, channelId, currentUserId }) {
  // Core Matrix hooks
  const { messages, sendMessage, addReaction } = useMatrixMessages(channelId);
  const { channels } = useMatrixChannels(serverId);
  
  // Discord features
  const { uploadFile } = useFileUpload();
  const { executeCommand } = useSlashCommands();
  const { createThread } = useThreads(channelId);

  const handleSendMessage = async (content: string) => {
    if (content.startsWith('/')) {
      await executeCommand(content, channelId);
    } else {
      await sendMessage(content);
    }
  };

  const handleFileUpload = async (file: File) => {
    await uploadFile(file, channelId);
  };

  // Render Discord-like chat interface
  return (
    <DiscordChatInterface
      serverId={serverId}
      channelId={channelId}
      currentUserId={currentUserId}
    />
  );
}
```

### Server Management

```typescript
function ServerSidebar({ currentUserId, onServerSelect, onChannelSelect }) {
  // Core Matrix hooks
  const { servers, createServer } = useMatrixServers();
  
  // Discord features
  const { createServerFromTemplate, getAvailableTemplates } = useServerTemplates();
  const { directMessages, createDirectMessage } = useDirectMessages();

  const handleCreateServer = async (name: string, template?: string) => {
    if (template) {
      return await createServerFromTemplate(template, name);
    } else {
      return await createServer(name);
    }
  };

  return (
    <DiscordServerSidebar
      currentUserId={currentUserId}
      onServerSelect={onServerSelect}
      onChannelSelect={onChannelSelect}
      onDirectMessageSelect={onDirectMessageSelect}
    />
  );
}
```

## Matrix-to-Discord Feature Mapping

| Discord Feature | Matrix Implementation | Status |
|----------------|----------------------|--------|
| Servers | Matrix Spaces | ✅ Complete |
| Channels | Matrix Rooms | ✅ Complete |
| Text Messages | Matrix m.room.message | ✅ Complete |
| Voice Channels | Matrix Widgets (Jitsi) | ✅ Complete |
| Direct Messages | Matrix Direct Rooms | ✅ Complete |
| File Uploads | Matrix Media Repository | ✅ Complete |
| Message Reactions | Matrix m.reaction | ✅ Complete |
| Message Threads | Matrix m.thread relation | ✅ Complete |
| User Presence | Matrix Presence API | ✅ Complete |
| Server Templates | Custom Matrix Space Creation | ✅ Complete |
| Slash Commands | Custom Command Processing | ✅ Complete |
| User Roles | Matrix Power Levels | ✅ Complete |
| Server Boosts | Custom State Events | ✅ Complete |
| Emoji/Stickers | Matrix Custom Emojis | 🔄 Partial |
| Screen Share | Matrix Widgets Extension | 🔄 Planned |
| Video Calls | Matrix Widgets Enhancement | 🔄 Planned |

## Configuration

### Environment Variables

```env
# Matrix Client Configuration
NEXT_PUBLIC_MATRIX_HOMESERVER_URL=https://matrix.org
NEXT_PUBLIC_MATRIX_IDENTITY_SERVER_URL=https://vector.im

# Optional: Custom Matrix Homeserver
MATRIX_HOMESERVER_URL=https://your-homeserver.com
MATRIX_REGISTRATION_SHARED_SECRET=your-secret

# File Upload Configuration
MAX_UPLOAD_SIZE=50mb
SUPPORTED_FILE_TYPES=image/*,video/*,audio/*,application/pdf,text/*

# Voice Channel Configuration
JITSI_DOMAIN=meet.element.io
VOICE_QUALITY=hd
```

### Matrix Client Setup

```typescript
// pages/_app.tsx or app/layout.tsx
import { MatrixProvider } from '@/lib/matrix/matrix-context';

function MyApp({ Component, pageProps }) {
  return (
    <MatrixProvider>
      <Component {...pageProps} />
    </MatrixProvider>
  );
}
```

## Error Handling

### Common Error Scenarios

1. **Matrix Client Not Available**
   - Check MatrixProvider is properly wrapped
   - Ensure user is authenticated

2. **Permission Denied**
   - User lacks necessary power level
   - Room/space permissions restrict action

3. **Network Errors**
   - Homeserver unreachable
   - Rate limiting active

4. **File Upload Failures**
   - File too large
   - Unsupported file type
   - Homeserver storage full

### Error Handling Pattern

```typescript
try {
  await sendMessage(content);
} catch (error) {
  if (error.message.includes('power level')) {
    showError('You lack permission to perform this action');
  } else if (error.message.includes('rate limit')) {
    showError('Too many requests. Please wait before trying again.');
  } else {
    showError('Failed to send message. Please try again.');
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Message Pagination**: Load messages in batches
2. **Lazy Loading**: Load channels/servers on demand  
3. **Debouncing**: Rate limit real-time updates
4. **Caching**: Cache frequently accessed data
5. **Memory Management**: Clean up event listeners

### Example Optimization

```typescript
const { messages, hasMore, loadMore } = useMatrixMessages(channelId, 25);

// Implement infinite scroll
const handleScroll = useMemo(
  () => debounce(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, 300),
  [hasMore, loading, loadMore]
);
```

## Testing

### Unit Tests

```typescript
// __tests__/matrix-backend-hooks.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMatrixServers } from '@/lib/matrix/matrix-backend-hooks';

test('useMatrixServers loads servers correctly', async () => {
  const { result } = renderHook(() => useMatrixServers());
  
  await act(async () => {
    await result.current.refresh();
  });
  
  expect(result.current.servers).toHaveLength(2);
  expect(result.current.loading).toBe(false);
});
```

### Integration Tests

```typescript
// __tests__/discord-integration.test.ts
test('complete message flow works', async () => {
  // Test message sending, editing, reactions
  const serverId = await createTestServer();
  const channelId = await createTestChannel(serverId);
  
  const messageId = await sendMessage("Test message", channelId);
  expect(messageId).toBeTruthy();
  
  await addReaction(messageId, "👍");
  const reactions = await getMessageReactions(messageId);
  expect(reactions).toContainEqual({ emoji: "👍", count: 1 });
});
```

## Deployment

### Production Checklist

- [ ] Matrix homeserver configured and accessible
- [ ] File upload limits set appropriately
- [ ] Voice channel domain configured
- [ ] Error monitoring integrated
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Backup strategy in place

### Monitoring

Key metrics to track:
- Message send/receive latency
- File upload success rate
- Voice channel connection stability
- Real-time sync performance
- Error rates by feature

## Contributing

### Adding New Discord Features

1. **Add to DiscordFeaturesService**: Core implementation
2. **Create React Hook**: Frontend integration
3. **Update Types**: TypeScript definitions
4. **Add Tests**: Unit and integration tests
5. **Update Documentation**: Feature documentation

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add comprehensive error handling
- Include JSDoc comments for public APIs
- Write tests for all new features

## Support

For issues and questions:
- Check existing GitHub issues
- Review Matrix SDK documentation
- Test with Matrix developer tools
- Create detailed bug reports with reproduction steps