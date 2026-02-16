# HAOS v2 Mobile App Options Analysis

**Research Date:** 2026-02-16  
**Researcher:** Research Agent (subagent)  
**Context:** HAOS v2 is a Next.js 14 + React 18 + TypeScript chat app using Matrix SDK with existing PWA service worker support.

---

## Executive Summary

**Recommended Approach: Capacitor (Ionic)**

For HAOS v2's goal of "minimal code rewrite," Capacitor is the clear winner. It wraps your existing Next.js web app in native shells, provides access to native APIs through plugins, and allows App Store deployment—all without rewriting your React codebase.

---

## Option 1: Capacitor (Ionic) ⭐ RECOMMENDED

### What It Is
Capacitor is Ionic's native runtime that wraps web apps (HTML/CSS/JS) in native iOS/Android containers. Unlike Cordova (its predecessor), Capacitor:
- Uses modern native tooling (Swift/Kotlin by default)
- Provides first-class native project access
- Supports Swift Package Manager (experimental in v6)
- Works with ANY web framework, not just Ionic UI

### Next.js Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Static Export | ✅ Works | Must use `output: 'export'` in next.config.js |
| App Router | ✅ Works | Standard client-side routing |
| SSR | ⚠️ Limited | No server-side rendering in native app (expected) |
| API Routes | ⚠️ External | Must use external API server OR static data |
| React 18 | ✅ Works | Full compatibility |

**HAOS-Specific Consideration:** Since HAOS uses Matrix SDK for real-time messaging (client-side WebSocket), this works perfectly with Capacitor. No API routes needed—Matrix handles everything.

### Native Plugin Ecosystem

**Official Plugins (maintained by Ionic):**
| Plugin | Purpose | HAOS Relevance |
|--------|---------|----------------|
| `@capacitor/push-notifications` | Native push notifications | ✅ Critical for chat |
| `@capacitor/local-notifications` | Local alerts | ✅ Useful for mentions |
| `@capacitor/storage` / `@capacitor/preferences` | Key-value storage | ✅ Session persistence |
| `@capacitor/filesystem` | File access | ✅ Media attachments |
| `@capacitor/camera` | Camera access | ✅ Photo messages |
| `@capacitor/share` | Native share sheet | ✅ Share messages |
| `@capacitor/haptics` | Haptic feedback | Nice to have |
| `@capacitor/keyboard` | Keyboard handling | ✅ Chat input UX |
| `@capacitor/splash-screen` | App startup | ✅ Required |
| `@capacitor/status-bar` | Status bar control | ✅ Required |

**Community Plugins:**
- `capacitor-community/sqlite` - SQLite database (good for offline message cache)
- `capacitor-community/background-geolocation` - If location sharing needed

### Offline Storage Options

| Solution | Best For | Complexity |
|----------|----------|------------|
| `@capacitor/preferences` | Simple key-value (auth tokens, settings) | Low |
| IndexedDB (web API) | Message cache, room state | Medium |
| `capacitor-community/sqlite` | Heavy offline-first, complex queries | High |
| Ionic Secure Storage | Encrypted local data | Medium |

**Recommendation for HAOS:**
- Use **IndexedDB** for message caching (Matrix SDK already supports this)
- Use **Preferences** for auth tokens and user settings
- Matrix SDK handles sync state persistence internally

### App Store Deployment

**iOS App Store:**
- Capacitor generates standard Xcode project
- Deploy via Xcode → App Store Connect
- Apple privacy manifests now required (Capacitor 6 includes this)
- Review typically 1-3 days

**Google Play Store:**
- Capacitor generates standard Android Studio project
- Deploy via Play Console
- Must use `androidScheme: 'https'` for Autofill support
- Review typically 1-24 hours

**Ionic Appflow (Optional):**
- Paid service for CI/CD
- Handles builds, signing, submissions
- Over-the-air updates (bypass app store for JS changes)

### Implementation Estimate

| Task | Time | Notes |
|------|------|-------|
| Setup & Configuration | 2-4 hours | Install Capacitor, configure next.config.js |
| iOS/Android Project Generation | 1 hour | `npx cap add ios`, `npx cap add android` |
| Push Notifications Setup | 4-8 hours | APNs certificates, FCM config |
| Native UI Polish | 8-16 hours | Status bar, safe areas, keyboard handling |
| Testing on Devices | 8-16 hours | Device-specific issues |
| App Store Submission | 4-8 hours | Screenshots, descriptions, review |
| **Total** | **27-53 hours** | ~1-2 weeks part-time |

### Capacitor Integration Steps for HAOS

```bash
# 1. Install Capacitor
npm install @capacitor/core
npm install -D @capacitor/cli
npx cap init "HAOS" "com.haos.app"

# 2. Configure Next.js for static export
# In next.config.js:
# output: 'export'
# basePath: '' (or your path)

# 3. Build and add platforms
npm run build  # Creates 'out' directory
npx cap add ios
npx cap add android

# 4. Copy web assets and sync
npx cap sync

# 5. Open in native IDEs
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

---

## Option 2: PWA (Progressive Web App)

### Current PWA Status in HAOS
HAOS v2 already has service worker support for PWA. This provides:
- ✅ Installable on home screen
- ✅ Works offline (if properly cached)
- ✅ Responsive design

### iOS Safari Limitations (iOS 16.4+)

| Feature | iOS Support | Notes |
|---------|-------------|-------|
| Home Screen Install | ✅ Yes | Add to Home Screen |
| Push Notifications | ✅ Yes (16.4+) | Requires user prompt, web app must be installed |
| Background Sync | ❌ No | Limitation for real-time chat |
| Badging API | ❌ No | No unread count on icon |
| Persistent Storage | ⚠️ Limited | Safari may evict after 7 days of no use |
| WebSocket in Background | ❌ No | Connection drops when backgrounded |
| Full Screen Mode | ✅ Yes | When launched from home screen |

**Critical PWA Issue for Chat Apps:**  
iOS terminates WebSocket connections when the app is backgrounded. This means:
- No real-time message delivery while app is closed
- Must re-sync when app reopens
- Push notifications help but feel less responsive

### Android PWA Capabilities

| Feature | Android Support |
|---------|-----------------|
| Push Notifications | ✅ Full support |
| Background Sync | ✅ Yes |
| Badging API | ✅ Yes |
| Persistent Storage | ✅ More reliable |
| WebSocket Background | ⚠️ Limited |

Android PWA is significantly more capable but still lacks the polish of native apps.

### When PWA Is Enough

✅ **PWA is sufficient when:**
- Targeting web-first, mobile as bonus
- Budget is very limited
- No need for app store presence
- Users primarily on Android
- Can accept iOS limitations

❌ **PWA is NOT enough when:**
- Need reliable push notifications
- Need background message delivery
- App store presence is important
- iOS users are significant portion
- Need native features (camera roll, haptics, etc.)

### PWA Recommendation for HAOS

**PWA alone is NOT recommended** for a chat application due to:
1. iOS background limitations break real-time experience
2. Push notification reliability varies
3. No app store discoverability
4. User expectations for chat apps are "native"

**However:** Keep PWA as a complement to native apps. Users who don't want to install can still use the web version.

---

## Option 3: React Native / Expo

### What It Requires

React Native uses native UI components, not a WebView. This means:
- **Complete UI rewrite** - All components must be rebuilt
- **Different navigation** - react-navigation instead of Next.js routing
- **Different styling** - StyleSheet instead of Tailwind CSS
- **Matrix SDK may work** - matrix-js-sdk is JavaScript, may need adjustments

### Rewrite Effort Assessment

| HAOS Component | Rewrite Needed | Effort |
|----------------|----------------|--------|
| Layout (Discord-style) | Full rebuild | High |
| Message List (virtual scroll) | Rebuild with FlatList | High |
| Message Components | Full rebuild | Medium |
| Chat Input | Full rebuild | Medium |
| Emoji Picker | Find RN alternative | Medium |
| Navigation | Rebuild with react-navigation | Medium |
| State Management (Zustand) | ✅ Reusable | Low |
| Matrix SDK Integration | Adapter needed | Medium |
| Authentication Logic | ✅ Mostly reusable | Low |
| **Total Estimated** | **60-80% rebuild** | **8-16 weeks** |

### When React Native Makes Sense

✅ **Choose React Native when:**
- Building from scratch
- Need maximum native performance
- Complex native integrations required
- Long-term investment in mobile-first

❌ **React Native is wrong when:**
- Have existing web app to convert
- Goal is "minimal code rewrite"
- Team expertise is web, not mobile
- Timeline is short

### Expo Benefits (If Going RN Route)

- Managed workflow reduces native config
- EAS Build for cloud builds
- OTA updates via EAS Update
- Rich plugin ecosystem

### React Native Verdict for HAOS

**Not recommended** given the goal of minimal rewrite. Would essentially start over on UI layer. The only code reuse would be:
- Business logic patterns
- Matrix SDK knowledge
- State management concepts

---

## Option 4: Tauri Mobile (Alpha/Beta)

### Current State (2026)

Tauri 2.0 reached **stable release in late 2024** with mobile support. Key points:
- iOS and Android support is "production ready" but newer
- Some desktop plugins not yet ported to mobile
- Smaller mobile ecosystem than Capacitor
- Uses system WebView (like Capacitor)
- Rust backend instead of native platform code

### Tauri Mobile Plugins Available

| Plugin | Status |
|--------|--------|
| NFC | ✅ Available |
| Barcode Scanner | ✅ Available |
| Biometric | ✅ Available |
| Haptics | ✅ Available |
| Geolocation | ✅ Available |
| Push Notifications | ⚠️ Community/Custom |
| Local Notifications | ⚠️ Community |

### Tauri vs Capacitor for HAOS

| Factor | Tauri | Capacitor |
|--------|-------|-----------|
| Mobile Maturity | Newer | Mature |
| Plugin Ecosystem | Growing | Large |
| Push Notifications | Community plugin | Official plugin |
| Next.js Support | ✅ Works | ✅ Works |
| Documentation | Good | Excellent |
| Community Size | Medium | Large |
| Binary Size | Smaller | Larger |
| Backend Language | Rust | Swift/Kotlin |

### Tauri Verdict for HAOS

**Not recommended currently** for HAOS because:
1. Push notifications (critical for chat) need community plugins
2. Smaller mobile ecosystem means more DIY
3. Team would need Rust knowledge for native features
4. Risk of hitting edge cases with less community support

**Worth revisiting** in 12-18 months when mobile ecosystem matures.

---

## Comparison Table

| Factor | Capacitor | PWA | React Native | Tauri |
|--------|-----------|-----|--------------|-------|
| **Code Reuse** | 95%+ | 100% | 20-40% | 95%+ |
| **Rewrite Effort** | Minimal | None | Major | Minimal |
| **Implementation Time** | 1-2 weeks | Already done | 8-16 weeks | 2-3 weeks |
| **iOS Push Notifications** | ✅ Native | ⚠️ Limited | ✅ Native | ⚠️ Custom |
| **Background Messaging** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **App Store Deployment** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Offline Support** | ✅ Excellent | ⚠️ Limited | ✅ Excellent | ✅ Excellent |
| **Native Feel** | Good | Acceptable | Excellent | Good |
| **Learning Curve** | Low | None | High | Medium |
| **Plugin Ecosystem** | Large | N/A | Large | Growing |
| **Production Maturity** | High | High | High | Medium |

---

## Final Recommendation

### Primary: Capacitor

**For HAOS v2, use Capacitor** because it:
1. **Preserves your investment** - 95%+ code reuse
2. **Provides native capabilities** - Push notifications, background sync, native storage
3. **Enables App Store presence** - iOS App Store + Google Play
4. **Has mature ecosystem** - Official plugins for everything HAOS needs
5. **Low risk** - Widely used, well documented, Ionic-backed

### Secondary: Keep PWA

Maintain PWA support as a **fallback/complement**:
- Users who don't want to install get web version
- Rapid testing/previewing
- Markets where app stores are less dominant

### Implementation Priority

1. **Phase 1 (Week 1):** Add Capacitor, basic iOS/Android shells
2. **Phase 2 (Week 2):** Push notifications setup (APNs + FCM)
3. **Phase 3 (Week 3):** Native polish (keyboard handling, status bar, safe areas)
4. **Phase 4 (Week 4):** Testing + App Store submission

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Next.js SSR features don't work | Low | HAOS doesn't rely on SSR for Matrix |
| Matrix SDK WebSocket issues | Medium | Test thoroughly; SDK is web-native |
| iOS App Store rejection | Medium | Follow Apple guidelines, privacy manifest |
| Push notification complexity | Medium | Budget time for APNs/FCM setup |
| Performance on older devices | Low | Virtual scrolling already implemented |

---

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor + Next.js Guide](https://capacitorjs.com/solution/nextjs)
- [Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [iOS Deployment Guide](https://capacitorjs.com/docs/ios/deploying-to-app-store)
- [Android Deployment Guide](https://capacitorjs.com/docs/android/deploying-to-google-play)

---

*Analysis complete. Capacitor is the clear winner for HAOS v2's mobile strategy given the goal of minimal code rewrite while gaining native app capabilities.*
