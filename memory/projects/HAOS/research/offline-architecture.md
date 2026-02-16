# Offline-First Architecture for HAOS v2

**Research Date:** 2026-02-16
**Context:** Next.js 14 + React 18 + TypeScript chat application using Matrix SDK (matrix-js-sdk v32.0.0)
**Platforms:** Web (PWA), Desktop (Tauri), Mobile (Capacitor)

---

## Executive Summary

HAOS v2 requires robust offline-first architecture to provide seamless messaging across unreliable network conditions. This document analyzes storage strategies, sync patterns, and Matrix SDK configuration for true offline support.

**Key Recommendations:**
1. **Primary Storage:** IndexedDB with abstraction layer (Dexie.js)
2. **Sync Strategy:** Optimistic UI with background sync queue
3. **Caching:** Stale-while-revalidate with service worker
4. **Cross-Platform:** IndexedDB works everywhere; SQLite for heavy data on native

---

## 1. Matrix SDK Offline Capabilities

### 1.1 Built-in Storage Options

The matrix-js-sdk provides several store implementations:

| Store Type | Description | Use Case |
|------------|-------------|----------|
| `MemoryStore` | In-memory only, lost on refresh | Development/testing |
| `IndexedDBStore` | Persistent IndexedDB storage | **Recommended for HAOS** |
| `IndexedDBCryptoStore` | E2EE key storage | Required for encrypted rooms |
| `LocalStorageCryptoStore` | Legacy key storage | Not recommended (5MB limit) |

### 1.2 IndexedDB Store Configuration

```typescript
import { MatrixClient, IndexedDBStore, IndexedDBCryptoStore } from 'matrix-js-sdk';

// Create persistent stores
const store = new IndexedDBStore({
  indexedDB: window.indexedDB,
  dbName: 'haos-matrix-store',
  localStorage: window.localStorage, // For sync token persistence
});

const cryptoStore = new IndexedDBCryptoStore(
  window.indexedDB,
  'haos-matrix-crypto'
);

// Initialize the store before creating client
await store.startup();

const client = createClient({
  baseUrl: homeserverUrl,
  accessToken: token,
  userId: userId,
  store: store,
  cryptoStore: cryptoStore,
  
  // Offline-specific options
  timelineSupport: true,
  unstableClientRelationAggregation: true,
});
```

### 1.3 Sync Token Management

Matrix uses sync tokens for efficient reconnection:

```typescript
// Sync token is automatically persisted by IndexedDBStore
// On reconnect, the client resumes from last position

// Configure sync options for offline resilience
client.startClient({
  initialSyncLimit: 20,          // Messages per room on initial sync
  lazyLoadMembers: true,         // Don't load all members initially
  pendingEventOrdering: 'detached', // Allow pending events
  
  // Handle offline gracefully
  pollTimeout: 30000,            // Timeout for /sync requests
  syncOptions: {
    filter: {
      room: {
        timeline: { limit: 50 },
        state: { lazy_load_members: true }
      }
    }
  }
});

// Handle sync state changes
client.on('sync', (state, prevState, data) => {
  switch (state) {
    case 'PREPARED':
      // Initial sync complete, UI ready
      break;
    case 'SYNCING':
      // Normal operation
      break;
    case 'RECONNECTING':
      // Network issues, show offline indicator
      break;
    case 'ERROR':
      // Sync failed, retry logic kicks in
      break;
    case 'STOPPED':
      // Explicitly stopped
      break;
  }
});
```

### 1.4 Message Persistence Options

The IndexedDBStore persists:
- Room state and membership
- Timeline events (configurable depth)
- Read receipts and markers
- Account data
- Sync tokens

**Configuration for deeper offline:**
```typescript
const store = new IndexedDBStore({
  indexedDB: window.indexedDB,
  dbName: 'haos-matrix-store',
  localStorage: window.localStorage,
  
  // Persist more timeline events
  pendingEventOrdering: 'detached',
  timelineSupport: true,
});
```

---

## 2. Offline-First Patterns

### 2.1 Service Worker Caching Strategies

HAOS should use multiple caching strategies based on resource type:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Service Worker Caching Strategy                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Resource Type          Strategy              TTL                    │
│  ─────────────          ────────              ───                    │
│  App Shell (HTML/JS)    Cache-First           30 days (versioned)   │
│  Static Assets          Cache-First           90 days (hashed)       │
│  User Avatars           Stale-While-Rev       7 days                 │
│  Media/Attachments      Cache-First           As available           │
│  API Responses          Network-First         No cache (Matrix)      │
│  Matrix Sync            Network-Only          N/A (WebSocket)        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Implementation with Workbox:**

```typescript
// service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { 
  CacheFirst, 
  StaleWhileRevalidate,
  NetworkFirst 
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache app shell and static assets
precacheAndRoute(self.__WB_MANIFEST);

// Avatar caching - stale-while-revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/_matrix/media/'),
  new StaleWhileRevalidate({
    cacheName: 'matrix-media',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Static assets - cache first with long expiration
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
      }),
    ],
  })
);
```

### 2.2 Background Sync API

For sending messages when offline:

```typescript
// Register background sync for message queue
async function queueOfflineMessage(roomId: string, content: object) {
  const db = await openMessageQueue();
  
  // Store message in IndexedDB
  await db.add('pendingMessages', {
    id: crypto.randomUUID(),
    roomId,
    content,
    timestamp: Date.now(),
    status: 'pending',
  });
  
  // Register sync event
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-messages');
}

// Service worker sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(sendPendingMessages());
  }
});

async function sendPendingMessages() {
  const db = await openMessageQueue();
  const pending = await db.getAll('pendingMessages');
  
  for (const message of pending) {
    try {
      await sendToMatrix(message);
      await db.delete('pendingMessages', message.id);
    } catch (error) {
      if (!isRetryable(error)) {
        await db.delete('pendingMessages', message.id);
      }
      // Retryable errors: sync will retry automatically
      throw error;
    }
  }
}
```

### 2.3 IndexedDB Best Practices for Chat

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IndexedDB Schema Design                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Store: rooms                                                        │
│  ├── Key: roomId                                                     │
│  ├── Index: lastActivity (for sorting)                              │
│  └── Index: spaceId (for grouping)                                  │
│                                                                      │
│  Store: messages                                                     │
│  ├── Key: [roomId, eventId] (compound)                              │
│  ├── Index: roomId (for room queries)                               │
│  ├── Index: timestamp (for sorting)                                 │
│  └── Index: sender (for user queries)                               │
│                                                                      │
│  Store: pendingMessages                                              │
│  ├── Key: localId                                                   │
│  ├── Index: roomId                                                  │
│  └── Index: status (pending/sending/failed)                         │
│                                                                      │
│  Store: media                                                        │
│  ├── Key: mxcUrl                                                    │
│  ├── Blob: content                                                  │
│  └── Index: roomId (for cleanup)                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Practices:**

1. **Granular Updates** - Don't store entire state tree as one record
2. **Compound Indexes** - Enable efficient room+time queries
3. **Batch Operations** - Use transactions for multiple writes
4. **Cleanup Strategy** - Delete old messages to manage quota

```typescript
// Using Dexie.js for cleaner IndexedDB API
import Dexie from 'dexie';

class HaosDatabase extends Dexie {
  rooms!: Dexie.Table<Room, string>;
  messages!: Dexie.Table<Message, [string, string]>;
  pendingMessages!: Dexie.Table<PendingMessage, string>;
  
  constructor() {
    super('haos-offline');
    
    this.version(1).stores({
      rooms: 'id, lastActivity, spaceId',
      messages: '[roomId+eventId], roomId, timestamp, sender',
      pendingMessages: 'localId, roomId, status',
    });
  }
}

// Efficient batch writes
async function saveMessages(messages: Message[]) {
  await db.transaction('rw', db.messages, async () => {
    await db.messages.bulkPut(messages);
  });
}

// Pagination query
async function getMessages(roomId: string, limit = 50, before?: number) {
  return db.messages
    .where('roomId').equals(roomId)
    .and(m => !before || m.timestamp < before)
    .reverse()
    .limit(limit)
    .toArray();
}
```

### 2.4 Conflict Resolution on Reconnect

Matrix handles most conflicts via event ordering, but local pending messages need special handling:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Reconnection Sync Flow                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Client comes online                                              │
│        │                                                             │
│        ▼                                                             │
│  2. Resume sync from last token                                      │
│        │                                                             │
│        ├──► Gap detected? Request gap fill from server              │
│        │                                                             │
│        ▼                                                             │
│  3. Receive new events since disconnect                              │
│        │                                                             │
│        ▼                                                             │
│  4. Merge with local state                                           │
│        │                                                             │
│        ├──► Local events match server? Mark as sent                 │
│        │                                                             │
│        ├──► Server has events we don't? Insert in timeline          │
│        │                                                             │
│        └──► Local pending messages? Send them now                   │
│                                                                      │
│  5. Update UI with reconciled state                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Conflict Resolution Strategy:**

```typescript
interface PendingMessage {
  localId: string;
  roomId: string;
  content: MessageContent;
  timestamp: number;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  serverEventId?: string;
  error?: string;
}

async function reconcileOnReconnect(roomId: string) {
  const pending = await db.pendingMessages
    .where('roomId').equals(roomId)
    .and(m => m.status === 'pending')
    .toArray();
  
  for (const message of pending) {
    try {
      // Update status to prevent duplicate sends
      await db.pendingMessages.update(message.localId, { 
        status: 'sending' 
      });
      
      // Send to Matrix
      const result = await matrixClient.sendMessage(roomId, message.content);
      
      // Link local message to server event
      await db.pendingMessages.update(message.localId, {
        status: 'sent',
        serverEventId: result.event_id,
      });
      
    } catch (error) {
      await db.pendingMessages.update(message.localId, {
        status: 'failed',
        error: error.message,
      });
    }
  }
}
```

### 2.5 Message Queue Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Offline Message Queue                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   User Action                                                        │
│        │                                                             │
│        ▼                                                             │
│   ┌─────────────────┐                                               │
│   │  Create Local   │  Generate UUID, show optimistic UI            │
│   │  Message        │                                                │
│   └────────┬────────┘                                               │
│            │                                                         │
│            ▼                                                         │
│   ┌─────────────────┐       ┌─────────────────┐                     │
│   │  Check Network  │──No──►│  Queue in IDB   │                     │
│   └────────┬────────┘       │  (pendingMsgs)  │                     │
│            │                └────────┬────────┘                     │
│           Yes                        │                               │
│            │                         │ Background Sync               │
│            ▼                         │ triggers when online          │
│   ┌─────────────────┐               │                               │
│   │  Send to Matrix │◄──────────────┘                               │
│   └────────┬────────┘                                               │
│            │                                                         │
│            ├──Success──► Update local message with server ID        │
│            │                                                         │
│            └──Failure──► Retry with exponential backoff             │
│                          (max 3 attempts, then mark failed)          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cross-Platform Storage

### 3.1 Storage Comparison Matrix

| Feature | IndexedDB | SQLite | localStorage | Capacitor Preferences |
|---------|-----------|--------|--------------|----------------------|
| **Capacity** | ~60% disk | Unlimited | 5-10 MB | Small KV only |
| **Web Support** | ✅ Full | ⚠️ WASM | ✅ Full | N/A |
| **iOS Support** | ✅ WebView | ✅ Native | ✅ WebView | ✅ Native |
| **Android Support** | ✅ WebView | ✅ Native | ✅ WebView | ✅ Native |
| **Tauri Support** | ✅ WebView | ✅ Native | ✅ WebView | N/A |
| **Persistence** | Best-effort* | Persistent | Transient | Persistent |
| **Eviction Risk** | Medium | None | High | None |
| **Query Capability** | Indexes | Full SQL | Key only | Key only |
| **Encryption** | Manual | Native option | No | Manual |

*Can request persistent storage via StorageManager API

### 3.2 Platform-Specific Storage Quotas

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Storage Quotas by Platform                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Chrome/Chromium:  Up to 60% of total disk                          │
│  Firefox:          10% of disk OR 10GB (group limit)                │
│  Safari:           ~60% of disk (browser apps)                      │
│  Safari WebView:   ~15% of disk (embedded)                          │
│  Safari (Home):    ~60% of disk (PWA on home screen)                │
│  iOS:              Subject to OS eviction under pressure            │
│  Android:          Persisted storage API available                  │
│                                                                      │
│  ⚠️ IMPORTANT: iOS Safari may evict IndexedDB under storage         │
│     pressure. Use navigator.storage.persist() and show data         │
│     importance to users.                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Recommended Strategy: Unified IndexedDB + Native SQLite

```typescript
// storage-adapter.ts - Unified storage interface

interface StorageAdapter {
  init(): Promise<void>;
  getMessages(roomId: string, limit: number): Promise<Message[]>;
  saveMessages(messages: Message[]): Promise<void>;
  getPendingMessages(): Promise<PendingMessage[]>;
  savePendingMessage(msg: PendingMessage): Promise<void>;
  // ... other methods
}

// Web/PWA: Use IndexedDB via Dexie
class IndexedDBAdapter implements StorageAdapter {
  private db: HaosDatabase;
  
  async init() {
    this.db = new HaosDatabase();
    await this.requestPersistence();
  }
  
  private async requestPersistence() {
    if (navigator.storage?.persist) {
      const persisted = await navigator.storage.persist();
      console.log(`Storage persistence: ${persisted ? 'granted' : 'denied'}`);
    }
  }
  // ... implementation
}

// Capacitor/Tauri: Use SQLite for heavy data
class SQLiteAdapter implements StorageAdapter {
  private db: SQLiteDBConnection;
  
  async init() {
    // Capacitor: @capacitor-community/sqlite
    // Tauri: tauri-plugin-sql
    this.db = await openDatabase('haos.db');
    await this.runMigrations();
  }
  
  private async runMigrations() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        room_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        PRIMARY KEY (room_id, event_id)
      );
      CREATE INDEX IF NOT EXISTS idx_messages_room 
        ON messages(room_id, timestamp DESC);
    `);
  }
  // ... implementation
}

// Factory to select appropriate adapter
function createStorageAdapter(): StorageAdapter {
  if (isCapacitor() || isTauri()) {
    return new SQLiteAdapter();
  }
  return new IndexedDBAdapter();
}
```

### 3.4 Encryption at Rest

**For IndexedDB (Web):**
```typescript
import { encrypt, decrypt } from '@haos/crypto';

// Encrypt sensitive data before storing
async function saveEncryptedMessage(message: Message) {
  const key = await getEncryptionKey(); // From secure key storage
  const encrypted = await encrypt(key, JSON.stringify(message));
  
  await db.encryptedMessages.put({
    id: message.eventId,
    data: encrypted,
    roomId: message.roomId,
  });
}
```

**For SQLite (Native):**
```typescript
// Use SQLCipher or platform encryption
// Capacitor: @capacitor-community/sqlite supports encryption
const db = await SQLiteConnection.createConnection(
  'haos_encrypted',
  true,       // encrypted
  'full',     // mode
  1,          // version
  false       // readOnly
);

await db.open();
await db.execute('PRAGMA key = "your-encryption-key"');
```

---

## 4. Sync Architecture

### 4.1 Optimistic UI Updates

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Optimistic UI Flow                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   User clicks "Send"                                                 │
│         │                                                            │
│         ▼                                                            │
│   ┌─────────────────────────────────────────────────┐               │
│   │ 1. Create local message with tempId             │               │
│   │ 2. Add to UI immediately (with "sending" state) │               │
│   │ 3. Store in IndexedDB as pending                │               │
│   └──────────────────────┬──────────────────────────┘               │
│                          │                                           │
│         ┌────────────────┼────────────────┐                         │
│         │                │                │                         │
│         ▼                ▼                ▼                         │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐                      │
│    │ Success │     │ Timeout │     │ Failure │                      │
│    └────┬────┘     └────┬────┘     └────┬────┘                      │
│         │               │               │                           │
│         ▼               ▼               ▼                           │
│   Replace temp     Show "retrying"  Show error UI                   │
│   with real ID     Keep in queue    Allow retry/delete              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Implementation in React/Zustand:**

```typescript
// message-store.ts
interface MessageStore {
  messages: Map<string, Message[]>;
  pending: Map<string, PendingMessage>;
  
  sendMessage: (roomId: string, content: string) => Promise<void>;
  confirmMessage: (tempId: string, realId: string) => void;
  failMessage: (tempId: string, error: string) => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: new Map(),
  pending: new Map(),
  
  sendMessage: async (roomId, content) => {
    const tempId = `local-${Date.now()}-${Math.random()}`;
    
    const optimisticMessage: PendingMessage = {
      localId: tempId,
      roomId,
      content: { msgtype: 'm.text', body: content },
      timestamp: Date.now(),
      status: 'sending',
      sender: matrixClient.getUserId()!,
    };
    
    // Optimistic update
    set(state => ({
      pending: new Map(state.pending).set(tempId, optimisticMessage),
    }));
    
    // Persist to IndexedDB
    await storage.savePendingMessage(optimisticMessage);
    
    // Try to send (will queue if offline)
    try {
      const result = await matrixClient.sendTextMessage(roomId, content);
      get().confirmMessage(tempId, result.event_id);
    } catch (error) {
      if (!navigator.onLine) {
        // Queue for background sync
        await registerBackgroundSync('sync-messages');
      } else {
        get().failMessage(tempId, error.message);
      }
    }
  },
  
  confirmMessage: (tempId, realId) => {
    set(state => {
      const pending = new Map(state.pending);
      pending.delete(tempId);
      return { pending };
    });
    
    // Remove from IndexedDB pending queue
    storage.removePendingMessage(tempId);
  },
  
  failMessage: (tempId, error) => {
    set(state => {
      const pending = new Map(state.pending);
      const msg = pending.get(tempId);
      if (msg) {
        pending.set(tempId, { ...msg, status: 'failed', error });
      }
      return { pending };
    });
  },
}));
```

### 4.2 Retry Mechanisms

```typescript
// retry-queue.ts
class RetryQueue {
  private queue: Map<string, RetryItem> = new Map();
  private timers: Map<string, number> = new Map();
  
  private readonly MAX_RETRIES = 5;
  private readonly BASE_DELAY = 1000; // 1 second
  private readonly MAX_DELAY = 60000; // 1 minute
  
  async add(id: string, action: () => Promise<void>) {
    this.queue.set(id, { action, attempts: 0 });
    this.scheduleRetry(id);
  }
  
  private scheduleRetry(id: string) {
    const item = this.queue.get(id);
    if (!item || item.attempts >= this.MAX_RETRIES) {
      this.queue.delete(id);
      return;
    }
    
    // Exponential backoff with jitter
    const delay = Math.min(
      this.BASE_DELAY * Math.pow(2, item.attempts) + Math.random() * 1000,
      this.MAX_DELAY
    );
    
    const timer = window.setTimeout(async () => {
      try {
        await item.action();
        this.queue.delete(id);
      } catch (error) {
        item.attempts++;
        this.scheduleRetry(id);
      }
    }, delay);
    
    this.timers.set(id, timer);
  }
  
  cancel(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.queue.delete(id);
  }
}
```

### 4.3 Delta Sync vs Full Sync

Matrix uses **incremental/delta sync** by default via the `/sync` endpoint:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Matrix Sync Strategies                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  INITIAL SYNC (no token):                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Fetches all joined rooms and recent state                 │    │
│  │ • Can be SLOW (10-60+ seconds for large accounts)          │    │
│  │ • Configure with initialSyncLimit to reduce payload        │    │
│  │ • Consider lazy-loading room members                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  INCREMENTAL SYNC (with token):                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Only fetches changes since last sync                     │    │
│  │ • Fast (typically <1 second)                               │    │
│  │ • Token persisted in localStorage by IndexedDBStore        │    │
│  │ • Gap detection if token too old                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  PARTIAL/FILTERED SYNC:                                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Use sync filters to reduce payload                        │    │
│  │ • Lazy-load room members                                    │    │
│  │ • Limit timeline depth                                      │    │
│  │ • Exclude rooms from sync                                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Optimized sync configuration:**

```typescript
// Create sync filter for efficient syncing
const syncFilter = {
  room: {
    timeline: {
      limit: 20, // Messages per room
      lazy_load_members: true,
    },
    state: {
      lazy_load_members: true,
    },
    ephemeral: {
      types: [], // Exclude typing notifications from sync
    },
  },
  presence: {
    types: [], // Exclude presence from initial sync
  },
  account_data: {
    types: ['m.push_rules'], // Only essential account data
  },
};

// Apply filter on client start
client.startClient({
  initialSyncLimit: 20,
  lazyLoadMembers: true,
  filter: syncFilter,
});
```

### 4.4 Complete Sync Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HAOS Offline Sync Architecture                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                          ┌─────────────┐                            │
│                          │  UI Layer   │                            │
│                          │  (React)    │                            │
│                          └──────┬──────┘                            │
│                                 │                                    │
│                          ┌──────▼──────┐                            │
│                          │   Zustand   │                            │
│                          │   Store     │                            │
│                          └──────┬──────┘                            │
│                                 │                                    │
│         ┌───────────────────────┼───────────────────────┐           │
│         │                       │                       │           │
│  ┌──────▼──────┐        ┌───────▼───────┐      ┌───────▼───────┐   │
│  │   Matrix    │        │  Offline      │      │   Message     │   │
│  │   Client    │◄──────►│  Storage      │◄────►│   Queue       │   │
│  │             │        │  (IndexedDB)  │      │               │   │
│  └──────┬──────┘        └───────────────┘      └───────┬───────┘   │
│         │                                              │           │
│         │ /sync                                        │           │
│         │                                              │           │
│  ┌──────▼──────────────────────────────────────────────▼───────┐   │
│  │                     Service Worker                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Cache     │  │  Background │  │   Network Status    │  │   │
│  │  │   Strategy  │  │  Sync       │  │   Monitor           │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                 │                                    │
│                          ┌──────▼──────┐                            │
│                          │   Network   │                            │
│                          │   (Matrix)  │                            │
│                          └─────────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] **Storage Layer**
  - [ ] Set up Dexie.js with IndexedDB schema
  - [ ] Implement storage adapter interface
  - [ ] Add message persistence layer
  - [ ] Request persistent storage permission
  - [ ] Add storage quota monitoring

- [ ] **Matrix SDK Configuration**
  - [ ] Configure IndexedDBStore
  - [ ] Configure IndexedDBCryptoStore
  - [ ] Set up sync filters for efficiency
  - [ ] Implement sync state handling
  - [ ] Add reconnection logic

### Phase 2: Offline Support (Week 2-3)

- [ ] **Service Worker**
  - [ ] Set up Workbox configuration
  - [ ] Implement caching strategies per resource type
  - [ ] Add app shell caching
  - [ ] Implement media caching
  - [ ] Add offline fallback page

- [ ] **Message Queue**
  - [ ] Implement pending message storage
  - [ ] Add optimistic UI updates
  - [ ] Implement background sync registration
  - [ ] Add retry queue with exponential backoff
  - [ ] Handle message reconciliation on reconnect

### Phase 3: User Experience (Week 3-4)

- [ ] **Network Status UI**
  - [ ] Add online/offline indicator
  - [ ] Show pending message states (sending/failed)
  - [ ] Add retry buttons for failed messages
  - [ ] Show sync progress on reconnect

- [ ] **Data Management**
  - [ ] Implement message cleanup (old messages)
  - [ ] Add export/backup functionality
  - [ ] Handle storage quota warnings
  - [ ] Add clear cache option

### Phase 4: Cross-Platform (Week 4-5)

- [ ] **Capacitor Integration**
  - [ ] Set up SQLite adapter
  - [ ] Implement SQLite migrations
  - [ ] Test iOS persistence behavior
  - [ ] Test Android persistence
  - [ ] Add platform-specific optimizations

- [ ] **Tauri Integration**
  - [ ] Configure tauri-plugin-sql
  - [ ] Implement SQLite adapter for Tauri
  - [ ] Test desktop offline behavior

### Phase 5: Testing & Polish (Week 5-6)

- [ ] **Testing**
  - [ ] Unit tests for storage adapters
  - [ ] Integration tests for sync flow
  - [ ] Offline simulation tests
  - [ ] Cross-platform testing
  - [ ] Load testing with large message volumes

- [ ] **Performance**
  - [ ] Profile IndexedDB operations
  - [ ] Optimize batch writes
  - [ ] Implement virtual scrolling with offline data
  - [ ] Monitor and optimize sync performance

---

## 6. Key Dependencies

```json
{
  "dependencies": {
    "matrix-js-sdk": "^32.0.0",
    "dexie": "^4.0.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "workbox-strategies": "^7.0.0",
    "workbox-expiration": "^7.0.0"
  },
  "devDependencies": {
    "workbox-webpack-plugin": "^7.0.0"
  },
  "optionalDependencies": {
    "@capacitor-community/sqlite": "^6.0.0",
    "tauri-plugin-sql-api": "^2.0.0"
  }
}
```

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS evicts IndexedDB | Data loss | Request persistent storage, warn users, sync critical data to server |
| Initial sync slow | Poor UX | Use sync filters, lazy loading, show progress UI |
| Background sync limited on iOS | Messages stuck | Implement app-level retry when foregrounded |
| Storage quota exceeded | Can't save new data | Monitor quota, cleanup old messages, warn user |
| Matrix SDK memory usage | Crashes on mobile | Limit timeline depth, lazy load members |
| Conflicts on reconnect | Duplicate messages | Use Matrix event IDs as source of truth |

---

## References

- [Matrix Spec: Client-Server API](https://spec.matrix.org/v1.6/client-server-api/)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [web.dev: Service Worker Caching Strategies](https://web.dev/articles/service-worker-caching-and-http-caching)
- [web.dev: IndexedDB Best Practices](https://web.dev/articles/indexeddb-best-practices-app-state)
- [MDN: Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Capacitor Storage Guide](https://capacitorjs.com/docs/guides/storage)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
