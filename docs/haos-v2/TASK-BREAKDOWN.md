# HAOS v2 Task Breakdown

**Generated:** 2025-02-13  
**Based on:** IMPLEMENTATION-PLAN.md  
**Purpose:** Atomic, actionable, testable sub-tasks for implementation

---

## Legend

| Status | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔵 | In progress |
| ✅ | Complete |
| ❌ | Blocked |

---

## Phase 0: Foundation (2 weeks)

### 0.1 Dev Environment Setup (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 0.1.1 | Create monorepo root with pnpm workspaces | `package.json`, `pnpm-workspace.yaml` | `pnpm install` runs without errors | 1h |
| 0.1.2 | Configure TypeScript for monorepo | `tsconfig.json`, `tsconfig.base.json` | `tsc --noEmit` passes | 1h |
| 0.1.3 | Create apps/web Next.js structure | `apps/web/package.json`, `apps/web/next.config.js` | `pnpm dev` starts Next.js | 2h |
| 0.1.4 | Set up Tailwind CSS | `apps/web/tailwind.config.ts`, `apps/web/globals.css` | Tailwind classes work in components | 1h |
| 0.1.5 | Configure ESLint + Prettier | `.eslintrc.js`, `.prettierrc` | `pnpm lint` passes | 1h |
| 0.1.6 | Set up path aliases | `tsconfig.json` paths, `next.config.js` | `@/components/...` imports work | 30m |
| 0.1.7 | Create .env.example with all required vars | `apps/web/.env.example` | All env vars documented | 30m |
| 0.1.8 | Add editorconfig and gitignore | `.editorconfig`, `.gitignore` | IDE consistency, no build artifacts in git | 15m |

### 0.2 Matrix Homeserver Setup (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 0.2.1 | Verify Synapse running on dev2 | N/A (infrastructure) | `curl https://matrix.haos.local/_matrix/client/versions` returns JSON | 1h |
| 0.2.2 | Create test user accounts | N/A (admin API) | Can login as test@haos.local, test2@haos.local | 1h |
| 0.2.3 | Configure CORS for dev frontend | `homeserver.yaml` additions | Frontend can make requests without CORS errors | 2h |
| 0.2.4 | Create test space and rooms | N/A (manual/script) | Test space with #general, #random channels exists | 1h |
| 0.2.5 | Document Matrix admin commands | `docs/haos-v2/MATRIX-ADMIN.md` | Common admin operations documented | 2h |
| 0.2.6 | Set up Matrix admin token for dev | `.env.local` | `MATRIX_ADMIN_TOKEN` available for admin ops | 30m |

### 0.3 LiveKit Configuration (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 0.3.1 | Verify LiveKit server on dev2 | N/A (infrastructure) | LiveKit health endpoint returns OK | 30m |
| 0.3.2 | Configure env vars for LiveKit | `.env.local` | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL` set | 30m |
| 0.3.3 | Test JWT token generation | `scripts/test-livekit.ts` | Can generate valid room token | 1h |
| 0.3.4 | Test basic voice call | Manual test | Two browsers can voice chat | 1h |

### 0.4 Element Web Fork (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 0.4.1 | Clone Element Web 1.12.9 | `packages/element-web/` or reference | Local copy accessible | 30m |
| 0.4.2 | Build Element Web locally | N/A | `yarn build` succeeds | 1h |
| 0.4.3 | Run Element Web dev server | N/A | Can login to Matrix via Element UI | 1h |
| 0.4.4 | Document Element Web key patterns | `docs/haos-v2/ELEMENT-PATTERNS.md` | Auth, sync, media patterns documented | 2h |
| 0.4.5 | Identify reusable Element utilities | `docs/haos-v2/ELEMENT-REUSABLE.md` | List of utilities to extract/reference | 2h |

### 0.5 Discord Clone Extraction (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 0.5.1 | Clone Discord clone repo | Local clone | Full repo accessible | 15m |
| 0.5.2 | Copy UI components to apps/web/components/ui | `apps/web/components/ui/*.tsx` | Base UI components (Button, Input, etc.) available | 2h |
| 0.5.3 | Copy navigation components | `apps/web/components/navigation/*.tsx` | Sidebar, channel list skeletons available | 2h |
| 0.5.4 | Copy modal components | `apps/web/components/modals/*.tsx` | Modal shells available | 2h |
| 0.5.5 | Copy chat components | `apps/web/components/chat/*.tsx` | Message display shells available | 2h |
| 0.5.6 | Copy providers (strip Clerk/Prisma) | `apps/web/components/providers/*.tsx` | Provider shells with TODOs for Matrix | 2h |
| 0.5.7 | Copy hooks (strip Clerk/Prisma) | `apps/web/hooks/*.ts` | Hook shells with TODOs for Matrix | 1h |
| 0.5.8 | Copy lib utilities | `apps/web/lib/*.ts` | Utils (cn, etc.) available | 1h |
| 0.5.9 | Verify imports resolve | N/A | `pnpm build` passes with extracted components | 1h |

### 0.6 CI/CD Pipeline (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 0.6.1 | Create GitHub Actions build workflow | `.github/workflows/build.yml` | Build runs on PR | 2h |
| 0.6.2 | Add lint check to CI | `.github/workflows/build.yml` | Lint fails CI if errors | 1h |
| 0.6.3 | Add TypeScript check to CI | `.github/workflows/build.yml` | Type errors fail CI | 1h |
| 0.6.4 | Set up branch protection rules | GitHub settings | PRs require passing CI | 30m |
| 0.6.5 | Add dependency caching | `.github/workflows/build.yml` | pnpm cache reduces build time | 1h |
| 0.6.6 | Create preview deployment workflow | `.github/workflows/preview.yml` | PRs get preview URL (optional) | 2h |

### 0.7 Development Docs (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 0.7.1 | Write setup guide | `docs/haos-v2/SETUP-GUIDE.md` | New dev can set up in <30 min | 3h |
| 0.7.2 | Write architecture overview | `docs/haos-v2/ARCHITECTURE.md` | High-level structure documented | 3h |
| 0.7.3 | Document coding conventions | `docs/haos-v2/CONVENTIONS.md` | Naming, file structure, patterns | 2h |
| 0.7.4 | Create component development guide | `docs/haos-v2/COMPONENT-GUIDE.md` | How to create new components | 2h |
| 0.7.5 | Document Matrix integration patterns | `docs/haos-v2/MATRIX-PATTERNS.md` | How to use Matrix SDK in components | 3h |
| 0.7.6 | Create README.md for repo root | `README.md` | Project overview, quick start | 1h |

---

## Phase 1: Core Integration (6-8 weeks)

### 1.1 Authentication Migration (2-3 weeks)

#### 1.1.1 MatrixAuthProvider (3 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.1.1a | Create auth types | `apps/web/types/auth.ts` | User, Session, AuthState types defined | 1h |
| 1.1.1b | Create MatrixAuthContext | `apps/web/contexts/matrix-auth-context.ts` | Context type exported | 1h |
| 1.1.1c | Implement MatrixAuthProvider shell | `apps/web/components/providers/matrix-auth-provider.tsx` | Provider renders children | 2h |
| 1.1.1d | Add matrix-js-sdk dependency | `apps/web/package.json` | SDK installed and importable | 30m |
| 1.1.1e | Implement createMatrixClient helper | `apps/web/lib/matrix-client.ts` | Client instance created with homeserver URL | 2h |
| 1.1.1f | Implement login method in provider | `matrix-auth-provider.tsx` | `login(username, password)` returns session | 4h |
| 1.1.1g | Implement logout method | `matrix-auth-provider.tsx` | `logout()` clears session, stops client | 2h |
| 1.1.1h | Implement session restore | `matrix-auth-provider.tsx` | On mount, restore session from storage | 3h |
| 1.1.1i | Add loading states | `matrix-auth-provider.tsx` | `isLoading`, `isAuthenticated` exposed | 1h |
| 1.1.1j | Create useAuth hook | `apps/web/hooks/use-auth.ts` | Hook to access auth context | 1h |

#### 1.1.2 Login Page (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.1.2a | Create login page route | `apps/web/app/(auth)/sign-in/page.tsx` | Page renders at /sign-in | 30m |
| 1.1.2b | Create login form component | `apps/web/components/auth/login-form.tsx` | Form with username, password fields | 2h |
| 1.1.2c | Add form validation | `login-form.tsx` | Required fields, error display | 2h |
| 1.1.2d | Connect to MatrixAuthProvider | `login-form.tsx` | Calls `login()` on submit | 2h |
| 1.1.2e | Add error handling | `login-form.tsx` | Invalid credentials shown | 1h |
| 1.1.2f | Add loading state | `login-form.tsx` | Button disabled while loading | 1h |
| 1.1.2g | Redirect on success | `login-form.tsx` | Navigate to / after login | 1h |
| 1.1.2h | Style login page | `login-form.tsx`, CSS | Discord-style dark theme | 2h |

#### 1.1.3 Registration Page (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.1.3a | Create register page route | `apps/web/app/(auth)/sign-up/page.tsx` | Page renders at /sign-up | 30m |
| 1.1.3b | Create registration form | `apps/web/components/auth/register-form.tsx` | Username, email, password, confirm fields | 2h |
| 1.1.3c | Implement Matrix registration | `matrix-auth-provider.tsx` | `register()` method using SDK | 4h |
| 1.1.3d | Add password strength validation | `register-form.tsx` | Minimum requirements shown | 2h |
| 1.1.3e | Add username availability check | `register-form.tsx` | Check username before submit | 2h |
| 1.1.3f | Handle captcha if required | `register-form.tsx` | Support homeserver captcha flow | 2h |
| 1.1.3g | Style registration page | `register-form.tsx`, CSS | Match login page style | 1h |

#### 1.1.4 Session Persistence (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.1.4a | Create session storage utilities | `apps/web/lib/session-storage.ts` | Save/load/clear session functions | 2h |
| 1.1.4b | Implement secure token storage | `session-storage.ts` | Tokens in httpOnly cookie or encrypted localStorage | 3h |
| 1.1.4c | Add device ID persistence | `session-storage.ts` | Device ID survives refresh | 1h |
| 1.1.4d | Implement session validation | `lib/matrix-auth.ts` | Validate stored session on load | 2h |
| 1.1.4e | Handle session expiry | `matrix-auth-provider.tsx` | Redirect to login on invalid session | 2h |
| 1.1.4f | Add "remember me" option | `login-form.tsx`, `session-storage.ts` | Persistent vs session-only storage | 2h |

#### 1.1.5 Server-Side Auth (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.1.5a | Create getMatrixSession server utility | `apps/web/lib/server/get-session.ts` | Extract session from cookies server-side | 3h |
| 1.1.5b | Create requireAuth wrapper | `apps/web/lib/server/require-auth.ts` | Throws if not authenticated | 2h |
| 1.1.5c | Create server-side Matrix client | `apps/web/lib/server/matrix-client.ts` | Client for API routes | 3h |
| 1.1.5d | Add session to API route handlers | Example in `apps/web/app/api/` | API routes can access user | 2h |
| 1.1.5e | Handle token refresh server-side | `get-session.ts` | Refresh token if expired | 2h |

#### 1.1.6 Middleware (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.1.6a | Create Next.js middleware | `apps/web/middleware.ts` | Middleware runs on requests | 1h |
| 1.1.6b | Define protected routes | `middleware.ts` | List of routes requiring auth | 1h |
| 1.1.6c | Redirect unauthenticated users | `middleware.ts` | /servers/* redirects to /sign-in | 2h |
| 1.1.6d | Redirect authenticated from auth pages | `middleware.ts` | /sign-in redirects to / if logged in | 1h |
| 1.1.6e | Add session validation in middleware | `middleware.ts` | Validate session exists and not expired | 2h |

#### 1.1.7 Remove Clerk (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.1.7a | Remove @clerk/nextjs dependency | `package.json` | No Clerk in deps | 30m |
| 1.1.7b | Delete ClerkProvider usage | All files | No imports from @clerk | 1h |
| 1.1.7c | Delete lib/current-profile.ts | Delete file | File removed | 15m |
| 1.1.7d | Delete lib/current-profile-pages.ts | Delete file | File removed | 15m |
| 1.1.7e | Delete lib/initial-profile.ts | Delete file | File removed | 15m |
| 1.1.7f | Update all auth references | All components | Use MatrixAuthProvider instead | 3h |
| 1.1.7g | Verify no Clerk references remain | `grep -r "clerk"` | Zero results | 30m |

### 1.2 Real-Time Migration (2-3 weeks)

#### 1.2.1 MatrixProvider (3 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.2.1a | Create MatrixContext type | `apps/web/contexts/matrix-context.ts` | Client, sync state, rooms exposed | 1h |
| 1.2.1b | Create MatrixProvider shell | `apps/web/components/providers/matrix-provider.tsx` | Provider renders children | 1h |
| 1.2.1c | Start Matrix sync on mount | `matrix-provider.tsx` | `client.startClient()` called | 2h |
| 1.2.1d | Track sync state | `matrix-provider.tsx` | `syncState` exposed (PREPARED, SYNCING, ERROR) | 2h |
| 1.2.1e | Build room list from sync | `matrix-provider.tsx` | `rooms` array updated on sync | 3h |
| 1.2.1f | Handle sync errors | `matrix-provider.tsx` | Error state, retry logic | 2h |
| 1.2.1g | Stop sync on unmount | `matrix-provider.tsx` | Clean shutdown | 1h |
| 1.2.1h | Create useMatrix hook | `apps/web/hooks/use-matrix.ts` | Hook to access Matrix context | 1h |
| 1.2.1i | Implement room event handlers | `matrix-provider.tsx` | Listen for room events | 3h |
| 1.2.1j | Add reconnection logic | `matrix-provider.tsx` | Auto-reconnect on connection loss | 2h |

#### 1.2.2 useRoomMessages Hook (3 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.2.2a | Create hook shell | `apps/web/hooks/use-room-messages.ts` | Takes roomId, returns messages array | 1h |
| 1.2.2b | Load initial timeline | `use-room-messages.ts` | Get last N messages on mount | 3h |
| 1.2.2c | Subscribe to new messages | `use-room-messages.ts` | New messages appear in real-time | 3h |
| 1.2.2d | Handle message edits | `use-room-messages.ts` | Edited messages update in place | 2h |
| 1.2.2e | Handle message deletions | `use-room-messages.ts` | Deleted messages removed/redacted | 2h |
| 1.2.2f | Implement pagination | `use-room-messages.ts` | `loadMore()` fetches older messages | 3h |
| 1.2.2g | Transform Matrix events to message format | `use-room-messages.ts` | Discord-style message objects | 2h |
| 1.2.2h | Handle decryption for E2EE rooms | `use-room-messages.ts` | Encrypted messages decrypted | 3h |
| 1.2.2i | Add loading states | `use-room-messages.ts` | `isLoading`, `hasMore` exposed | 1h |

#### 1.2.3 useTypingIndicator Hook (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.2.3a | Create hook shell | `apps/web/hooks/use-typing-indicator.ts` | Takes roomId, returns typing users | 30m |
| 1.2.3b | Subscribe to m.typing events | `use-typing-indicator.ts` | Listen for typing notifications | 2h |
| 1.2.3c | Send typing notification | `use-typing-indicator.ts` | `sendTyping(isTyping)` method | 2h |
| 1.2.3d | Auto-stop typing after timeout | `use-typing-indicator.ts` | Stop after 5s of inactivity | 1h |
| 1.2.3e | Filter out current user | `use-typing-indicator.ts` | Don't show self as typing | 30m |

#### 1.2.4 usePresence Hook (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.2.4a | Create hook shell | `apps/web/hooks/use-presence.ts` | Get/set user presence | 30m |
| 1.2.4b | Subscribe to presence events | `use-presence.ts` | Track online/offline/away status | 2h |
| 1.2.4c | Set own presence | `use-presence.ts` | `setPresence(status)` method | 2h |
| 1.2.4d | Get user presence | `use-presence.ts` | `getPresence(userId)` method | 1h |
| 1.2.4e | Cache presence state | `use-presence.ts` | Avoid redundant API calls | 1h |

#### 1.2.5 useReadReceipts Hook (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.2.5a | Create hook shell | `apps/web/hooks/use-read-receipts.ts` | Track read state per room | 30m |
| 1.2.5b | Subscribe to m.receipt events | `use-read-receipts.ts` | Track who read what | 2h |
| 1.2.5c | Send read receipt | `use-read-receipts.ts` | Mark message as read | 2h |
| 1.2.5d | Calculate unread count | `use-read-receipts.ts` | Return unread message count | 2h |
| 1.2.5e | Mark room as read | `use-read-receipts.ts` | Clear unread state | 1h |

#### 1.2.6 Connection Status (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.2.6a | Create ConnectionIndicator component | `apps/web/components/connection-indicator.tsx` | Shows connection state | 2h |
| 1.2.6b | Show connecting state | `connection-indicator.tsx` | Yellow indicator while syncing | 1h |
| 1.2.6c | Show disconnected state | `connection-indicator.tsx` | Red indicator when offline | 1h |

#### 1.2.7 Remove Socket.io (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.2.7a | Remove socket.io dependencies | `package.json` | No socket.io packages | 30m |
| 1.2.7b | Delete socket-provider.tsx | Delete file | File removed | 15m |
| 1.2.7c | Delete use-chat-socket.ts | Delete file | File removed | 15m |
| 1.2.7d | Delete pages/api/socket/ directory | Delete directory | All socket API routes removed | 30m |
| 1.2.7e | Update components using socket | All components | Use Matrix hooks instead | 3h |
| 1.2.7f | Verify no socket references | `grep -r "socket"` | Zero results (except Matrix SDK) | 30m |

### 1.3 Media Upload Migration (1 week)

#### 1.3.1 useMediaUpload Hook (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.3.1a | Create hook shell | `apps/web/hooks/use-media-upload.ts` | Upload file, return mxc URL | 1h |
| 1.3.1b | Implement file upload | `use-media-upload.ts` | `client.uploadContent()` wrapper | 3h |
| 1.3.1c | Add progress tracking | `use-media-upload.ts` | `progress` percentage exposed | 2h |
| 1.3.1d | Add upload cancellation | `use-media-upload.ts` | `cancel()` method | 2h |
| 1.3.1e | Handle upload errors | `use-media-upload.ts` | Error state, retry logic | 2h |
| 1.3.1f | Add file validation | `use-media-upload.ts` | Check size, type limits | 1h |
| 1.3.1g | Support multiple files | `use-media-upload.ts` | Upload array of files | 2h |

#### 1.3.2 useMxcUrl Hook (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.3.2a | Create mxc to HTTP converter | `apps/web/hooks/use-mxc-url.ts` | Convert mxc:// to https:// | 2h |
| 1.3.2b | Support thumbnail dimensions | `use-mxc-url.ts` | Generate thumbnail URL with size | 1h |
| 1.3.2c | Cache converted URLs | `use-mxc-url.ts` | Memoize conversions | 1h |

#### 1.3.3 MatrixImage Component (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.3.3a | Create image component | `apps/web/components/matrix-image.tsx` | Display Matrix-hosted images | 2h |
| 1.3.3b | Add thumbnail support | `matrix-image.tsx` | Load thumbnails first | 2h |
| 1.3.3c | Add loading skeleton | `matrix-image.tsx` | Placeholder while loading | 1h |
| 1.3.3d | Add error fallback | `matrix-image.tsx` | Show broken image placeholder | 1h |
| 1.3.3e | Add lazy loading | `matrix-image.tsx` | IntersectionObserver for viewport | 1h |

#### 1.3.4 FileUpload Component (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.3.4a | Create dropzone component | `apps/web/components/file-upload.tsx` | Drag-drop file upload | 3h |
| 1.3.4b | Add file preview | `file-upload.tsx` | Show thumbnail/icon before upload | 2h |
| 1.3.4c | Add progress indicator | `file-upload.tsx` | Upload progress bar | 1h |
| 1.3.4d | Connect to useMediaUpload | `file-upload.tsx` | Actually upload files | 1h |

#### 1.3.5 MessageAttachment Component (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.3.5a | Create attachment display | `apps/web/components/message-attachment.tsx` | Display file in message | 2h |
| 1.3.5b | Handle image attachments | `message-attachment.tsx` | Show inline image | 1h |
| 1.3.5c | Handle file attachments | `message-attachment.tsx` | Show download link | 1h |

#### 1.3.6 Remove UploadThing (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.3.6a | Remove uploadthing dependency | `package.json` | No uploadthing packages | 30m |
| 1.3.6b | Delete uploadthing config | Delete config files | No uploadthing config | 30m |
| 1.3.6c | Update components using uploadthing | All components | Use Matrix upload instead | 2h |
| 1.3.6d | Verify no uploadthing references | `grep -r "uploadthing"` | Zero results | 30m |

### 1.4 Core UI Integration (2 weeks)

#### 1.4.1 Space Service (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.4.1a | Create space service | `apps/web/services/matrix-space.ts` | Space CRUD operations | 1h |
| 1.4.1b | Implement createSpace | `matrix-space.ts` | Create Matrix space with metadata | 3h |
| 1.4.1c | Implement getSpaces | `matrix-space.ts` | List user's spaces | 2h |
| 1.4.1d | Implement getSpace | `matrix-space.ts` | Get single space details | 1h |
| 1.4.1e | Implement updateSpace | `matrix-space.ts` | Update space name, avatar | 2h |
| 1.4.1f | Implement deleteSpace | `matrix-space.ts` | Delete/leave space | 2h |
| 1.4.1g | Implement joinSpace | `matrix-space.ts` | Join via invite/public | 2h |
| 1.4.1h | Add io.haos.server state event | `matrix-space.ts` | Store inviteCode, ownerId | 2h |

#### 1.4.2 Room Service (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.4.2a | Create room service | `apps/web/services/matrix-room.ts` | Room CRUD operations | 1h |
| 1.4.2b | Implement createRoom | `matrix-room.ts` | Create room in space | 3h |
| 1.4.2c | Implement getRooms | `matrix-room.ts` | List rooms in space | 2h |
| 1.4.2d | Implement getRoom | `matrix-room.ts` | Get room details | 1h |
| 1.4.2e | Implement updateRoom | `matrix-room.ts` | Update name, topic, settings | 2h |
| 1.4.2f | Implement deleteRoom | `matrix-room.ts` | Delete room | 1h |
| 1.4.2g | Add io.haos.channel state event | `matrix-room.ts` | Store channel type | 2h |
| 1.4.2h | Handle room ordering | `matrix-room.ts` | io.haos.channel_order event | 2h |

#### 1.4.3 Member Service (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.4.3a | Create member service | `apps/web/services/matrix-member.ts` | Membership operations | 1h |
| 1.4.3b | Implement getMembers | `matrix-member.ts` | List space/room members | 2h |
| 1.4.3c | Implement getMember | `matrix-member.ts` | Get member details | 1h |
| 1.4.3d | Implement kickMember | `matrix-member.ts` | Remove member from space | 2h |
| 1.4.3e | Implement banMember | `matrix-member.ts` | Ban user from space | 2h |
| 1.4.3f | Implement updatePowerLevel | `matrix-member.ts` | Change user's power level | 2h |
| 1.4.3g | Map power levels to roles | `matrix-member.ts` | Define Admin/Mod/Member power levels | 2h |
| 1.4.3h | Add io.haos.member_role event | `matrix-member.ts` | Store display role name | 2h |

#### 1.4.4 Message Service (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.4.4a | Create message service | `apps/web/services/matrix-message.ts` | Message operations | 1h |
| 1.4.4b | Implement sendMessage | `matrix-message.ts` | Send text message | 2h |
| 1.4.4c | Implement sendMessageWithAttachment | `matrix-message.ts` | Send message with file | 3h |
| 1.4.4d | Implement editMessage | `matrix-message.ts` | Edit existing message | 2h |
| 1.4.4e | Implement deleteMessage | `matrix-message.ts` | Redact message | 2h |
| 1.4.4f | Implement addReaction | `matrix-message.ts` | Add emoji reaction | 2h |
| 1.4.4g | Implement replyToMessage | `matrix-message.ts` | Send reply to message | 2h |

#### 1.4.5 DM Service (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.4.5a | Create DM service | `apps/web/services/matrix-dm.ts` | DM operations | 1h |
| 1.4.5b | Implement getOrCreateDM | `matrix-dm.ts` | Find or create DM room | 3h |
| 1.4.5c | Implement listDMs | `matrix-dm.ts` | List all DM rooms | 2h |
| 1.4.5d | Mark DM rooms in account data | `matrix-dm.ts` | Use m.direct account data | 2h |

#### 1.4.6 Invite Service (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 1.4.6a | Create invite service | `apps/web/services/matrix-invite.ts` | Invite operations | 1h |
| 1.4.6b | Implement createInviteCode | `matrix-invite.ts` | Generate invite code, store in state | 3h |
| 1.4.6c | Implement joinByInviteCode | `matrix-invite.ts` | Join space via code | 2h |
| 1.4.6d | Implement revokeInviteCode | `matrix-invite.ts` | Invalidate invite code | 1h |

---

## Phase 2: UI Reskin (3-4 weeks)

### 2.1 Navigation Components (1 week)

#### 2.1.1 Server Sidebar (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.1.1a | Create ServerSidebar component | `apps/web/components/navigation/server-sidebar.tsx` | Vertical server list | 2h |
| 2.1.1b | Connect to space service | `server-sidebar.tsx` | Shows actual spaces | 2h |
| 2.1.1c | Add active state indicator | `server-sidebar.tsx` | Highlight selected server | 1h |
| 2.1.1d | Add hover preview | `server-sidebar.tsx` | Tooltip with server name | 1h |
| 2.1.1e | Support drag reorder | `server-sidebar.tsx` | Reorder servers (optional) | 3h |
| 2.1.1f | Add separator between servers | `server-sidebar.tsx` | DM button, separators | 1h |

#### 2.1.2 Server Icon (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.1.2a | Create ServerIcon component | `apps/web/components/navigation/server-icon.tsx` | Space avatar display | 2h |
| 2.1.2b | Add initial fallback | `server-icon.tsx` | First letter if no avatar | 1h |
| 2.1.2c | Add notification badge | `server-icon.tsx` | Unread indicator | 1h |

#### 2.1.3 Add Server Button (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.1.3a | Create AddServerButton | `apps/web/components/navigation/add-server-button.tsx` | Plus button | 1h |
| 2.1.3b | Connect to create modal | `add-server-button.tsx` | Opens CreateServerModal | 1h |
| 2.1.3c | Add join option | `add-server-button.tsx` | Menu with Create/Join options | 1h |

#### 2.1.4 User Button (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.1.4a | Create UserButton component | `apps/web/components/navigation/user-button.tsx` | User avatar in sidebar | 2h |
| 2.1.4b | Add settings menu | `user-button.tsx` | Dropdown with profile, settings, logout | 2h |
| 2.1.4c | Show online status | `user-button.tsx` | Status indicator dot | 1h |
| 2.1.4d | Connect to Matrix presence | `user-button.tsx` | Use presence hook | 1h |

#### 2.1.5 Quick Switcher (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.1.5a | Create QuickSwitcher component | `apps/web/components/navigation/quick-switcher.tsx` | Ctrl+K modal | 2h |
| 2.1.5b | Implement search logic | `quick-switcher.tsx` | Search servers, channels, DMs | 3h |
| 2.1.5c | Add keyboard navigation | `quick-switcher.tsx` | Arrow keys, enter to select | 2h |
| 2.1.5d | Add recent items | `quick-switcher.tsx` | Show recent channels | 1h |

### 2.2 Channel Components (1 week)

#### 2.2.1 Channel Sidebar (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.2.1a | Create ChannelSidebar component | `apps/web/components/server/channel-sidebar.tsx` | Room list for space | 2h |
| 2.2.1b | Connect to room service | `channel-sidebar.tsx` | Shows actual rooms | 2h |
| 2.2.1c | Add server header | `channel-sidebar.tsx` | Server name, dropdown menu | 2h |
| 2.2.1d | Group by channel type | `channel-sidebar.tsx` | Text, Voice, Video sections | 2h |
| 2.2.1e | Add unread indicators | `channel-sidebar.tsx` | Bold unread channels | 2h |
| 2.2.1f | Add channel search | `channel-sidebar.tsx` | Filter channels | 1h |

#### 2.2.2 Channel Categories (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.2.2a | Create ChannelCategory component | `apps/web/components/server/channel-category.tsx` | Collapsible section | 2h |
| 2.2.2b | Implement collapse toggle | `channel-category.tsx` | Remember collapsed state | 2h |
| 2.2.2c | Add category actions | `channel-category.tsx` | Create channel in category | 1h |
| 2.2.2d | Support drag reorder | `channel-category.tsx` | Reorder categories (optional) | 3h |

#### 2.2.3 Channel Item (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.2.3a | Create ChannelItem component | `apps/web/components/server/channel-item.tsx` | Single channel row | 2h |
| 2.2.3b | Add type icons | `channel-item.tsx` | #text, 🔊voice, 📹video icons | 1h |
| 2.2.3c | Add hover actions | `channel-item.tsx` | Settings, invite on hover | 2h |
| 2.2.3d | Add context menu | `channel-item.tsx` | Right-click menu | 2h |

#### 2.2.4 Member List (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.2.4a | Create MemberList component | `apps/web/components/server/member-list.tsx` | Right sidebar member list | 2h |
| 2.2.4b | Group by role | `member-list.tsx` | Admin, Mod, Member sections | 2h |
| 2.2.4c | Show online status | `member-list.tsx` | Online/offline indicator | 1h |
| 2.2.4d | Add member context menu | `member-list.tsx` | Message, kick, ban options | 2h |

### 2.3 Message Components (1 week)

#### 2.3.1 Message List (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.3.1a | Create MessageList component | `apps/web/components/chat/message-list.tsx` | Scrollable message container | 2h |
| 2.3.1b | Connect to useRoomMessages | `message-list.tsx` | Display actual messages | 2h |
| 2.3.1c | Implement infinite scroll | `message-list.tsx` | Load more on scroll up | 3h |
| 2.3.1d | Group consecutive messages | `message-list.tsx` | Compact mode for same author | 2h |
| 2.3.1e | Add date separators | `message-list.tsx` | "Today", "Yesterday", date | 2h |
| 2.3.1f | Auto-scroll to new messages | `message-list.tsx` | Scroll down on new message | 2h |
| 2.3.1g | Add "new messages" indicator | `message-list.tsx` | Jump to bottom button | 1h |

#### 2.3.2 Message Item (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.3.2a | Create MessageItem component | `apps/web/components/chat/message-item.tsx` | Single message display | 2h |
| 2.3.2b | Add author avatar and name | `message-item.tsx` | Discord-style layout | 1h |
| 2.3.2c | Add timestamp | `message-item.tsx` | Relative and absolute time | 1h |
| 2.3.2d | Support markdown/formatting | `message-item.tsx` | Bold, italic, code, links | 2h |
| 2.3.2e | Display reactions | `message-item.tsx` | Reaction bar below message | 2h |

#### 2.3.3 Message Input (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.3.3a | Create MessageInput component | `apps/web/components/chat/message-input.tsx` | Text input with actions | 2h |
| 2.3.3b | Add emoji picker | `message-input.tsx` | Emoji button and picker | 2h |
| 2.3.3c | Add file upload button | `message-input.tsx` | Attachment picker | 1h |
| 2.3.3d | Add typing indicator send | `message-input.tsx` | Send typing on input | 1h |
| 2.3.3e | Support multiline input | `message-input.tsx` | Shift+Enter for newline | 1h |
| 2.3.3f | Add mention autocomplete | `message-input.tsx` | @user suggestions | 2h |

#### 2.3.4 Message Actions (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.3.4a | Create MessageActions component | `apps/web/components/chat/message-actions.tsx` | Hover action bar | 2h |
| 2.3.4b | Add react button | `message-actions.tsx` | Quick emoji reaction | 1h |
| 2.3.4c | Add reply button | `message-actions.tsx` | Start reply to message | 1h |
| 2.3.4d | Add edit button (own messages) | `message-actions.tsx` | Edit message | 1h |
| 2.3.4e | Add delete button (own/mod) | `message-actions.tsx` | Delete message | 1h |
| 2.3.4f | Add more actions menu | `message-actions.tsx` | Pin, copy link, etc. | 1h |

### 2.4 Modals (1 week)

#### 2.4.1 Create Server Modal (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.4.1a | Create CreateServerModal | `apps/web/components/modals/create-server-modal.tsx` | Modal shell | 1h |
| 2.4.1b | Add server name input | `create-server-modal.tsx` | Name field with validation | 1h |
| 2.4.1c | Add server avatar upload | `create-server-modal.tsx` | Avatar picker | 2h |
| 2.4.1d | Connect to space service | `create-server-modal.tsx` | Actually create space | 2h |
| 2.4.1e | Add template selection | `create-server-modal.tsx` | Gaming, Friends, etc. | 2h |

#### 2.4.2 Server Settings Modal (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.4.2a | Create ServerSettingsModal | `apps/web/components/modals/server-settings-modal.tsx` | Modal with tabs | 2h |
| 2.4.2b | Add Overview tab | `server-settings-modal.tsx` | Name, avatar, delete | 2h |
| 2.4.2c | Add Roles tab | `server-settings-modal.tsx` | Link to role editor | 1h |
| 2.4.2d | Add Members tab | `server-settings-modal.tsx` | Member list | 1h |
| 2.4.2e | Add Invites tab | `server-settings-modal.tsx` | Manage invites | 1h |
| 2.4.2f | Add Audit Log tab | `server-settings-modal.tsx` | Link to audit log | 1h |

#### 2.4.3 Channel Modals (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.4.3a | Create CreateChannelModal | `apps/web/components/modals/create-channel-modal.tsx` | Create channel form | 3h |
| 2.4.3b | Add channel type selector | `create-channel-modal.tsx` | Text/Voice/Video | 1h |
| 2.4.3c | Create EditChannelModal | `apps/web/components/modals/edit-channel-modal.tsx` | Edit channel form | 2h |
| 2.4.3d | Create DeleteChannelModal | `apps/web/components/modals/delete-channel-modal.tsx` | Confirm delete | 1h |

#### 2.4.4 Invite Modal (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.4.4a | Create InviteModal | `apps/web/components/modals/invite-modal.tsx` | Invite link display | 2h |
| 2.4.4b | Add copy button | `invite-modal.tsx` | Copy link to clipboard | 1h |
| 2.4.4c | Add regenerate option | `invite-modal.tsx` | Create new invite code | 1h |

#### 2.4.5 Member Management Modal (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 2.4.5a | Create MemberModal | `apps/web/components/modals/member-modal.tsx` | Member details | 2h |
| 2.4.5b | Add role assignment | `member-modal.tsx` | Change member role | 2h |
| 2.4.5c | Add kick/ban buttons | `member-modal.tsx` | Moderation actions | 2h |
| 2.4.5d | Add timeout option | `member-modal.tsx` | Temporary mute | 2h |

---

## Phase 3: Polish & Admin (3-4 weeks)

### 3.1 Settings UI (1 week)

#### 3.1.1 User Settings (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.1.1a | Create UserSettings page | `apps/web/app/(main)/settings/page.tsx` | Settings page route | 1h |
| 3.1.1b | Add Profile tab | `apps/web/components/settings/profile-settings.tsx` | Edit display name, avatar | 3h |
| 3.1.1c | Add Account tab | `apps/web/components/settings/account-settings.tsx` | Email, password change | 3h |
| 3.1.1d | Add Appearance tab | `apps/web/components/settings/appearance-settings.tsx` | Theme, compact mode | 2h |
| 3.1.1e | Add Privacy tab | `apps/web/components/settings/privacy-settings.tsx` | DM settings, blocks | 2h |
| 3.1.1f | Add Notifications tab | `apps/web/components/settings/notification-settings.tsx` | Push, sounds | 2h |

#### 3.1.2 Server Settings (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.1.2a | Create ServerSettings page | `apps/web/app/(main)/servers/[serverId]/settings/page.tsx` | Server settings route | 1h |
| 3.1.2b | Add General section | `apps/web/components/settings/server-general.tsx` | Name, avatar, region | 3h |
| 3.1.2c | Add Moderation section | `apps/web/components/settings/server-moderation.tsx` | Verification, content filter | 2h |
| 3.1.2d | Add Community section | `apps/web/components/settings/server-community.tsx` | Discovery settings | 2h |
| 3.1.2e | Add Integrations section | `apps/web/components/settings/server-integrations.tsx` | Webhooks, bots (future) | 2h |
| 3.1.2f | Add delete server option | `server-general.tsx` | Delete with confirmation | 2h |

#### 3.1.3 Channel Settings (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.1.3a | Create ChannelSettings component | `apps/web/components/settings/channel-settings.tsx` | Channel settings panel | 2h |
| 3.1.3b | Add Overview section | `channel-settings.tsx` | Name, topic | 2h |
| 3.1.3c | Add Permissions section | `channel-settings.tsx` | Role overrides | 3h |
| 3.1.3d | Add Slowmode option | `channel-settings.tsx` | Rate limiting | 1h |

### 3.2 Role Management (1 week)

#### 3.2.1 Role Editor (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.2.1a | Create RoleEditor component | `apps/web/components/settings/role-editor.tsx` | Role management UI | 3h |
| 3.2.1b | Add role list sidebar | `role-editor.tsx` | List all roles | 2h |
| 3.2.1c | Add role creation | `role-editor.tsx` | Create new role | 2h |
| 3.2.1d | Add role deletion | `role-editor.tsx` | Delete role | 1h |
| 3.2.1e | Add role color picker | `role-editor.tsx` | Color selection | 2h |
| 3.2.1f | Add drag reorder roles | `role-editor.tsx` | Role hierarchy | 3h |

#### 3.2.2 Permission Matrix (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.2.2a | Create PermissionMatrix component | `apps/web/components/settings/permission-matrix.tsx` | Permission checkboxes | 3h |
| 3.2.2b | Define all permissions | `lib/permissions.ts` | Permission constants | 2h |
| 3.2.2c | Map to Matrix power levels | `lib/permissions.ts` | Permission → power level mapping | 2h |
| 3.2.2d | Add permission categories | `permission-matrix.tsx` | Group by type | 2h |
| 3.2.2e | Add inherited permission display | `permission-matrix.tsx` | Show effective permissions | 2h |

#### 3.2.3 Role Assignment (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.2.3a | Create RoleAssignment component | `apps/web/components/settings/role-assignment.tsx` | Assign roles to members | 2h |
| 3.2.3b | Add member search | `role-assignment.tsx` | Find members | 2h |
| 3.2.3c | Add role checkboxes | `role-assignment.tsx` | Toggle roles per member | 2h |
| 3.2.3d | Connect to member service | `role-assignment.tsx` | Actually update power levels | 2h |

### 3.3 Admin Features (1 week)

#### 3.3.1 Audit Log UI (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.3.1a | Create AuditLog component | `apps/web/components/admin/audit-log.tsx` | Log viewer | 3h |
| 3.3.1b | Fetch room state changes | `audit-log.tsx` | Get power level changes, kicks, bans | 3h |
| 3.3.1c | Add filters | `audit-log.tsx` | Filter by action type, user | 2h |
| 3.3.1d | Add date range picker | `audit-log.tsx` | Filter by date | 2h |
| 3.3.1e | Add export option | `audit-log.tsx` | Download as CSV/JSON | 2h |

#### 3.3.2 Moderation Tools (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.3.2a | Create ModerationPanel component | `apps/web/components/admin/moderation-panel.tsx` | Moderation dashboard | 2h |
| 3.3.2b | Add ban list management | `moderation-panel.tsx` | View/unban users | 2h |
| 3.3.2c | Add bulk moderation | `moderation-panel.tsx` | Multi-user kick/ban | 3h |
| 3.3.2d | Add reported messages | `moderation-panel.tsx` | Review reports (if implemented) | 2h |
| 3.3.2e | Add timeout management | `moderation-panel.tsx` | View/remove timeouts | 2h |

#### 3.3.3 Server Discovery (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.3.3a | Create DiscoveryPage | `apps/web/app/(main)/discover/page.tsx` | Public server browser | 2h |
| 3.3.3b | Add search functionality | `discover/page.tsx` | Search public spaces | 2h |
| 3.3.3c | Add category filters | `discover/page.tsx` | Gaming, Tech, etc. | 2h |
| 3.3.3d | Add join button | `discover/page.tsx` | One-click join | 1h |

### 3.4 Onboarding (0.5 weeks)

#### 3.4.1 First-Run Experience (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.4.1a | Create WelcomeModal | `apps/web/components/modals/welcome-modal.tsx` | First login welcome | 2h |
| 3.4.1b | Add profile setup step | `welcome-modal.tsx` | Set name, avatar | 2h |
| 3.4.1c | Add server options step | `welcome-modal.tsx` | Create or join server | 2h |
| 3.4.1d | Track onboarding state | `lib/onboarding.ts` | Remember completion | 1h |
| 3.4.1e | Add skip option | `welcome-modal.tsx` | Skip onboarding | 1h |

#### 3.4.2 Server Templates (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.4.2a | Define template data | `lib/server-templates.ts` | Gaming, Study, etc. templates | 2h |
| 3.4.2b | Add template selector UI | `create-server-modal.tsx` | Choose template | 2h |
| 3.4.2c | Implement template application | `services/matrix-space.ts` | Create channels from template | 3h |

### 3.5 LiveKit Polish (0.5 weeks)

#### 3.5.1 Voice Channel UI (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.5.1a | Create VoiceChannel component | `apps/web/components/voice/voice-channel.tsx` | Voice room display | 2h |
| 3.5.1b | Show connected users | `voice-channel.tsx` | Avatar grid | 2h |
| 3.5.1c | Add join/leave buttons | `voice-channel.tsx` | Connect to voice | 2h |
| 3.5.1d | Add mute/deafen controls | `voice-channel.tsx` | Audio controls | 2h |

#### 3.5.2 Video Call Styling (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.5.2a | Style LiveKit components | `apps/web/components/voice/*.tsx` | HAOS theme | 3h |
| 3.5.2b | Add camera toggle | Video controls | Camera on/off | 1h |
| 3.5.2c | Add participant grid | Grid layout | Multiple participants | 2h |
| 3.5.2d | Add speaking indicator | Voice activity | Highlight speaker | 1h |

#### 3.5.3 Screen Share Polish (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 3.5.3a | Add screen share button | Voice controls | Start/stop share | 1h |
| 3.5.3b | Display shared screen | Screen share view | Full-size shared content | 2h |
| 3.5.3c | Add screen share notification | Notification | "X is sharing screen" | 1h |

---

## Phase 4: Production Readiness (2 weeks)

### 4.1 Documentation (0.5 weeks)

#### 4.1.1 User Guide (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.1.1a | Write getting started guide | `docs/user-guide/getting-started.md` | Account creation, first server | 2h |
| 4.1.1b | Write messaging guide | `docs/user-guide/messaging.md` | Send messages, attachments | 2h |
| 4.1.1c | Write voice/video guide | `docs/user-guide/voice-video.md` | Voice channels, calls | 2h |
| 4.1.1d | Write settings guide | `docs/user-guide/settings.md` | User settings explained | 2h |

#### 4.1.2 Admin Guide (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.1.2a | Write server setup guide | `docs/admin-guide/server-setup.md` | Create and configure server | 2h |
| 4.1.2b | Write roles guide | `docs/admin-guide/roles.md` | Permission system explained | 2h |
| 4.1.2c | Write moderation guide | `docs/admin-guide/moderation.md` | Kick, ban, mute | 2h |
| 4.1.2d | Write audit log guide | `docs/admin-guide/audit-log.md` | Using audit logs | 1h |

#### 4.1.3 Self-Host Guide (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.1.3a | Write Docker deployment guide | `docs/deploy/docker.md` | docker-compose setup | 3h |
| 4.1.3b | Write Kubernetes guide | `docs/deploy/kubernetes.md` | Helm chart usage | 3h |
| 4.1.3c | Write configuration reference | `docs/deploy/configuration.md` | All env vars documented | 2h |

### 4.2 Performance (0.5 weeks)

#### 4.2.1 Bundle Optimization (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.2.1a | Analyze bundle size | `next.config.js` | Bundle analyzer report | 1h |
| 4.2.1b | Add code splitting | Components | Dynamic imports for heavy components | 3h |
| 4.2.1c | Optimize images | Image components | next/image, proper sizing | 2h |
| 4.2.1d | Add lazy loading | Heavy components | Load on visibility | 2h |

#### 4.2.2 Sync Optimization (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.2.2a | Implement sync filter | `matrix-provider.tsx` | Only sync needed data | 3h |
| 4.2.2b | Add lazy room loading | Room hooks | Load room data on demand | 2h |
| 4.2.2c | Optimize timeline pagination | Message hooks | Efficient history loading | 2h |

#### 4.2.3 Image Optimization (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.2.3a | Configure thumbnail sizes | Image components | Consistent thumbnail dimensions | 1h |
| 4.2.3b | Add image caching | Image components | Cache-Control headers | 2h |
| 4.2.3c | Add blur placeholders | Image components | Low-res preview | 1h |

### 4.3 Testing (0.5 weeks)

#### 4.3.1 E2E Tests (2 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.3.1a | Set up Playwright | `playwright.config.ts` | E2E framework configured | 2h |
| 4.3.1b | Write auth tests | `tests/e2e/auth.spec.ts` | Login, logout, register | 3h |
| 4.3.1c | Write messaging tests | `tests/e2e/messaging.spec.ts` | Send, edit, delete messages | 3h |
| 4.3.1d | Write server tests | `tests/e2e/server.spec.ts` | Create, join, leave server | 3h |
| 4.3.1e | Write channel tests | `tests/e2e/channel.spec.ts` | Create, edit, delete channel | 2h |
| 4.3.1f | Add E2E to CI | `.github/workflows/e2e.yml` | E2E runs on PR | 2h |

#### 4.3.2 Load Testing (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.3.2a | Set up k6 | `load-tests/` | Load test framework | 1h |
| 4.3.2b | Write concurrent user test | `load-tests/concurrent.js` | 100 concurrent users | 3h |
| 4.3.2c | Write message throughput test | `load-tests/messages.js` | 1000 messages/minute | 2h |
| 4.3.2d | Document results | `docs/performance.md` | Performance baselines | 1h |

### 4.4 Deployment (0.5 weeks)

#### 4.4.1 Docker Images (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.4.1a | Create Dockerfile | `Dockerfile` | Multi-stage build | 2h |
| 4.4.1b | Create docker-compose.yml | `docker-compose.yml` | Full stack compose | 2h |
| 4.4.1c | Add health checks | `Dockerfile`, `docker-compose.yml` | Container health monitoring | 1h |
| 4.4.1d | Set up Docker Hub push | `.github/workflows/docker.yml` | Auto-publish images | 2h |

#### 4.4.2 Helm Charts (1 day)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.4.2a | Create Helm chart | `charts/haos/` | Kubernetes deployment | 3h |
| 4.4.2b | Add values.yaml | `charts/haos/values.yaml` | Configurable options | 2h |
| 4.4.2c | Add ingress config | `charts/haos/templates/ingress.yaml` | HTTP/HTTPS routing | 1h |
| 4.4.2d | Test chart deployment | Manual test | Chart installs successfully | 2h |

#### 4.4.3 Release Automation (0.5 days)

| ID | Task | Files | Success Criteria | Est |
|----|------|-------|------------------|-----|
| 4.4.3a | Set up semantic-release | `release.config.js` | Auto versioning | 2h |
| 4.4.3b | Add changelog generation | `release.config.js` | Auto changelog | 1h |
| 4.4.3c | Add GitHub release | `.github/workflows/release.yml` | Auto GitHub release | 1h |

---

## Summary Statistics

| Phase | Tasks | Sub-tasks | Est. Hours |
|-------|-------|-----------|------------|
| Phase 0 | 7 | 41 | ~80h |
| Phase 1 | 17 | 101 | ~200h |
| Phase 2 | 16 | 67 | ~130h |
| Phase 3 | 14 | 62 | ~120h |
| Phase 4 | 10 | 36 | ~70h |
| **Total** | **64** | **307** | **~600h** |

At 40h/week with 2 developers = ~7.5 weeks of parallel work
Accounting for overhead, testing, bugs: **15-20 weeks** (4-5 months)

---

## Next Steps

1. ✅ Task breakdown complete
2. ⬜ Begin Phase 0 tasks
3. ⬜ Set up HAOS v2 repository
4. ⬜ Complete dev environment
5. ⬜ Start Phase 1 (Auth Migration)
