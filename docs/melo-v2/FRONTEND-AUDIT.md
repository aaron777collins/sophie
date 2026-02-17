# MELO v2 Frontend Audit

**Audit Date:** 2025-02-10  
**Source Repository:** `/home/ubuntu/repos/discord-clone-reference/`  
**Framework:** Next.js 13.4.12 (App Router)  
**Language:** TypeScript 5.2.2

---

## Components

### UI Components (components/ui/)

| Component | File | Description |
|-----------|------|-------------|
| **Avatar** | `avatar.tsx` | Radix-based avatar with image and fallback support. Exports `Avatar`, `AvatarImage`, `AvatarFallback` |
| **Badge** | `badge.tsx` | Small label component with variants: default, secondary, destructive, outline |
| **Button** | `button.tsx` | Versatile button with CVA variants (default, destructive, outline, primary, secondary, ghost, link) and sizes (default, sm, lg, icon) |
| **Command** | `command.tsx` | Command palette using `cmdk` library. Exports `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator` |
| **Dialog** | `dialog.tsx` | Radix-based modal dialog. Exports `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` |
| **DropdownMenu** | `dropdown-menu.tsx` | Radix-based dropdown menu with full submenus, checkboxes, radio items support |
| **Form** | `form.tsx` | React Hook Form integration with Radix Label. Exports `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` |
| **Input** | `input.tsx` | Styled text input with consistent focus states |
| **Label** | `label.tsx` | Radix-based label with CVA styling |
| **Popover** | `popover.tsx` | Radix-based popover. Exports `Popover`, `PopoverTrigger`, `PopoverContent` |
| **ScrollArea** | `scroll-area.tsx` | Radix-based custom scrollbar. Exports `ScrollArea`, `ScrollBar` |
| **Select** | `select.tsx` | Radix-based select dropdown. Exports `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator` |
| **Separator** | `separator.tsx` | Radix-based horizontal/vertical separator |
| **Sheet** | `sheet.tsx` | Radix Dialog-based slide-out panel with side variants (top, bottom, left, right) |
| **Tooltip** | `tooltip.tsx` | Radix-based tooltip. Exports `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` |

**Total UI Components: 14**

---

### Feature Components

#### Core Components (components/)

| Component | File | Description |
|-----------|------|-------------|
| **ActionTooltip** | `action-tooltip.tsx` | Wrapper around Tooltip for consistent action button tooltips |
| **EmojiPicker** | `emoji-picker.tsx` | Popover-based emoji picker using `@emoji-mart/react` |
| **FileUpload** | `file-upload.tsx` | UploadThing dropzone with image preview and PDF handling |
| **MediaRoom** | `media-room.tsx` | LiveKit video/audio conferencing room component |
| **MobileToggle** | `mobile-toggle.tsx` | Sheet-based mobile navigation toggle with NavigationSidebar + ServerSidebar |
| **ModeToggle** | `mode-toggle.tsx` | Theme switcher dropdown (light/dark/system) using next-themes |
| **SocketIndicator** | `socket-indicatior.tsx` | Badge showing real-time connection status (Live/Polling) |
| **UserAvatar** | `user-avatar.tsx` | Wrapper around Avatar with responsive sizing |

#### Navigation Components (components/navigation/)

| Component | File | Description |
|-----------|------|-------------|
| **NavigationSidebar** | `navigation-sidebar.tsx` | Left sidebar with server list, add server button, user button, theme toggle |
| **NavigationAction** | `navigation-action.tsx` | "Add a server" button with tooltip |
| **NavigationItem** | `navigation-item.tsx` | Server icon button with active indicator and routing |

#### Server Components (components/server/)

| Component | File | Description |
|-----------|------|-------------|
| **ServerSidebar** | `server-sidebar.tsx` | Server-specific sidebar with channels and members lists |
| **ServerHeader** | `server-header.tsx` | Server name dropdown with admin actions (invite, settings, manage members, create channel, delete/leave) |
| **ServerSearch** | `server-search.tsx` | Command dialog for searching channels/members (Ctrl+K) |
| **ServerSection** | `server-section.tsx` | Collapsible section header for channels/members with add button |
| **ServerChannel** | `server-channel.tsx` | Channel list item with type icon and edit/delete actions |
| **ServerMember** | `server-member.tsx` | Member list item with avatar, name, and role icon |

#### Chat Components (components/chat/)

| Component | File | Description |
|-----------|------|-------------|
| **ChatHeader** | `chat-header.tsx` | Channel/conversation header with mobile toggle, name, socket indicator, video button |
| **ChatInput** | `chat-input.tsx` | Message input with file attachment button and emoji picker |
| **ChatMessages** | `chat-messages.tsx` | Infinite-scrolling message list with loading states |
| **ChatItem** | `chat-item.tsx` | Individual message with edit/delete, image/PDF preview, role icons |
| **ChatWelcome** | `chat-welcome.tsx` | Welcome message at start of channel/conversation |
| **ChatVideoButton** | `chat-video-button.tsx` | Toggle button for video calls in conversations |

#### Modal Components (components/modals/)

| Component | File | Description |
|-----------|------|-------------|
| **InitialModal** | `initial-modal.tsx` | First-time server creation modal (on setup) |
| **CreateServerModal** | `create-server-modal.tsx` | Modal for creating new server with name and image |
| **EditServerModal** | `edit-server-modal.tsx` | Modal for editing server name and image |
| **DeleteServerModal** | `delete-server-modal.tsx` | Confirmation modal for server deletion |
| **LeaveServerModal** | `leave-server-modal.tsx` | Confirmation modal for leaving a server |
| **InviteModal** | `invite-modal.tsx` | Modal showing invite link with copy and regenerate |
| **MembersModal** | `members-modal.tsx` | Modal for managing members (role change, kick) |
| **CreateChannelModal** | `create-channel-modal.tsx` | Modal for creating channel with name and type |
| **EditChannelModal** | `edit-channel-modal.tsx` | Modal for editing channel name and type |
| **DeleteChannelModal** | `delete-channel-modal.tsx` | Confirmation modal for channel deletion |
| **MessageFileModal** | `message-file-modal.tsx` | Modal for attaching file to message |
| **DeleteMessageModal** | `delete-message-modal.tsx` | Confirmation modal for message deletion |

#### Provider Components (components/providers/)

| Component | File | Description |
|-----------|------|-------------|
| **ThemeProvider** | `theme-provider.tsx` | Next-themes provider wrapper |
| **ModalProvider** | `modal-provider.tsx` | Renders all modal components globally |
| **SocketProvider** | `socket-provider.tsx` | Socket.io client context with connection state |
| **QueryProvider** | `query-provider.tsx` | React Query (TanStack) client provider |

**Total Feature Components: 39**

---

## Hooks

| Hook | File | Description |
|------|------|-------------|
| **useModal** | `use-modal-store.ts` | Zustand store for modal state management with type, data, isOpen, onOpen, onClose |
| **useOrigin** | `use-origin.ts` | Returns `window.location.origin` safely (handles SSR) |
| **useChatQuery** | `use-chat-query.ts` | React Query infinite query for fetching messages with cursor pagination |
| **useChatSocket** | `use-chat-socket.ts` | Socket.io listener for real-time message add/update |
| **useChatScroll** | `use-chat-scroll.ts` | Auto-scroll to bottom, load more on scroll to top |

**Total Hooks: 5**

---

## Lib/Utilities

| File | Description |
|------|-------------|
| `db.ts` | Prisma client singleton (prevents hot-reload issues) |
| `utils.ts` | `cn()` function using `clsx` + `tailwind-merge` |
| `current-profile.ts` | Get current user profile from Clerk auth (App Router) |
| `current-profile-pages.ts` | Get current user profile from Clerk auth (Pages Router) |
| `initial-profile.ts` | Create profile on first sign-in if not exists |
| `conversation.ts` | Get or create conversation between two members |
| `uploadthing.ts` | UploadThing component generators |

**Total Lib Files: 7**

---

## Routes

### Auth Routes (app/(auth)/)

| Route | File | Description |
|-------|------|-------------|
| `/sign-in` | `sign-in/[[...sign-in]]/page.tsx` | Clerk SignIn component |
| `/sign-up` | `sign-up/[[...sign-up]]/page.tsx` | Clerk SignUp component |
| *Layout* | `layout.tsx` | Centered flex container |

### Setup Routes (app/(setup)/)

| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Initial setup - creates profile, redirects to server or shows InitialModal |

### Main Routes (app/(main)/)

| Route | File | Description |
|-------|------|-------------|
| *Layout* | `layout.tsx` | Main layout with NavigationSidebar |
| `/servers/[serverId]` | `servers/[serverId]/page.tsx` | Redirects to general channel |
| `/servers/[serverId]` | `servers/[serverId]/layout.tsx` | Server layout with ServerSidebar |
| `/servers/[serverId]/channels/[channelId]` | `channels/[channelId]/page.tsx` | Text/Audio/Video channel view with chat or MediaRoom |
| `/servers/[serverId]/conversations/[memberId]` | `conversations/[memberId]/page.tsx` | Direct message conversation with optional video |

### Invite Routes (app/(invite)/)

| Route | File | Description |
|-------|------|-------------|
| `/invite/[inviteCode]` | `invite/[inviteCode]/page.tsx` | Join server via invite link |

### Root Layout

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout with ClerkProvider, ThemeProvider, SocketProvider, ModalProvider, QueryProvider |

**Total Page Routes: 8**

---

## API Routes

### App Router API Routes (app/api/)

| Route | Methods | File | Description |
|-------|---------|------|-------------|
| `/api/servers` | POST | `servers/route.ts` | Create new server with general channel and admin member |
| `/api/servers/[serverId]` | PATCH, DELETE | `servers/[serverId]/route.ts` | Update or delete server (owner only) |
| `/api/servers/[serverId]/invite-code` | PATCH | `servers/[serverId]/invite-code/route.ts` | Regenerate invite code |
| `/api/servers/[serverId]/leave` | PATCH | `servers/[serverId]/leave/route.ts` | Leave server (remove member) |
| `/api/channels` | POST | `channels/route.ts` | Create channel (admin/moderator only) |
| `/api/channels/[channelId]` | PATCH, DELETE | `channels/[channelId]/route.tsx` | Update or delete channel |
| `/api/members/[memberId]` | PATCH, DELETE | `members/[memberId]/route.ts` | Update role or kick member |
| `/api/messages` | GET | `messages/route.ts` | Fetch channel messages with cursor pagination |
| `/api/direct-messages` | GET | `direct-messages/route.ts` | Fetch DM messages with cursor pagination |
| `/api/livekit` | GET | `livekit/route.ts` | Generate LiveKit access token |
| `/api/uploadthing` | GET, POST | `uploadthing/route.ts` | UploadThing file upload handlers |

### Pages Router Socket API (pages/api/socket/)

| Route | Methods | File | Description |
|-------|---------|------|-------------|
| `/api/socket/io` | * | `io.ts` | Socket.io server initialization |
| `/api/socket/messages` | POST | `messages/index.ts` | Create channel message (emits to socket) |
| `/api/socket/messages/[messageId]` | PATCH, DELETE | `messages/[messageId].ts` | Edit or delete channel message |
| `/api/socket/direct-messages` | POST | `direct-messages/index.ts` | Create direct message |
| `/api/socket/direct-messages/[directMessageId]` | PATCH, DELETE | `direct-messages/[directMessageId].ts` | Edit or delete direct message |

**Total API Routes: 16**

---

## Dependencies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 13.4.12 | React framework with App Router |
| `react` | 18.2.0 | UI library |
| `react-dom` | 18.2.0 | React DOM renderer |
| `typescript` | 5.2.2 | Type safety |

### Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| `@clerk/nextjs` | ^4.23.2 | Authentication provider (sign-in, sign-up, user management) |

### Database
| Package | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^5.2.0 | Database ORM client |
| `prisma` | ^5.2.0 | Database schema and migrations (devDep) |

### UI Components (Radix)
| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-avatar` | ^1.0.3 | Avatar primitive |
| `@radix-ui/react-dialog` | ^1.0.4 | Dialog/modal primitive |
| `@radix-ui/react-dropdown-menu` | ^2.0.5 | Dropdown menu primitive |
| `@radix-ui/react-label` | ^2.0.2 | Label primitive |
| `@radix-ui/react-popover` | ^1.0.6 | Popover primitive |
| `@radix-ui/react-scroll-area` | ^1.0.4 | Custom scrollbar |
| `@radix-ui/react-select` | ^1.2.2 | Select dropdown |
| `@radix-ui/react-separator` | ^1.0.3 | Separator line |
| `@radix-ui/react-slot` | ^1.0.2 | Slot composition |
| `@radix-ui/react-tooltip` | ^1.0.6 | Tooltip primitive |

### Styling
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 3.3.3 | Utility-first CSS |
| `tailwind-merge` | ^1.14.0 | Merge Tailwind classes safely |
| `tailwindcss-animate` | ^1.0.6 | Animation utilities |
| `class-variance-authority` | ^0.7.0 | Component variants (CVA) |
| `clsx` | ^2.0.0 | Conditional classes |
| `autoprefixer` | 10.4.15 | CSS vendor prefixes |
| `postcss` | 8.4.28 | CSS processing |

### Forms & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | ^7.45.4 | Form state management |
| `@hookform/resolvers` | ^3.3.0 | Validation resolvers |
| `zod` | ^3.22.2 | Schema validation |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^4.4.1 | Lightweight state management (modal store) |
| `@tanstack/react-query` | ^4.33.0 | Server state management, infinite queries |

### Real-time Communication
| Package | Version | Purpose |
|---------|---------|---------|
| `socket.io` | ^4.7.2 | WebSocket server |
| `socket.io-client` | ^4.7.2 | WebSocket client |

### Video/Audio (LiveKit)
| Package | Version | Purpose |
|---------|---------|---------|
| `@livekit/components-react` | ^1.1.7 | LiveKit React components |
| `@livekit/components-styles` | ^1.0.6 | LiveKit default styles |
| `livekit-client` | ^1.13.2 | LiveKit client SDK |
| `livekit-server-sdk` | ^1.2.6 | LiveKit server SDK (token generation) |

### File Upload
| Package | Version | Purpose |
|---------|---------|---------|
| `uploadthing` | ^5.3.3 | File upload service |
| `@uploadthing/react` | ^5.3.0 | UploadThing React components |
| `react-dropzone` | ^14.2.3 | Drag-and-drop file upload |

### Emoji
| Package | Version | Purpose |
|---------|---------|---------|
| `emoji-mart` | ^5.5.2 | Emoji picker |
| `@emoji-mart/react` | ^1.1.1 | React wrapper |
| `@emoji-mart/data` | ^1.1.2 | Emoji data |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | ^1.5.0 | HTTP client |
| `query-string` | ^8.1.0 | URL query string parsing |
| `date-fns` | ^2.30.0 | Date formatting |
| `uuid` | ^9.0.0 | UUID generation |
| `lucide-react` | ^0.269.0 | Icon library |
| `cmdk` | ^0.2.0 | Command palette |
| `next-themes` | ^0.2.1 | Theme switching |
| `sharp` | ^0.32.5 | Image optimization |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@types/uuid` | ^9.0.2 | UUID type definitions |
| `@types/node` | 20.5.6 | Node.js types |
| `@types/react` | 18.2.21 | React types |
| `@types/react-dom` | 18.2.7 | React DOM types |
| `eslint` | 8.48.0 | Linting |
| `eslint-config-next` | 13.4.12 | Next.js ESLint config |

**Total Dependencies: 45 (39 runtime + 6 dev)**

---

## Summary

| Metric | Count |
|--------|-------|
| **UI Components** | 14 |
| **Feature Components** | 39 |
| **Hooks** | 5 |
| **Lib/Utilities** | 7 |
| **Page Routes** | 8 |
| **API Routes** | 16 |
| **Dependencies** | 45 |
| **Total Components** | 53 |
| **Total Routes** | 24 |

---

## Key Patterns Identified

### 1. **Architecture**
- Next.js 13 App Router with route groups: `(auth)`, `(setup)`, `(main)`, `(invite)`
- Hybrid routing: App Router for pages/API + Pages Router for Socket.io
- Server Components for data fetching, Client Components for interactivity

### 2. **State Management**
- **Zustand** for global modal state (lightweight, type-safe)
- **React Query** for server state (messages, infinite scroll)
- **Socket.io** for real-time updates

### 3. **UI Component Library**
- All UI primitives built on **Radix UI** (accessible, unstyled)
- **Class Variance Authority (CVA)** for component variants
- **Tailwind CSS** with custom Discord-like dark theme

### 4. **Authentication & Authorization**
- **Clerk** for auth (handles sign-in/up, user sessions)
- Role-based permissions: `ADMIN`, `MODERATOR`, `GUEST`
- Protected routes via middleware

### 5. **Real-time Features**
- **Socket.io** for messaging (must use Pages Router API for WebSocket support)
- Fallback to polling if WebSocket disconnects
- **LiveKit** for video/audio calls

### 6. **File Handling**
- **UploadThing** for file uploads
- Supports images (server icons, message attachments) and PDFs

### 7. **Database**
- **Prisma** ORM with PostgreSQL (implied by schema patterns)
- Models: Profile, Server, Member, Channel, Message, DirectMessage, Conversation

### 8. **Type Safety**
- Full TypeScript with strict types
- Zod schemas for form/API validation
- Prisma types for database entities

---

## Notes for MELO v2 Migration

1. **Keep:** Radix UI primitives, Tailwind setup, CVA patterns, React Query
2. **Replace:** Clerk → Custom auth or different provider if needed
3. **Replace:** UploadThing → S3/custom storage
4. **Replace:** LiveKit → Custom WebRTC or different provider
5. **Enhance:** Add more sophisticated permissions system
6. **Enhance:** Add voice activity detection, screen sharing
7. **Consider:** Move Socket.io to standalone server for scalability
