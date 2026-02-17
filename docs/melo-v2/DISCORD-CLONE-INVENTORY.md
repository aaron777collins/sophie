# Discord Clone Source Inventory

**Source:** `/tmp/discord-clone-source/`  
**Date:** 2025-01-27  
**Purpose:** Audit of reusable components, hooks, and utilities for MELO v2 adaptation

---

## Summary

| Category | Total Files | Direct Copy | Needs Adaptation |
|----------|------------|-------------|------------------|
| Components | 37 | 18 | 19 |
| Hooks | 5 | 2 | 3 |
| Lib/Utils | 7 | 1 | 6 |
| **Total** | **49** | **21** | **28** |

---

## 1. Hooks (`/hooks/`)

### 1.1 Direct Copy (UI-only, no backend deps)

| File | Purpose | Dependencies |
|------|---------|--------------|
| `use-origin.ts` | Get window origin (SSR-safe) | React |
| `use-chat-scroll.ts` | Auto-scroll + load-more on scroll | React |

### 1.2 Needs Matrix Adaptation

| File | Purpose | Dependencies | Adaptation Notes |
|------|---------|--------------|------------------|
| `use-modal-store.ts` | Zustand store for modal state | zustand, @prisma/client | Replace Prisma types with Matrix types (Room, User, etc.) |
| `use-chat-query.ts` | Infinite query for messages | @tanstack/react-query, socket-provider | Replace REST API with Matrix SDK calls |
| `use-chat-socket.ts` | Real-time message updates via Socket.io | @tanstack/react-query, socket-provider, @prisma/client | Replace Socket.io with Matrix sync events |

---

## 2. Components

### 2.1 UI Components (`/components/ui/`) - shadcn/ui

**All Direct Copy** - These are standard shadcn/ui primitives, no backend deps.

| File | Radix Dependency | Purpose |
|------|-----------------|---------|
| `avatar.tsx` | @radix-ui/react-avatar | User avatar display |
| `badge.tsx` | - | Status badges |
| `button.tsx` | @radix-ui/react-slot | Button variants |
| `command.tsx` | cmdk | Command palette (search) |
| `dialog.tsx` | @radix-ui/react-dialog | Modal dialogs |
| `dropdown-menu.tsx` | @radix-ui/react-dropdown-menu | Dropdown menus |
| `form.tsx` | react-hook-form | Form primitives |
| `input.tsx` | - | Text input |
| `label.tsx` | @radix-ui/react-label | Form labels |
| `popover.tsx` | @radix-ui/react-popover | Popover container |
| `scroll-area.tsx` | @radix-ui/react-scroll-area | Scrollable container |
| `select.tsx` | @radix-ui/react-select | Select dropdown |
| `separator.tsx` | @radix-ui/react-separator | Visual separator |
| `sheet.tsx` | @radix-ui/react-dialog | Slide-out panel (mobile) |
| `tooltip.tsx` | @radix-ui/react-tooltip | Hover tooltips |

### 2.2 Shared Components - Direct Copy

| File | Purpose | Dependencies |
|------|---------|--------------|
| `action-tooltip.tsx` | Wrapper for tooltips | ui/tooltip |
| `user-avatar.tsx` | Avatar with cn() styling | ui/avatar, lib/utils |
| `emoji-picker.tsx` | Emoji mart integration | @emoji-mart/react, next-themes, ui/popover |
| `mode-toggle.tsx` | Dark/light theme toggle | next-themes, ui/button, ui/dropdown-menu |

### 2.3 Shared Components - Needs Adaptation

| File | Purpose | Adaptation Notes |
|------|---------|------------------|
| `file-upload.tsx` | UploadThing integration | Replace with Matrix content repository upload |
| `socket-indicatior.tsx` | Connection status badge | Replace with Matrix sync status |
| `mobile-toggle.tsx` | Mobile sidebar trigger | Uses NavigationSidebar/ServerSidebar - update refs |
| `media-room.tsx` | LiveKit video/audio room | Replace with Matrix VoIP / Element Call integration |

### 2.4 Providers (`/components/providers/`)

| File | Purpose | Adaptation Notes |
|------|---------|------------------|
| `theme-provider.tsx` | **Direct Copy** - next-themes wrapper | No changes needed |
| `query-provider.tsx` | **Direct Copy** - React Query setup | No changes needed |
| `modal-provider.tsx` | **Needs Update** - Mounts all modals | Update modal imports |
| `socket-provider.tsx` | **Replace** - Socket.io context | Replace with Matrix client context |

### 2.5 Navigation Components (`/components/navigation/`)

| File | Purpose | Adaptation Notes |
|------|---------|------------------|
| `navigation-action.tsx` | "Add server" button | Change to "Create Space" or "Join Room" |
| `navigation-item.tsx` | Server icon in sidebar | Adapt for Matrix spaces/rooms |
| `navigation-sidebar.tsx` | Main left sidebar | **Heavy adaptation** - Replace Clerk UserButton, Prisma db calls with Matrix SDK |

### 2.6 Server Components (`/components/server/`)

All need adaptation - "Server" concept → Matrix "Space" or "Room Group"

| File | Purpose | Adaptation Notes |
|------|---------|------------------|
| `server-header.tsx` | Space/server header dropdown | Replace MemberRole with Matrix power levels |
| `server-search.tsx` | Cmd+K search dialog | Adapt for Matrix room/member search |
| `server-sidebar.tsx` | Channel/member list | **Heavy adaptation** - Replace Prisma with Matrix SDK room state |
| `server-section.tsx` | Collapsible channel section | Update types for Matrix channels |
| `server-channel.tsx` | Channel list item | Replace ChannelType enum with Matrix room types |
| `server-member.tsx` | Member list item | Replace with Matrix room member |

### 2.7 Chat Components (`/components/chat/`)

Core messaging UI - needs Matrix message event integration

| File | Purpose | Adaptation Notes |
|------|---------|------------------|
| `chat-header.tsx` | Channel/DM header | Adapt room name/avatar from Matrix room state |
| `chat-welcome.tsx` | **Mostly Direct** - Welcome message | Minimal adaptation needed |
| `chat-input.tsx` | Message composer | Replace API endpoint with Matrix sendMessage |
| `chat-messages.tsx` | Message list container | Replace useChatQuery with Matrix timeline |
| `chat-item.tsx` | Single message display | Adapt Message/Member types to Matrix events |
| `chat-video-button.tsx` | Video call toggle | Adapt for Matrix VoIP |

### 2.8 Modals (`/components/modals/`)

All modals use Zustand store + REST API calls - need Matrix SDK adaptation

| File | Purpose | Adaptation Notes |
|------|---------|------------------|
| `initial-modal.tsx` | First-time setup | Adapt for Matrix onboarding |
| `create-server-modal.tsx` | Create server/space | Replace with Matrix createRoom (space) |
| `edit-server-modal.tsx` | Edit server settings | Update Matrix room state |
| `delete-server-modal.tsx` | Delete confirmation | Matrix leave/forget room |
| `leave-server-modal.tsx` | Leave server | Matrix leaveRoom |
| `invite-modal.tsx` | Generate invite link | Matrix room invite / public link |
| `members-modal.tsx` | Manage members | Matrix room members + power levels |
| `create-channel-modal.tsx` | Create channel | Matrix createRoom (child of space) |
| `edit-channel-modal.tsx` | Edit channel | Update Matrix room state |
| `delete-channel-modal.tsx` | Delete channel | Matrix forget room |
| `message-file-modal.tsx` | File upload in chat | Matrix content repository |
| `delete-message-modal.tsx` | Delete message | Matrix redact event |

---

## 3. Lib/Utils (`/lib/`)

### 3.1 Direct Copy

| File | Purpose | Dependencies |
|------|---------|--------------|
| `utils.ts` | `cn()` class merger | clsx, tailwind-merge |

### 3.2 Replace Entirely

| File | Purpose | Replacement |
|------|---------|-------------|
| `db.ts` | Prisma client singleton | Not needed - Matrix SDK handles state |
| `uploadthing.ts` | UploadThing components | Matrix content repository helpers |
| `current-profile.ts` | Get user from Clerk | Matrix client.getUserId() |
| `current-profile-pages.ts` | Get user (Pages Router) | Matrix client.getUserId() |
| `initial-profile.ts` | Create profile on first login | Matrix user registration / profile setup |
| `conversation.ts` | DM conversation helper | Matrix createRoom for DM |

---

## 4. External Dependencies

### 4.1 Keep (Compatible with Matrix)

| Package | Purpose | Notes |
|---------|---------|-------|
| `@tanstack/react-query` | Data fetching/caching | Works with Matrix SDK |
| `zustand` | State management | Keep for modal/UI state |
| `next-themes` | Theme switching | No changes |
| `lucide-react` | Icons | No changes |
| `date-fns` | Date formatting | No changes |
| `@emoji-mart/react` | Emoji picker | No changes |
| `react-hook-form` | Form handling | No changes |
| `zod` | Schema validation | No changes |
| `axios` | HTTP client | May still need for some APIs |
| `query-string` | URL query handling | No changes |
| `clsx` + `tailwind-merge` | Class utilities | No changes |

### 4.2 shadcn/ui (Radix-based)

All `@radix-ui/*` packages - **Keep all**:
- `@radix-ui/react-avatar`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-popover`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`

Plus: `cmdk`, `class-variance-authority`, `tailwindcss-animate`

### 4.3 Replace

| Package | Purpose | Replacement |
|---------|---------|-------------|
| `@clerk/nextjs` | Auth | Matrix login (password, SSO, etc.) |
| `@prisma/client` | Database ORM | Matrix SDK state |
| `prisma` | DB tooling | Not needed |
| `socket.io` / `socket.io-client` | WebSocket | Matrix SDK sync |
| `@uploadthing/react` / `uploadthing` | File uploads | Matrix content repository |
| `@livekit/components-react` | Video calls | Matrix VoIP / Element Call |
| `livekit-client` / `livekit-server-sdk` | Video backend | Matrix VoIP |

### 4.4 Add (Matrix-specific)

| Package | Purpose |
|---------|---------|
| `matrix-js-sdk` | Core Matrix client |
| `matrix-react-sdk` (optional) | Pre-built React components |
| `hydrogen-web` (optional) | Lightweight Matrix client |

---

## 5. Type Definitions Needed

Create new types to replace Prisma models:

```typescript
// types/matrix.ts

// Replace @prisma/client types
export type MatrixRoom = {
  roomId: string;
  name: string;
  avatarUrl?: string;
  topic?: string;
  type: 'text' | 'voice' | 'video' | 'space';
  isSpace: boolean;
  children?: MatrixRoom[]; // For spaces
};

export type MatrixMember = {
  odId: string;
  displayName: string;
  avatarUrl?: string;
  powerLevel: number; // 0-100, replaces MemberRole
  membership: 'join' | 'invite' | 'leave' | 'ban';
};

export type MatrixMessage = {
  eventId: string;
  roomId: string;
  sender: string;
  content: {
    msgtype: 'm.text' | 'm.image' | 'm.file' | 'm.video' | 'm.audio';
    body: string;
    url?: string; // mxc:// URL for media
  };
  timestamp: number;
  isRedacted: boolean;
};

// Power level constants (replacing MemberRole enum)
export const PowerLevels = {
  GUEST: 0,
  MEMBER: 10,
  MODERATOR: 50,
  ADMIN: 100,
} as const;
```

---

## 6. Recommended Migration Order

### Phase 1: Foundation
1. Copy all `/components/ui/` (shadcn)
2. Copy `lib/utils.ts`
3. Copy `action-tooltip.tsx`, `user-avatar.tsx`, `emoji-picker.tsx`, `mode-toggle.tsx`
4. Set up Matrix client provider (replace socket-provider)
5. Create Matrix type definitions

### Phase 2: State & Hooks
6. Adapt `use-modal-store.ts` with Matrix types
7. Copy `use-origin.ts`, `use-chat-scroll.ts`
8. Create Matrix-based chat query hook
9. Create Matrix sync event hook

### Phase 3: Layout
10. Adapt navigation components for Matrix spaces
11. Adapt server components for Matrix rooms
12. Set up modal provider with adapted modals

### Phase 4: Chat
13. Adapt chat components for Matrix messages
14. Implement file upload with Matrix content repo
15. Adapt video/voice for Matrix VoIP

### Phase 5: Modals
16. Adapt all modals one by one
17. Test full CRUD flows

---

## 7. Files Summary by Action

### Direct Copy (21 files)
```
components/ui/*.tsx (15 files)
components/action-tooltip.tsx
components/user-avatar.tsx  
components/emoji-picker.tsx
components/mode-toggle.tsx
components/providers/theme-provider.tsx
components/providers/query-provider.tsx
hooks/use-origin.ts
hooks/use-chat-scroll.ts
lib/utils.ts
```

### Adapt (23 files)
```
hooks/use-modal-store.ts
hooks/use-chat-query.ts
hooks/use-chat-socket.ts
components/providers/modal-provider.tsx
components/navigation/*.tsx (3 files)
components/server/*.tsx (6 files)
components/chat/*.tsx (6 files)
components/file-upload.tsx
components/socket-indicatior.tsx
components/mobile-toggle.tsx
components/media-room.tsx
```

### Replace Entirely (6 files)
```
components/providers/socket-provider.tsx → Matrix client provider
lib/db.ts → Not needed
lib/uploadthing.ts → Matrix content helpers
lib/current-profile.ts → Matrix user helpers
lib/current-profile-pages.ts → Matrix user helpers
lib/initial-profile.ts → Matrix registration
lib/conversation.ts → Matrix DM helpers
```

### Modals (12 files - all need adaptation)
```
components/modals/*.tsx
```

---

*Generated for MELO v2 Matrix integration planning*
