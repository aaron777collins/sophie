# HAOS v2 Multi-Platform Strategy

**Date:** 2026-02-16  
**Author:** Sophie (synthesized from research agents)  
**Goal:** Convert HAOS web app to desktop + mobile with minimal code rewrite and full offline support

---

## Executive Summary

| Platform | Solution | Code Reuse | Timeline | Effort |
|----------|----------|------------|----------|--------|
| **Web** | Enhanced PWA | 100% | Done | - |
| **Desktop** | Tauri | 95%+ | 2-4 weeks | Medium |
| **Mobile** | Capacitor | 95%+ | 1-2 weeks | Low-Medium |
| **Offline** | IndexedDB + SQLite | N/A | 2-3 weeks | Medium |

**Total estimated timeline: 6-8 weeks** for full multi-platform support

---

## Recommended Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HAOS Multi-Platform Architecture                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                        ┌─────────────────┐                          │
│                        │   HAOS Web App  │                          │
│                        │   (Next.js 14)  │                          │
│                        └────────┬────────┘                          │
│                                 │                                    │
│         ┌───────────────────────┼───────────────────────┐           │
│         │                       │                       │           │
│         ▼                       ▼                       ▼           │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐     │
│  │   Desktop   │        │    Web      │        │   Mobile    │     │
│  │   (Tauri)   │        │   (PWA)     │        │ (Capacitor) │     │
│  └──────┬──────┘        └──────┬──────┘        └──────┬──────┘     │
│         │                      │                      │             │
│         ▼                      ▼                      ▼             │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐     │
│  │   SQLite    │        │  IndexedDB  │        │   SQLite    │     │
│  │  (Rust)     │        │  (Dexie.js) │        │ (Capacitor) │     │
│  └─────────────┘        └─────────────┘        └─────────────┘     │
│                                                                      │
│                    ┌─────────────────────────┐                      │
│                    │      Matrix SDK         │                      │
│                    │  (IndexedDBStore built  │                      │
│                    │   in for sync tokens)   │                      │
│                    └─────────────────────────┘                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why These Choices?

### Desktop: Tauri over Electron

| Factor | Tauri | Electron |
|--------|-------|----------|
| Bundle Size | **~2MB** | 150-200MB |
| Memory Usage | ~50-100MB | 300-500MB |
| Startup Time | Fast | Slow |
| Security | Rust memory safety | Node.js concerns |
| Native Features | ✅ Via Rust IPC | ✅ Full Node.js |

**Verdict:** Tauri is 50-100x smaller and uses native WebView. Perfect for a chat app.

### Mobile: Capacitor over React Native

| Factor | Capacitor | React Native |
|--------|-----------|--------------|
| Code Reuse | **95%+** | 20-40% |
| Rewrite Effort | Minimal | Major |
| Implementation | 1-2 weeks | 8-16 weeks |
| Native Push | ✅ | ✅ |
| Matrix SDK | ✅ Works | Needs adapter |

**Verdict:** Capacitor wraps existing Next.js app. React Native would require rebuilding UI from scratch.

### Offline: IndexedDB + SQLite Hybrid

| Platform | Storage | Why |
|----------|---------|-----|
| Web/PWA | IndexedDB (Dexie.js) | Native browser API |
| Desktop | SQLite via Tauri | More reliable, no eviction |
| Mobile | SQLite via Capacitor | iOS can evict IndexedDB! |

**Critical:** iOS Safari can evict IndexedDB under storage pressure. SQLite on mobile prevents data loss.

---

## Implementation Roadmap

### Phase 1: Offline Foundation (Weeks 1-2)
*Shared infrastructure used by all platforms*

1. **Storage Abstraction Layer**
   ```typescript
   // lib/storage/adapter.ts
   interface StorageAdapter {
     init(): Promise<void>;
     getMessages(roomId: string, limit: number): Promise<Message[]>;
     saveMessages(messages: Message[]): Promise<void>;
     getPendingMessages(): Promise<PendingMessage[]>;
   }
   
   // Implementations:
   // - IndexedDBAdapter (web)
   // - SQLiteAdapter (native via Capacitor/Tauri)
   ```

2. **Message Queue for Offline Sends**
   - Store pending messages locally
   - Optimistic UI updates
   - Background sync when online
   - Retry with exponential backoff

3. **Enhanced Service Worker**
   - Cache app shell and static assets
   - Stale-while-revalidate for media
   - Offline fallback page

4. **Matrix SDK Configuration**
   ```typescript
   const store = new IndexedDBStore({
     dbName: 'haos-matrix-store',
     localStorage: window.localStorage, // Sync token
   });
   
   client.startClient({
     initialSyncLimit: 20,
     lazyLoadMembers: true,
   });
   ```

### Phase 2: Enhanced PWA (Week 2)
*Quick wins for web users*

1. Verify/update web app manifest
2. Add install prompt component
3. Test offline message viewing
4. Add network status indicator

### Phase 3: Mobile with Capacitor (Weeks 2-4)

1. **Setup** (Day 1)
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "HAOS" "com.haos.app"
   npx cap add ios
   npx cap add android
   ```

2. **Configure Next.js** (Day 1)
   ```javascript
   // next.config.js
   module.exports = {
     output: 'export',  // Required!
     images: { unoptimized: true },
   };
   ```

3. **Essential Plugins** (Days 2-3)
   ```bash
   npm install @capacitor/push-notifications
   npm install @capacitor/preferences
   npm install @capacitor/keyboard
   npm install @capacitor/status-bar
   npm install @capacitor/splash-screen
   npm install @capacitor-community/sqlite  # For offline
   ```

4. **Push Notifications** (Days 3-5)
   - iOS: Configure APNs certificates
   - Android: Set up FCM
   - Integrate with Matrix push gateway

5. **Native Polish** (Days 5-7)
   - Safe area handling
   - Keyboard behavior
   - Status bar styling
   - Haptic feedback

6. **App Store Submission** (Days 7-10)
   - Screenshots and metadata
   - Privacy manifest (iOS)
   - Review and approval

### Phase 4: Desktop with Tauri (Weeks 4-6)

1. **Setup** (Day 1)
   ```bash
   npm install -D @tauri-apps/cli
   npx tauri init
   ```

2. **Configuration** (Day 1-2)
   ```json
   // tauri.conf.json
   {
     "build": {
       "beforeBuildCommand": "npm run build",
       "frontendDist": "../out"
     }
   }
   ```

3. **Native Features** (Days 3-7)
   ```rust
   // src-tauri/src/main.rs
   #[tauri::command]
   fn show_notification(title: &str, body: &str) {
       Notification::new().title(title).body(body).show().unwrap();
   }
   ```
   - System tray with unread count
   - Native notifications
   - Auto-updater
   - Local SQLite storage

4. **Build Pipeline** (Days 7-10)
   - macOS: Code signing + notarization
   - Windows: Code signing
   - Linux: AppImage + deb

### Phase 5: Testing & Polish (Weeks 6-8)

1. **Cross-Platform Testing**
   - iOS devices (iPhone, iPad)
   - Android devices
   - macOS, Windows, Linux
   - Various network conditions

2. **Offline Scenarios**
   - Send message while offline → queued
   - View old messages while offline → from cache
   - Reconnect → sync pending messages

3. **Performance**
   - Startup time targets
   - Memory usage monitoring
   - Battery impact (mobile)

---

## Required Code Changes

### 1. Next.js Configuration
```javascript
// next.config.js
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  output: 'export',  // Required for Tauri + Capacitor
  images: { unoptimized: true },
  
  // For Tauri dev mode
  assetPrefix: isProd ? undefined : `http://localhost:3000`,
};
```

### 2. Platform Detection
```typescript
// lib/platform.ts
export const isCapacitor = () => 
  typeof window !== 'undefined' && !!(window as any).Capacitor;

export const isTauri = () => 
  typeof window !== 'undefined' && !!(window as any).__TAURI__;

export const isPWA = () => 
  window.matchMedia('(display-mode: standalone)').matches;

export const isNative = () => isCapacitor() || isTauri();
```

### 3. Storage Adapter Pattern
```typescript
// lib/storage/index.ts
import { IndexedDBAdapter } from './indexeddb-adapter';
import { SQLiteAdapter } from './sqlite-adapter';
import { isNative } from '../platform';

export function createStorageAdapter(): StorageAdapter {
  return isNative() ? new SQLiteAdapter() : new IndexedDBAdapter();
}
```

### 4. Native Feature Abstraction
```typescript
// lib/native/notifications.ts
import { isCapacitor, isTauri } from '../platform';

export async function showNotification(title: string, body: string) {
  if (isCapacitor()) {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [{ title, body, id: Date.now() }]
    });
  } else if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/tauri');
    await invoke('show_notification', { title, body });
  } else {
    new Notification(title, { body });
  }
}
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tauri requires static export** | No SSR/API routes | HAOS uses Matrix SDK (client-side), minimal impact |
| **iOS evicts IndexedDB** | Offline data loss | Use SQLite on mobile via Capacitor |
| **iOS kills WebSocket in background** | Miss messages | Push notifications + reconnect on foreground |
| **App store rejections** | Delays | Follow guidelines, proper privacy manifest |
| **Large initial sync** | Poor first experience | Lazy load, sync filters, progress UI |

---

## Success Criteria

- [ ] **Desktop:** Tauri app launches, connects to Matrix, sends/receives messages
- [ ] **Mobile:** iOS + Android apps in stores, push notifications working
- [ ] **Offline:** Can view last 100 messages per room while offline
- [ ] **Offline Send:** Messages queued and sent when back online
- [ ] **Performance:** App starts in <3s on mobile, <1s on desktop
- [ ] **Size:** Desktop bundle <5MB, mobile app <20MB

---

## Resource Links

**Tauri:**
- [Tauri + Next.js Guide](https://tauri.app/v1/guides/getting-started/setup/next-js)
- [Tauri Plugin Ecosystem](https://tauri.app/v1/guides/features/)

**Capacitor:**
- [Capacitor + Next.js Guide](https://capacitorjs.com/solution/nextjs)
- [Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [SQLite Plugin](https://github.com/capacitor-community/sqlite)

**Offline:**
- [Dexie.js Documentation](https://dexie.org/)
- [Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/)
- [Matrix SDK IndexedDB Store](https://matrix-org.github.io/matrix-js-sdk/stable/classes/IndexedDBStore.html)

---

## Next Steps

1. **Immediate:** Review this plan, decide on timeline
2. **Week 1:** Start offline foundation (benefits all platforms)
3. **Week 2-4:** Mobile first (Capacitor) — faster to app stores
4. **Week 4-6:** Desktop (Tauri) — native desktop experience
5. **Ongoing:** Iterate based on user feedback
