# Desktop App Options for HAOS v2

**Research Date:** 2026-02-16  
**Context:** Converting HAOS v2 (Next.js 14 + React 18 + TypeScript chat app with Matrix SDK) to native desktop apps

---

## Executive Summary

For HAOS v2, **Tauri is the recommended approach** due to its small bundle size, native performance, and straightforward Next.js integration. However, **enhancing the existing PWA** should be the first step since HAOS already has a service worker and this requires the least effort.

**Recommended Strategy (Phased):**
1. **Phase 1:** Enhance PWA capabilities (immediate, low effort)
2. **Phase 2:** Implement Tauri wrapper (medium effort, high reward)
3. **Skip Electron** unless you need Node.js APIs or legacy OS support

---

## Comparison Table

| Feature | PWA | Tauri | Electron | Neutralino.js |
|---------|-----|-------|----------|---------------|
| **Bundle Size** | 0 MB (web) | ~600KB - 3MB | 150-200+ MB | ~3-5 MB |
| **Memory Usage** | Low (browser tab) | Low (~50-100MB) | High (~150-500MB) | Medium (~80-150MB) |
| **Next.js Compatibility** | ✅ Native | ✅ Static export only | ✅ Full (via Nextron) | ⚠️ Limited |
| **Offline Support** | ✅ Service Workers | ✅ + Local FS | ✅ Full Node.js | ⚠️ Basic |
| **Native Features** | Limited | ✅ Rust IPC | ✅ Full Node.js | ✅ Limited |
| **Auto-Update** | ✅ Automatic (web) | ✅ Built-in | ✅ Squirrel | ⚠️ Manual |
| **System Tray** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Push Notifications** | ✅ Web Push | ✅ Native | ✅ Native | ✅ Native |
| **Code Changes Required** | Minimal | Moderate | Moderate | Moderate |
| **Build Complexity** | None | Medium | High | Low |
| **macOS/Windows/Linux** | Chrome/Edge only | ✅ All | ✅ All | ✅ All |
| **Code Signing** | N/A | Required | Required | Required |
| **Development Speed** | Fast | Medium | Slow | Fast |
| **Maturity/Ecosystem** | Mature | Growing (v2.0) | Mature | Small |

---

## 1. PWA (Progressive Web App)

### How It Works
HAOS already has a service worker foundation. Desktop PWA support lets users "install" the web app via Chrome or Edge, creating a standalone window that behaves like a native app.

### Current State (2026)
- **Chrome/Edge:** Full PWA support with installation prompts
- **Safari:** Limited support (no install prompt, basic offline)
- **Firefox:** No desktop PWA support (discontinued)

### Capabilities
```
✅ Offline viewing (service worker caching)
✅ Push notifications (Web Push API)
✅ Background sync (limited)
✅ File system access (Chrome File System Access API)
✅ Window controls overlay (custom title bar)
✅ App shortcuts
❌ System tray (not possible)
❌ Full filesystem access
❌ System-level integrations
```

### Implementation for HAOS
Since HAOS already has a service worker, enhancements needed:

1. **Add Web App Manifest** (if not present):
```json
{
  "name": "HAOS Chat",
  "short_name": "HAOS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#0f3460",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

2. **Enhance Service Worker for Offline Messages:**
```typescript
// Cache Matrix messages in IndexedDB for offline viewing
const CACHE_NAME = 'haos-v2-cache';

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/messages')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
          return response;
        });
        return cached || fetchPromise;
      })
    );
  }
});
```

### Pros
- **Zero additional bundle size**
- **Automatic updates** (refresh to get new version)
- **Already partially implemented** in HAOS
- **No app store approval** required
- **Single codebase** serves web and desktop

### Cons
- **Browser dependency** (users need Chrome/Edge)
- **No system tray** support
- **Limited native integrations**
- **Can't run native code** (Rust/C++/etc.)
- **Storage limits** (~50MB-100MB depending on browser)

### Effort Estimate
- **1-2 days** to enhance existing service worker
- **No build pipeline changes**

---

## 2. Tauri

### How It Works
Tauri wraps your web app in a native WebView (WKWebView on macOS, WebView2 on Windows, WebKitGTK on Linux). Unlike Electron, it doesn't bundle Chromium—it uses the OS's built-in web renderer.

### Next.js Integration
**Critical requirement:** Tauri requires **static export** (`output: 'export'`). It does NOT support Next.js server-side features (SSR, API routes, etc.).

```javascript
// next.config.js for Tauri
const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

module.exports = {
  output: 'export',  // REQUIRED for Tauri
  images: { unoptimized: true },
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};
```

```json
// tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:3000",
    "frontendDist": "../out"
  }
}
```

### Bundle Size
- **Minimal Tauri app:** ~600KB
- **With plugins:** 1-3MB typical
- **Compared to Electron:** 50-100x smaller

### Offline & Local Storage
```rust
// Tauri Rust command for local storage
#[tauri::command]
fn save_messages(messages: Vec<Message>) -> Result<(), String> {
    let app_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app dir")?;
    let path = app_dir.join("messages.json");
    std::fs::write(path, serde_json::to_string(&messages).unwrap())
        .map_err(|e| e.to_string())
}
```

```typescript
// Frontend: Invoke Tauri command
import { invoke } from '@tauri-apps/api/tauri';

async function saveMessagesLocally(messages: Message[]) {
  await invoke('save_messages', { messages });
}
```

### IPC for Native Features
```rust
// src-tauri/src/main.rs
#[tauri::command]
fn show_notification(title: &str, body: &str) {
    Notification::new()
        .title(title)
        .body(body)
        .show()
        .unwrap();
}
```

### Build Pipeline
```bash
# Development
npm run tauri dev

# Production build (all platforms)
npm run tauri build

# Platform-specific
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### Pros
- **Tiny bundle size** (50-100x smaller than Electron)
- **Low memory usage** (uses system WebView)
- **Security-first** (Rust memory safety, security audits)
- **Native performance** for compute tasks via Rust
- **Built-in auto-updater**
- **Active development** (Tauri 2.0 released, mobile support)

### Cons
- **Static export only** (no SSR, no API routes)
- **WebView inconsistencies** across platforms
- **Rust knowledge required** for native features
- **Smaller ecosystem** than Electron
- **Windows requires WebView2** (auto-installs on Win10+)

### HAOS-Specific Considerations
- Matrix SDK runs in browser → works in Tauri's WebView
- Need to refactor any API routes to external calls
- Service worker still works for offline caching

### Effort Estimate
- **1 week:** Basic Tauri wrapper with existing app
- **2-3 weeks:** Add native features (notifications, tray, local storage)
- **Ongoing:** Platform-specific testing

---

## 3. Electron

### How It Works
Electron bundles Chromium + Node.js with your app. Every Electron app ships its own browser. This enables full Node.js APIs in the main process and consistent rendering across platforms.

### Next.js Integration (via Nextron)
**Nextron** is the standard way to combine Next.js with Electron:

```
my-app/
├── main/
│   ├── background.ts    # Electron main process
│   └── preload.ts       # Preload scripts
├── renderer/
│   ├── pages/           # Next.js pages
│   ├── next.config.js
│   └── tsconfig.json
├── electron-builder.yml
└── package.json
```

```javascript
// renderer/next.config.js
module.exports = {
  output: 'export',
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  trailingSlash: true,
  images: { unoptimized: true },
};
```

### Memory Usage Concerns
- **Idle Electron app:** 150-200MB RAM
- **Active chat app:** 300-500MB+ RAM
- **Multiple windows:** Each adds ~50-100MB

Mitigation strategies:
```javascript
// Disable unneeded features
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,  // Reduces memory
  }
});

// Lazy load windows
function createChatWindow() {
  // Only create when needed
}
```

### Offline Data Persistence
```javascript
// main/background.ts - Using electron-store
import Store from 'electron-store';

const store = new Store({
  name: 'haos-messages',
  encryptionKey: 'your-encryption-key',
});

ipcMain.handle('save-messages', (event, messages) => {
  store.set('messages', messages);
});

ipcMain.handle('load-messages', () => {
  return store.get('messages', []);
});
```

### Auto-Update Mechanisms
```javascript
// main/background.ts
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
  // Notify user
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});
```

**Platform notes:**
- **macOS:** Requires app signing (Apple Developer Program)
- **Windows:** Squirrel.Windows handles updates
- **Linux:** No built-in updater (use package managers)

### Build & Signing
```yaml
# electron-builder.yml
appId: com.haos.chat
productName: HAOS
directories:
  output: dist
  buildResources: resources

mac:
  category: public.app-category.social-networking
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  
win:
  certificateFile: ./certs/win-cert.pfx
  certificatePassword: ${WIN_CERT_PASSWORD}

linux:
  category: Network
  target:
    - AppImage
    - deb
```

### Pros
- **Full Node.js access** (filesystem, native modules)
- **Consistent rendering** (same Chromium everywhere)
- **Mature ecosystem** (thousands of plugins)
- **Proven at scale** (VS Code, Slack, Discord)
- **Best debugging tools** (Chrome DevTools built-in)

### Cons
- **Huge bundle size** (150-200MB minimum)
- **High memory usage** (Chromium overhead)
- **Slow startup** (loading entire browser)
- **Security concerns** (requires careful IPC design)
- **Complex build pipeline**

### Effort Estimate
- **2 weeks:** Basic Nextron setup and working app
- **3-4 weeks:** Production-ready with auto-update, signing
- **Ongoing:** Platform testing, memory optimization

---

## 4. Neutralino.js

### How It Works
Similar to Tauri—uses system WebView instead of bundling Chromium. Written in C++ (not Rust). Communicates via WebSocket instead of IPC.

### Viability for Complex Apps
**Not recommended for HAOS** because:
- WebSocket IPC adds latency for real-time chat
- Smaller community, fewer resources
- Less mature than Tauri
- No official Next.js guide

### When to Use
- Simple utility apps
- When Rust knowledge is a barrier
- Rapid prototyping
- Apps that don't need complex native integrations

### When NOT to Use
- Real-time applications (chat, gaming)
- Apps needing extensive native APIs
- Production apps requiring long-term support

### Pros
- Small bundle (~3-5MB)
- Easy to learn (C++ or extensions)
- Cross-platform

### Cons
- WebSocket overhead for IPC
- Smaller ecosystem
- Less active development than Tauri
- Security model less robust

### Effort Estimate
- **Not recommended for HAOS**

---

## Recommended Approach for HAOS

### Phase 1: Enhance PWA (Week 1)
**Minimal effort, immediate benefit**

1. Verify/add web app manifest
2. Enhance service worker for message caching
3. Implement IndexedDB for offline message storage
4. Add install prompt for Chrome/Edge users
5. Test offline mode

**Changes required:**
- `public/manifest.json` — web app manifest
- `public/sw.js` or service worker config — enhanced caching
- `lib/offlineStorage.ts` — IndexedDB wrapper for messages

### Phase 2: Tauri Wrapper (Weeks 2-4)
**Best balance of size, performance, and features**

1. Set up Tauri project alongside existing Next.js
2. Configure static export in `next.config.js`
3. Implement native notifications via Tauri
4. Add system tray with unread count
5. Local message persistence via Rust commands
6. Auto-update configuration
7. Code signing for Mac/Windows

**Changes required:**
```
haos-v2/
├── src-tauri/           # NEW: Tauri backend
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── next.config.js       # MODIFY: Add output: 'export'
├── package.json         # MODIFY: Add tauri scripts
└── ... existing files
```

### Skip Electron Unless:
- You need to run native Node.js modules (unlikely for chat)
- You require Windows 7/8 support (WebView2 needs Win10+)
- You have specific Electron plugins you depend on

---

## Implementation Complexity Summary

| Option | Code Changes | Build Pipeline | Deployment | Total Effort |
|--------|--------------|----------------|------------|--------------|
| **PWA Enhancement** | Low | None | Existing web deploy | **1-2 days** |
| **Tauri** | Medium | New Rust/Cargo | Desktop releases | **2-4 weeks** |
| **Electron** | Medium | Complex | Desktop releases | **4-6 weeks** |
| **Neutralino** | Medium | New C++ | Desktop releases | **Not recommended** |

---

## Required Changes to HAOS Codebase

### For PWA Enhancement
1. Add/update `public/manifest.json`
2. Enhance service worker caching strategy
3. Add offline message storage (IndexedDB)
4. Add install banner component

### For Tauri Integration
1. **next.config.js:** Add `output: 'export'`, disable image optimization
2. **API Routes:** Move to external service or remove (Tauri can't do SSR)
3. **Environment Detection:** Add `typeof window !== 'undefined' && window.__TAURI__`
4. **Native Features:** Create abstraction layer:
   ```typescript
   // lib/native.ts
   export async function showNotification(title: string, body: string) {
     if (window.__TAURI__) {
       await invoke('show_notification', { title, body });
     } else {
       new Notification(title, { body });
     }
   }
   ```
5. **Build Scripts:** Add Tauri commands to `package.json`

---

## Conclusion

**For HAOS v2, the recommended path is:**

1. **Immediate:** Enhance PWA for quick offline wins
2. **Short-term:** Implement Tauri for native desktop experience
3. **Avoid:** Electron (overkill for a chat app, huge bundles)
4. **Skip:** Neutralino (not mature enough for real-time chat)

Tauri + enhanced PWA gives you:
- 🚀 Tiny bundles (~2MB vs 200MB)
- 💾 Full offline capability
- 🔔 Native notifications
- 🖥️ System tray presence
- 🔄 Auto-updates
- 🔒 Security-audited framework
- 📱 Future mobile support (Tauri 2.0)
