# UI Component Mapping: Discord → Harmony

This document maps every Discord UI component to its implementation in Harmony.

---

## Layout Structure

### Discord Layout
```
┌──────────────────────────────────────────────────────────────────┐
│                        Title Bar (Electron)                       │
├────┬──────────────┬──────────────────────────────────┬───────────┤
│    │              │           Header Bar             │           │
│ S  │   Channel    │  # channel-name    🔍 📌 👥 ...  │           │
│ E  │    List      ├──────────────────────────────────┤  Member   │
│ R  │              │                                  │   List    │
│ V  │  ▼ TEXT      │                                  │           │
│ E  │   # general  │        Message Area              │  ▼ ONLINE │
│ R  │   # random   │                                  │    User1  │
│    │              │                                  │    User2  │
│ L  │  ▼ VOICE     │                                  │           │
│ I  │   🔊 General │                                  │  ▼ OFFLINE│
│ S  │              │                                  │    User3  │
│ T  ├──────────────┼──────────────────────────────────┤           │
│    │  User Panel  │         Input Area               │           │
│    │ [👤] Name 🎤🎧⚙️│  Message #channel    ➕ 📎 😀 🎁 │           │
└────┴──────────────┴──────────────────────────────────┴───────────┘
```

### Measurements (Discord)
| Element | Width | Height |
|---------|-------|--------|
| Server list | 72px | 100% |
| Channel sidebar | 240px | 100% |
| Member sidebar | 240px | 100% |
| Header bar | 100% | 48px |
| User panel | 240px | 52px |
| Message input | 100% | ~44px min |

---

## Server List (Guild List)

### Component: `<ServerList />`

```tsx
interface Server {
  id: string;
  name: string;
  iconUrl: string | null;
  hasUnread: boolean;
  mentionCount: number;
  isActive: boolean;
}

// Visual specs
const SERVER_ICON_SIZE = 48;
const SERVER_ICON_RADIUS_INACTIVE = 24; // Full circle
const SERVER_ICON_RADIUS_ACTIVE = 16;   // Rounded square
const SERVER_INDICATOR_WIDTH = 8;
const PILL_HEIGHT_UNREAD = 8;
const PILL_HEIGHT_ACTIVE = 40;
```

### Elements
- [ ] Home button (Discord logo / DM list)
- [ ] Horizontal separator
- [ ] Server icons (circular → rounded on hover/active)
- [ ] Unread indicator (white pill, left side)
- [ ] Active indicator (white pill, taller)
- [ ] Mention badge (red circle with count)
- [ ] Add server button (+)
- [ ] Discover servers button (compass)
- [ ] Server folders (expandable)

### Animations
- Icon morphs from circle (r=24) to rounded rect (r=16) on hover
- Pill grows from 8px to 40px on active
- Folder expand/collapse
- Drag-and-drop reordering

---

## Channel Sidebar

### Component: `<ChannelSidebar />`

```tsx
interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'announcement' | 'stage' | 'forum';
  categoryId: string | null;
  position: number;
  unread: boolean;
  muted: boolean;
  locked: boolean; // No access
}

interface Category {
  id: string;
  name: string;
  collapsed: boolean;
}
```

### Elements
- [ ] Server banner (if boosted)
- [ ] Server name + dropdown menu
- [ ] Boost progress bar
- [ ] Channel categories (collapsible)
- [ ] Text channels (# prefix)
- [ ] Voice channels (🔊 prefix)
- [ ] Voice channel users (nested list when populated)
- [ ] Create channel button (+ on category hover)
- [ ] Invite button

### Channel Icons
```tsx
const CHANNEL_ICONS = {
  text: '#',           // Or hash icon
  voice: '🔊',         // Speaker icon
  announcement: '📢',   // Megaphone icon
  stage: '🎭',         // Stage icon
  forum: '💬',         // Forum icon
  locked: '🔒',        // Lock overlay
  nsfw: '🔞',          // NSFW indicator
};
```

---

## User Panel

### Component: `<UserPanel />`

```tsx
interface CurrentUser {
  id: string;
  username: string;
  discriminator: string; // Legacy, or display name
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'invisible';
  customStatus?: string;
  isMuted: boolean;
  isDeafened: boolean;
}
```

### Elements
- [ ] User avatar (32px, with status indicator)
- [ ] Username
- [ ] Custom status (truncated)
- [ ] Mute button
- [ ] Deafen button
- [ ] Settings button (gear icon)

### Status Colors
```scss
--status-online: #23a55a;
--status-idle: #f0b232;
--status-dnd: #f23f43;
--status-offline: #80848e;
```

---

## Message Area

### Component: `<MessageList />`

```tsx
interface Message {
  id: string;
  content: string;
  author: User;
  timestamp: Date;
  editedAt?: Date;
  replyTo?: Message;
  attachments: Attachment[];
  embeds: Embed[];
  reactions: Reaction[];
  pinned: boolean;
  type: 'default' | 'reply' | 'system' | 'thread_created';
}

interface MessageGroup {
  author: User;
  messages: Message[];
  startTime: Date;
}
```

### Message Grouping Rules
- Same author
- Within 7 minutes of previous
- No system messages in between
- Not a reply

### Elements
- [ ] Date separators ("January 15, 2026")
- [ ] New messages bar ("NEW MESSAGES")
- [ ] Message groups
  - [ ] Author avatar (40px, left)
  - [ ] Author name + timestamp (first message only)
  - [ ] Message content
  - [ ] Edited indicator
  - [ ] Attachments
  - [ ] Embeds
  - [ ] Reactions
- [ ] Reply context (above replied message)
- [ ] Hover toolbar (react, reply, more)
- [ ] Context menu

### Hover Actions
```tsx
const MESSAGE_ACTIONS = [
  { icon: 'emoji', action: 'addReaction', tooltip: 'Add Reaction' },
  { icon: 'reply', action: 'reply', tooltip: 'Reply' },
  { icon: 'thread', action: 'createThread', tooltip: 'Create Thread' },
  { icon: 'more', action: 'showMenu', tooltip: 'More' },
];
```

---

## Message Input

### Component: `<MessageInput />`

### Elements
- [ ] Attachment button (+)
- [ ] Text area (auto-expanding)
- [ ] Emoji button
- [ ] GIF button
- [ ] Sticker button
- [ ] Gift button (Nitro)
- [ ] Character counter (when near limit)
- [ ] Typing indicator area

### Autocomplete Types
- `@` - User mentions
- `@` - Role mentions
- `#` - Channel links
- `:` - Emoji
- `/` - Slash commands

### Formatting Toolbar (optional)
- Bold, Italic, Underline, Strikethrough
- Code, Code block
- Spoiler
- Link

---

## Member Sidebar

### Component: `<MemberList />`

```tsx
interface MemberGroup {
  role: Role | null; // null = "Online" or "Offline"
  members: Member[];
}

interface Member {
  id: string;
  user: User;
  nickname?: string;
  roles: Role[];
  status: UserStatus;
  activities: Activity[];
}
```

### Elements
- [ ] Role headers (collapsible)
- [ ] Member count per role
- [ ] Member entries
  - [ ] Avatar (32px, with status)
  - [ ] Display name (nickname or username)
  - [ ] Activity (Playing X, Listening to Y)
  - [ ] Bot badge
  - [ ] Owner crown

### Grouping
1. Server owner (crown)
2. By highest hoisted role
3. Online (no role)
4. Offline (collapsed by default)

---

## Modals

### Server Settings Modal
```tsx
const SERVER_SETTINGS_TABS = [
  { id: 'overview', label: 'Overview', icon: 'server' },
  { id: 'roles', label: 'Roles', icon: 'shield' },
  { id: 'emoji', label: 'Emoji', icon: 'emoji' },
  { id: 'stickers', label: 'Stickers', icon: 'sticker' },
  { id: 'soundboard', label: 'Soundboard', icon: 'sound' },
  // --- separator ---
  { id: 'moderation', label: 'Moderation', icon: 'hammer' },
  { id: 'audit-log', label: 'Audit Log', icon: 'list' },
  { id: 'bans', label: 'Bans', icon: 'ban' },
  // --- separator ---
  { id: 'integrations', label: 'Integrations', icon: 'puzzle' },
  { id: 'discovery', label: 'Discovery', icon: 'compass' },
  // etc.
];
```

### User Settings Modal
```tsx
const USER_SETTINGS_TABS = [
  // USER SETTINGS
  { id: 'account', label: 'My Account', icon: 'user' },
  { id: 'profiles', label: 'Profiles', icon: 'id' },
  { id: 'privacy', label: 'Privacy & Safety', icon: 'shield' },
  { id: 'family-center', label: 'Family Center', icon: 'family' },
  { id: 'authorized-apps', label: 'Authorized Apps', icon: 'key' },
  { id: 'devices', label: 'Devices', icon: 'device' },
  { id: 'connections', label: 'Connections', icon: 'link' },
  { id: 'clips', label: 'Clips', icon: 'clip' },
  { id: 'friend-requests', label: 'Friend Requests', icon: 'user-plus' },
  // BILLING SETTINGS
  { id: 'nitro', label: 'Nitro', icon: 'nitro' },
  { id: 'boosts', label: 'Server Boost', icon: 'boost' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'card' },
  { id: 'gift-inventory', label: 'Gift Inventory', icon: 'gift' },
  // APP SETTINGS
  { id: 'appearance', label: 'Appearance', icon: 'paint' },
  { id: 'accessibility', label: 'Accessibility', icon: 'a11y' },
  { id: 'voice', label: 'Voice & Video', icon: 'mic' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'keybinds', label: 'Keybinds', icon: 'keyboard' },
  { id: 'language', label: 'Language', icon: 'globe' },
  { id: 'streamer', label: 'Streamer Mode', icon: 'stream' },
  { id: 'advanced', label: 'Advanced', icon: 'code' },
  // ACTIVITY SETTINGS
  { id: 'activity-privacy', label: 'Activity Privacy', icon: 'eye' },
  { id: 'registered-games', label: 'Registered Games', icon: 'game' },
  // separator
  { id: 'whats-new', label: "What's New", icon: 'sparkle' },
  { id: 'hypesquad', label: 'HypeSquad', icon: 'hype' },
  // separator
  { id: 'logout', label: 'Log Out', icon: 'logout', danger: true },
];
```

---

## Popups & Popovers

### User Popup (on click)
```
┌─────────────────────────────┐
│ [Banner Image]              │
│ ┌─────┐                     │
│ │Avatar│ Username           │
│ └─────┘ @handle             │
├─────────────────────────────┤
│ 📝 Note (editable)          │
├─────────────────────────────┤
│ Member Since: Jan 1, 2020   │
│ Roles: @Admin @Mod          │
├─────────────────────────────┤
│ [Message] [Call] [More]     │
└─────────────────────────────┘
```

### Emoji Picker
- Categories: Recent, People, Nature, Food, Activities, Travel, Objects, Symbols, Flags
- Search bar
- Skin tone selector
- Custom server emoji section
- Sticker tab
- GIF tab (Tenor)

---

## Voice UI

### Voice Connected Indicator (in channel list)
```
┌─────────────────────────────┐
│ 🔊 General                  │
│   ┌──┐ Username1 🎤         │ (speaking indicator)
│   └──┘                      │
│   ┌──┐ Username2            │
│   └──┘                      │
└─────────────────────────────┘
```

### Voice Control Bar (when connected)
```
┌─────────────────────────────────────────────────────────────┐
│  🔊 Connected                                               │
│  General / Server Name                      [🔇] [🎧] [📞]  │
└─────────────────────────────────────────────────────────────┘
```

### Voice Popout Window
- Grid of video/avatar tiles
- Speaking indicator (green border)
- Screen share view
- Controls: mute, deafen, video, screen share, disconnect

---

## Color Tokens

```scss
// Backgrounds
--bg-primary: #313338;
--bg-secondary: #2b2d31;
--bg-secondary-alt: #232428;
--bg-tertiary: #1e1f22;
--bg-accent: #404249;
--bg-floating: #111214;
--bg-mod-subtle: rgba(0, 0, 0, 0.2);

// Text
--text-normal: #dbdee1;
--text-muted: #949ba4;
--text-link: #00a8fc;

// Interactive
--interactive-normal: #b5bac1;
--interactive-hover: #dbdee1;
--interactive-active: #fff;
--interactive-muted: #4e5058;

// Brand
--brand-500: #5865f2;
--brand-560: #4752c4;

// Status
--green-360: #23a55a;
--yellow-300: #f0b232;
--red-400: #f23f43;

// Misc
--input-bg: #1e1f22;
--input-placeholder: #87898c;
--divider: #3f4147;
```

---

## Typography

```scss
// Font family
--font-primary: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
--font-display: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
--font-code: 'Consolas', 'Andale Mono WT', 'Andale Mono', 'Lucida Console', monospace;
--font-headline: 'ABC Ginto Nord', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;

// Font sizes
--font-size-xxs: 10px;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 20px;
--font-size-xl: 24px;

// Line heights
--line-height-sm: 1.1;
--line-height-md: 1.375;
--line-height-lg: 1.5;
```

---

## Z-Index Scale

```scss
--z-base: 0;
--z-above: 1;
--z-tooltip: 1000;
--z-popout: 1100;
--z-overlay: 1200;
--z-modal: 1300;
--z-toast: 1400;
```

---

## Animation Tokens

```scss
// Durations
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

// Easings
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

*This document should be referenced when implementing any UI component.*
