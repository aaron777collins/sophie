# Phase 1: UI Foundation - Detailed Task Breakdown

**Duration:** 6-8 weeks
**Goal:** Discord-like layout with basic functionality intact

---

## Week 1-2: Repository Setup & Layout Skeleton

### 1.1 Fork & Setup (Day 1-2)
- [ ] Fork `element-hq/element-desktop` → `harmony-desktop`
- [ ] Fork `element-hq/element-web` → `harmony-web`
- [ ] Set up monorepo structure with Yarn workspaces
- [ ] Configure build pipeline (GitHub Actions)
- [ ] Create development branch strategy
- [ ] Set up local development environment

```bash
# Initial setup commands
git clone https://github.com/element-hq/element-web harmony-web
git clone https://github.com/element-hq/element-desktop harmony-desktop
cd harmony-web && yarn install
cd ../harmony-desktop && yarn install
```

### 1.2 Create Layout Shell (Day 3-5)
- [ ] Identify Element's main layout components:
  - `src/components/structures/LeftPanel.tsx`
  - `src/components/structures/RoomView.tsx`  
  - `src/components/structures/RightPanel.tsx`
- [ ] Create new Discord-style layout wrapper:
  - `src/components/harmony/HarmonyLayout.tsx`
- [ ] Implement 4-column grid:
  ```tsx
  // Grid: [ServerList | ChannelList | MainContent | MemberList]
  <div className="harmony-layout">
    <ServerList />      {/* 72px fixed */}
    <ChannelSidebar />  {/* 240px fixed */}
    <MainContent />     {/* Flexible */}
    <MemberSidebar />   {/* 240px, toggleable */}
  </div>
  ```

### 1.3 Server List Component (Day 6-10)
- [ ] Create `<ServerList />` component
- [ ] Map Matrix Spaces to "Servers"
- [ ] Implement:
  - [ ] Home button (DMs)
  - [ ] Server icons with tooltips
  - [ ] Add Server button
  - [ ] Server Folders (later)
- [ ] Style with Discord colors/dimensions
- [ ] Add hover animations (circle → rounded rect)

**File locations to modify:**
- Create: `src/components/harmony/ServerList.tsx`
- Create: `src/components/harmony/ServerIcon.tsx`
- Modify: `src/stores/SpaceStore.ts` (adapt for server metaphor)

---

## Week 3-4: Channel Sidebar & Theming

### 2.1 Channel Sidebar (Day 11-15)
- [ ] Create `<ChannelSidebar />` component
- [ ] Map Matrix rooms within Space to channels
- [ ] Implement:
  - [ ] Server header (name + dropdown)
  - [ ] Channel categories (collapsible)
  - [ ] Text channel items
  - [ ] Voice channel items (UI only, no functionality)
  - [ ] Unread indicators
- [ ] Channel icons based on room type

**Data mapping:**
```typescript
// Matrix → Discord concept mapping
interface ChannelMapping {
  // Matrix Space = Discord Server
  spaceId: string;
  
  // Get rooms in space as channels
  channels: Room[]; // rooms with parent = spaceId
  
  // Room state events for categories
  categories: Category[]; // Custom state event or tags
}
```

### 2.2 User Panel (Day 16-17)
- [ ] Create `<UserPanel />` component
- [ ] Display current user info
- [ ] Mic mute button (visual only initially)
- [ ] Headphone deafen button (visual only)
- [ ] Settings gear button → open settings modal
- [ ] User status indicator

### 2.3 Theme System (Day 18-20)
- [ ] Create Discord color token system
- [ ] Implement theme CSS variables
- [ ] Create themes:
  - [ ] Dark (default)
  - [ ] Light
  - [ ] AMOLED
- [ ] Theme switcher in settings
- [ ] Replace Element's theme with new system

**Theme file structure:**
```
src/styles/
├── themes/
│   ├── _tokens.scss      # Color tokens
│   ├── dark.scss
│   ├── light.scss
│   └── amoled.scss
├── components/
│   ├── _server-list.scss
│   ├── _channel-sidebar.scss
│   └── ...
└── main.scss
```

---

## Week 5-6: Message Area Transformation

### 3.1 Message List Restyle (Day 21-25)
- [ ] Modify `<MessageList />` or create new
- [ ] Implement message grouping logic
- [ ] Style changes:
  - [ ] Avatar on left (40px)
  - [ ] Username + timestamp header
  - [ ] Compact subsequent messages
  - [ ] Hover background color
  - [ ] Hover action buttons

### 3.2 Message Components (Day 26-28)
- [ ] Restyle individual message bubble
- [ ] Implement:
  - [ ] Reply preview (above message)
  - [ ] Attachments grid
  - [ ] Embed cards
  - [ ] Reaction bar
- [ ] Message context menu (right-click)

### 3.3 Message Input (Day 29-30)
- [ ] Restyle input area
- [ ] Add attachment button (+)
- [ ] Add emoji picker button
- [ ] Placeholder text: "Message #channel-name"
- [ ] Auto-expanding textarea

---

## Week 7-8: Header & Member List

### 4.1 Channel Header (Day 31-33)
- [ ] Create `<ChannelHeader />` component
- [ ] Channel name with # icon
- [ ] Channel topic (truncated, expandable)
- [ ] Toolbar buttons:
  - [ ] Thread panel toggle
  - [ ] Notification settings
  - [ ] Pinned messages
  - [ ] Member list toggle
  - [ ] Search
  - [ ] Inbox
  - [ ] Help

### 4.2 Member Sidebar (Day 34-36)
- [ ] Create `<MemberSidebar />` component
- [ ] Fetch room members from Matrix
- [ ] Group by role (power levels)
- [ ] Display:
  - [ ] Role headers with counts
  - [ ] Member items (avatar, name, status)
  - [ ] Online/offline separation
- [ ] Click to open user popup

### 4.3 Polish & Bug Fixes (Day 37-40)
- [ ] Cross-browser testing
- [ ] Responsive behavior
- [ ] Keyboard navigation basics
- [ ] Fix layout edge cases
- [ ] Performance optimization
- [ ] Code cleanup and documentation

---

## Technical Notes

### Key Element Components to Modify/Replace

| Element Component | Harmony Replacement | Priority |
|-------------------|---------------------|----------|
| `LeftPanel` | `ServerList + ChannelSidebar` | P0 |
| `RoomView` | `MainContent` | P0 |
| `RightPanel` | `MemberSidebar` | P1 |
| `RoomHeader` | `ChannelHeader` | P1 |
| `MessageComposer` | `MessageInput` | P1 |
| `EventTile` | `Message` | P1 |
| `MemberList` | `MemberSidebar` | P1 |
| `RoomList` | `ChannelList` | P0 |

### Data Layer Changes

Minimal changes needed - mainly UI transformation:

```typescript
// Concept mapping (no backend changes)
Space → Server
Room in Space → Channel
Room (no space) → DM
Power Levels → Roles
Room State → Server Settings
```

### Dependencies to Add

```json
{
  "dependencies": {
    "framer-motion": "^10.x",  // Animations
    "react-virtualized": "^9.x", // Large list performance
    "@radix-ui/react-*": "latest" // Accessible primitives
  }
}
```

---

## Definition of Done (Phase 1)

- [ ] App loads with Discord-like 4-column layout
- [ ] Server list shows all user's Spaces as server icons
- [ ] Clicking server shows its channels
- [ ] Channel list shows rooms in categories
- [ ] Messages display in grouped format
- [ ] Member list shows room members by role
- [ ] Dark theme matches Discord's color palette
- [ ] All existing Element functionality still works
- [ ] No console errors
- [ ] Loads in < 3 seconds

---

## Risks & Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Element updates break fork | High | Minimal core changes, wrapper approach |
| Matrix data doesn't map cleanly | Medium | Abstract data layer, custom state events |
| Performance regression | Medium | Profile early, virtualize lists |
| Existing features break | High | Comprehensive test coverage |

---

## Commands Cheatsheet

```bash
# Development
cd harmony-web
yarn start              # Start dev server
yarn lint               # Run linter
yarn test               # Run tests

# Building
yarn build              # Production build

# Desktop (after web built)
cd ../harmony-desktop
yarn install
yarn run fetch --noverify --cfgdir ""
ln -s ../harmony-web/webapp ./
yarn start              # Run desktop app
```

---

*Ready to start? Begin with task 1.1: Fork & Setup*
