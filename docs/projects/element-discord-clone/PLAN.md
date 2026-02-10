# Project: Element → Discord Clone
## Codename: "Harmony"

> **Goal:** Fork Element Desktop and transform it into a pixel-perfect Discord clone while retaining Matrix protocol compatibility.

---

## Executive Summary

This project transforms Element Desktop (an open-source Matrix client) into a Discord-like experience. The Matrix protocol already supports most Discord features at the protocol level - the challenge is primarily **UI/UX transformation** and **feature mapping**.

**Why this is achievable:**
- Matrix protocol supports: rooms, spaces (≈servers), threads, reactions, voice/video, E2EE
- Element is Electron + React (same as Discord)
- Both use similar architecture patterns

**Estimated Timeline:** 6-9 months for MVP, 12-18 months for feature parity

---

## Architecture Overview

### Current Stack (Element)
```
┌─────────────────────────────────────┐
│         Element Desktop             │
│         (Electron Shell)            │
├─────────────────────────────────────┤
│         Element Web                 │
│         (React Application)         │
├─────────────────────────────────────┤
│         Matrix React SDK            │
│         (UI Components)             │
├─────────────────────────────────────┤
│         Matrix JS SDK               │
│         (Protocol Implementation)   │
├─────────────────────────────────────┤
│         Matrix Homeserver           │
│         (Synapse/Dendrite)          │
└─────────────────────────────────────┘
```

### Target Stack (Harmony)
```
┌─────────────────────────────────────┐
│         Harmony Desktop             │
│         (Electron Shell)            │
├─────────────────────────────────────┤
│         Harmony Web                 │
│         (React - Discord UI)        │
├─────────────────────────────────────┤
│         Harmony SDK                 │
│     (Discord-style Components)      │
├─────────────────────────────────────┤
│         Matrix JS SDK               │
│    (+ Custom Extensions/MSCs)       │
├─────────────────────────────────────┤
│         Matrix Homeserver           │
│    (+ Voice Server: LiveKit)        │
└─────────────────────────────────────┘
```

---

## Feature Mapping: Discord → Matrix

### ✅ Direct Mapping (Protocol Support Exists)

| Discord Feature | Matrix Equivalent | Notes |
|-----------------|-------------------|-------|
| Servers | Spaces | MSC1772, fully supported |
| Channels | Rooms within Spaces | Direct mapping |
| Text messages | m.room.message | Direct mapping |
| Reactions | m.reaction | Direct mapping |
| Replies | m.relates_to (reply) | Direct mapping |
| Threads | m.thread | MSC3440, supported |
| DMs | Direct rooms | Direct mapping |
| Group DMs | Private rooms | Direct mapping |
| User profiles | Profile API | Direct mapping |
| Typing indicators | m.typing | Direct mapping |
| Read receipts | m.read | Direct mapping |
| Mentions | Formatted body | Direct mapping |
| File uploads | m.file | Direct mapping |
| Images/Video | m.image, m.video | Direct mapping |
| Embeds | URL previews | Partial support |
| Pins | m.room.pinned_events | Direct mapping |
| Roles | Power levels | Different model but mappable |
| Permissions | Room state events | Granular control available |
| Bans/Kicks | Ban/Kick API | Direct mapping |
| Invite links | matrix.to links | Direct mapping |
| E2E Encryption | Megolm/Olm | Better than Discord! |

### ⚠️ Requires Custom Implementation

| Discord Feature | Matrix Status | Implementation Path |
|-----------------|---------------|---------------------|
| Voice channels | Element Call / LiveKit | Needs persistent room concept |
| Screen sharing | Element Call | Supported via LiveKit |
| Video streaming | LiveKit integration | Custom UI needed |
| Server discovery | Room directory | UI transformation |
| Server templates | Space templates | Custom implementation |
| Webhooks | Application Services | Different architecture |
| Bots/Slash commands | Application Services | Different but powerful |
| Nitro/Boosts | Custom events | Custom implementation |
| Activities | Not supported | Major custom work |
| Rich Presence | Custom events | Needs client support |
| Stickers | MSC2545 | Partial support |
| Stage channels | Element Call | UI adaptation |
| Forum channels | Threads in room | UI adaptation |

### ❌ Major Custom Development Required

| Discord Feature | Challenge | Solution |
|-----------------|-----------|----------|
| Server Boost tiers | No native equivalent | Custom state events + server-side logic |
| Nitro features | No native equivalent | Custom subscription system |
| Discord Activities | Complex integration | Would need separate service |
| Game detection | OS integration | Electron can do this |
| Spotify integration | API integration | Doable via Electron |

---

## Implementation Phases

### Phase 1: UI Foundation (Months 1-2)
**Goal:** Discord-like layout without breaking functionality

#### 1.1 Layout Restructure
- [ ] Replace Element's 3-panel layout with Discord's layout:
  ```
  ┌────┬──────────┬────────────────────┬──────┐
  │    │ Channels │                    │      │
  │ S  │ ──────── │    Message Area    │ Mem- │
  │ e  │ #general │                    │ bers │
  │ r  │ #random  │                    │      │
  │ v  │ ──────── │                    │      │
  │ e  │ Voice    │                    │      │
  │ r  │ ──────── │────────────────────│      │
  │ s  │ User     │    Input Area      │      │
  └────┴──────────┴────────────────────┴──────┘
  ```

#### 1.2 Component Redesign
- [ ] Server list (vertical icon strip, 48px circular icons)
- [ ] Channel list (collapsible categories, # prefix for text, 🔊 for voice)
- [ ] Message list (grouped by user, compact timestamps)
- [ ] Member list (role-based grouping, status indicators)
- [ ] User panel (bottom-left, avatar + status + settings)

#### 1.3 Theming System
- [ ] Implement Discord's color palette
  ```scss
  --background-primary: #313338;
  --background-secondary: #2b2d31;
  --background-tertiary: #1e1f22;
  --text-normal: #dbdee1;
  --text-muted: #949ba4;
  --brand-500: #5865f2;
  ```
- [ ] Dark theme (default)
- [ ] Light theme
- [ ] AMOLED theme

#### 1.4 Typography & Iconography
- [ ] Replace fonts with Discord's stack (Whitney, gg sans)
- [ ] Implement Discord's icon set (or equivalent open-source)
- [ ] Message formatting (markdown subset)

### Phase 2: Core Messaging Experience (Months 2-3)
**Goal:** Message UI/UX parity with Discord

#### 2.1 Message Components
- [ ] Message grouping (combine consecutive messages from same user)
- [ ] Timestamps (hover for full, periodic inline)
- [ ] Avatar click → user popup
- [ ] Username click → user popup
- [ ] Message hover actions (react, reply, more)
- [ ] Context menu (copy, pin, delete, etc.)

#### 2.2 Message Input
- [ ] Rich text editor with Discord-style formatting
- [ ] @mention autocomplete (users, roles, channels)
- [ ] Emoji picker (categorized, search, recent, custom)
- [ ] GIF picker (Tenor integration)
- [ ] Sticker picker
- [ ] File upload (drag & drop, paste)
- [ ] Reply preview bar
- [ ] Typing indicator ("User is typing...")

#### 2.3 Embeds & Previews
- [ ] URL previews (Open Graph parsing)
- [ ] Image galleries
- [ ] Video embeds (YouTube, Twitch, etc.)
- [ ] Code blocks with syntax highlighting
- [ ] Spoiler tags

#### 2.4 Reactions
- [ ] Quick react bar on hover
- [ ] Full emoji picker for reactions
- [ ] Reaction list with users
- [ ] Animated emoji support

### Phase 3: Server & Channel Management (Months 3-4)
**Goal:** Full server/channel Discord-like management

#### 3.1 Server Features
- [ ] Server creation wizard
- [ ] Server settings modal
  - [ ] Overview (name, icon, banner)
  - [ ] Roles (creation, ordering, permissions)
  - [ ] Emoji (custom emoji management)
  - [ ] Moderation settings
  - [ ] Audit log viewer
  - [ ] Integrations/Bots
  - [ ] Community features
- [ ] Server templates
- [ ] Server discovery listing

#### 3.2 Channel Features
- [ ] Channel creation modal
- [ ] Channel categories (collapsible)
- [ ] Channel settings
  - [ ] Name, topic, slowmode
  - [ ] Permission overrides
  - [ ] Webhooks
- [ ] Channel types:
  - [ ] Text channels
  - [ ] Voice channels (UI only this phase)
  - [ ] Announcement channels
  - [ ] Stage channels (UI only)
  - [ ] Forum channels

#### 3.3 Roles & Permissions
- [ ] Role hierarchy visualization
- [ ] Permission calculator
- [ ] Role colors in member list
- [ ] Role assignment UI
- [ ] @role mentions

### Phase 4: Voice & Video (Months 4-6)
**Goal:** Implement Discord-like voice/video experience

#### 4.1 Voice Infrastructure
- [ ] Integrate LiveKit (or similar WebRTC SFU)
- [ ] Voice channel state management
- [ ] Voice activity detection
- [ ] Push-to-talk support
- [ ] Noise suppression (Krisp-like)

#### 4.2 Voice UI
- [ ] Voice channel user list
- [ ] Speaking indicators (green ring)
- [ ] Mute/deafen controls
- [ ] Voice connected indicator
- [ ] Voice channel popout
- [ ] Server mute/deafen

#### 4.3 Video Features
- [ ] Video grid layout
- [ ] Screen sharing
- [ ] "Go Live" streaming
- [ ] Picture-in-picture
- [ ] Virtual backgrounds

#### 4.4 Stage Channels
- [ ] Speaker/audience model
- [ ] Raise hand feature
- [ ] Speaker management

### Phase 5: User Features (Months 5-6)
**Goal:** Complete user experience

#### 5.1 User Profiles
- [ ] Profile popup (avatar, banner, bio)
- [ ] Custom status
- [ ] Activity status (optional)
- [ ] Mutual servers/friends display
- [ ] Note on user
- [ ] Profile customization

#### 5.2 Friends System
- [ ] Friends list
- [ ] Friend requests
- [ ] Blocked users
- [ ] Online/offline filtering

#### 5.3 Direct Messages
- [ ] DM list (conversation style)
- [ ] Group DM creation
- [ ] Call from DM
- [ ] DM pinned messages

#### 5.4 User Settings
- [ ] My Account
- [ ] Privacy & Safety
- [ ] Authorized Apps
- [ ] Connections (Spotify, etc.)
- [ ] Voice & Video settings
- [ ] Notifications
- [ ] Keybinds
- [ ] Language
- [ ] Accessibility
- [ ] Streamer Mode
- [ ] Advanced (Developer Mode)

### Phase 6: Bots & Integrations (Months 6-8)
**Goal:** Bot ecosystem compatibility

#### 6.1 Bot Framework
- [ ] Slash command support
- [ ] Application commands UI
- [ ] Bot permissions
- [ ] Bot authorization flow

#### 6.2 Webhooks
- [ ] Webhook creation UI
- [ ] Webhook management
- [ ] Webhook avatar/name customization

#### 6.3 Integrations
- [ ] Integration browser
- [ ] OAuth2 flow for apps
- [ ] Spotify integration
- [ ] Twitch integration
- [ ] YouTube integration

### Phase 7: Polish & Parity (Months 7-9)
**Goal:** 1:1 feature and UX parity

#### 7.1 Animations & Transitions
- [ ] Message send animation
- [ ] Channel switch transitions
- [ ] Modal animations
- [ ] Reaction animations
- [ ] Typing indicator animation

#### 7.2 Keyboard Shortcuts
- [ ] Navigate servers (Ctrl+Alt+↑↓)
- [ ] Navigate channels (Alt+↑↓)
- [ ] Quick switcher (Ctrl+K)
- [ ] Mark as read (Escape)
- [ ] Search (Ctrl+F)
- [ ] All Discord keybinds

#### 7.3 Notifications
- [ ] Desktop notifications
- [ ] Notification settings per channel
- [ ] @everyone/@here controls
- [ ] Notification badges
- [ ] Unread indicators

#### 7.4 Search
- [ ] Message search
- [ ] Advanced filters (from:, in:, has:, before:, after:)
- [ ] Search results UI
- [ ] Jump to message

---

## Technical Challenges & Solutions

### Challenge 1: Voice Channels
**Problem:** Matrix's voice/video is call-based, not persistent channel-based.

**Solution:**
1. Use LiveKit for WebRTC infrastructure
2. Create custom "voice room" state in Matrix
3. Implement join/leave lifecycle separate from calls
4. Store voice channel members in room state

### Challenge 2: Server Boost Equivalent
**Problem:** No native monetization in Matrix.

**Solution:**
1. Custom state events for boost tracking
2. Server-side component for payment processing
3. Unlock features based on boost state

### Challenge 3: Real-time Member List
**Problem:** Large servers = performance issues.

**Solution:**
1. Lazy load member list
2. Use presence subscription judiciously
3. Implement virtual scrolling
4. Cache aggressively

### Challenge 4: Custom Emoji
**Problem:** Matrix has stickers but not server-specific emoji.

**Solution:**
1. Implement as custom state events per space
2. Client-side rendering of custom emoji shortcodes
3. Emoji sync across space rooms

### Challenge 5: Bot Compatibility
**Problem:** Discord bots use Discord API, not Matrix.

**Solution:**
1. Create Matrix Application Service framework
2. Bridge layer for Discord-like bot API
3. Slash command registration via room state

---

## Repository Structure

```
harmony/
├── apps/
│   ├── desktop/          # Electron shell (fork of element-desktop)
│   ├── web/              # React app (fork of element-web)
│   └── mobile/           # Future: React Native
├── packages/
│   ├── sdk/              # Harmony SDK (Discord-style components)
│   ├── matrix-ext/       # Matrix JS SDK extensions
│   ├── voice/            # LiveKit integration
│   └── themes/           # Theme packages
├── docs/
│   ├── architecture/
│   ├── api/
│   └── contributing/
└── scripts/
    ├── build/
    └── dev/
```

---

## Development Workflow

### Getting Started
```bash
# Clone the monorepo
git clone https://github.com/yourorg/harmony.git
cd harmony

# Install dependencies
yarn install

# Start development
yarn dev
```

### Key Scripts
```bash
yarn dev          # Start development servers
yarn build        # Build all packages
yarn test         # Run test suites
yarn lint         # Lint all code
yarn package      # Create desktop packages
```

---

## Team Requirements

### Minimum Team
- 2 Frontend Engineers (React, TypeScript)
- 1 Backend Engineer (Matrix, Rust/Python)
- 1 DevOps/Infrastructure
- 1 UI/UX Designer

### Ideal Team
- 4 Frontend Engineers
- 2 Backend Engineers
- 1 Voice/Video Specialist (WebRTC)
- 2 DevOps
- 1 UI/UX Designer
- 1 QA Engineer
- 1 Technical Writer

---

## Milestones

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| M1 | Month 2 | Discord-like layout, basic theming |
| M2 | Month 3 | Full messaging experience |
| M3 | Month 4 | Server/channel management |
| M4 | Month 6 | Voice channels working |
| M5 | Month 7 | User features complete |
| M6 | Month 8 | Bot framework |
| M7 | Month 9 | MVP Release |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LiveKit complexity | Medium | High | Start voice work early, hire specialist |
| Performance at scale | Medium | High | Continuous benchmarking, lazy loading |
| Matrix spec changes | Low | Medium | Track MSCs, participate in spec process |
| Legal (Discord look) | Medium | Medium | Distinct branding, clean-room UI design |
| Community adoption | Medium | High | Open source, community engagement |

---

## Success Metrics

1. **Feature Parity Score:** % of Discord features implemented
2. **Performance:** Message load time < 100ms, voice latency < 50ms
3. **Adoption:** Monthly active users, server count
4. **Community:** GitHub stars, contributors, forks
5. **Stability:** Crash rate < 0.1%, uptime 99.9%

---

## Next Steps

1. **Fork repositories** (element-desktop, element-web)
2. **Set up monorepo** structure
3. **Create design system** in Figma
4. **Begin Phase 1** layout work
5. **Recruit team** members

---

*Document Version: 1.0*
*Last Updated: 2026-02-09*
*Author: Sophie (AI Assistant)*
