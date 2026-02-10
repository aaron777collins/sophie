# HAOS Full Validation Plan

> Created: 2026-02-10 09:15 EST
> Goal: Validate every aspect of HAOS is perfect, beautiful, matches Discord, and fix anything missing
> Note: Payment features skipped per Aaron's request - all features available

---

## Overview

This plan breaks down into:
1. **Deploy Phase** - Get latest HAOS on dev2
2. **Visual Validation** - Screenshot-based Discord comparison
3. **Functional Validation** - Test every feature works
4. **Fix Phase** - Repair anything not perfect

---

## Phase A: Deployment (5 tasks)

### A-001: Build Latest HAOS
- Build the webapp on dev3
- Verify no build errors
- Status: in-progress

### A-002: Deploy to dev2
- Copy built webapp to dev2:/home/ubuntu/haos-webapp/
- Restart nginx container to pick up changes
- Verify accessible at https://haos.dev2.aaroncollins.info

### A-003: Verify Matrix Backend
- Synapse healthy
- Postgres healthy
- LiveKit operational
- Coturn configured

### A-004: Test Login Flow
- Register new account
- Login existing account
- Verify homeserver detection

### A-005: Stop Element (if separate)
- Note: Element container IS serving HAOS, don't stop it
- Just ensure only HAOS is served, not original Element

---

## Phase B: Visual Validation - Theme & Colors (15 tasks)

### B-001: Dark Theme - Background Colors
- Main background: #36393f
- Sidebar: #2f3136
- Channels: #202225
- Text primary: #dcddde
- Text muted: #72767d

### B-002: Dark Theme - Blurple Accent
- Primary: #5865f2
- Hover: #4752c4
- Active: #3c45a5
- Check buttons, links, mentions

### B-003: Light Theme - Backgrounds
- Main: #ffffff
- Sidebar: #f2f3f5
- Proper contrast

### B-004: AMOLED Theme
- Pure black backgrounds
- Proper text contrast

### B-005: Accent Color Picker
- 9 presets work
- Custom hue slider works
- Theme applies to all UI elements

### B-006: Server Icon Styling
- Round 48px icons
- Squircle on hover
- Selection pill indicator
- Unread dot, mention badge

### B-007: Channel Sidebar Styling
- 240px width
- Category headers
- Channel items with icons
- Hover/selected states

### B-008: Message Styling
- Cozy mode layout
- Avatar 40px
- Username colors match roles
- Timestamp formatting

### B-009: Composer Styling
- Textarea appearance
- Button icons
- Placeholder text
- Character count

### B-010: Modal Styling
- Discord-style modals
- Overlay opacity
- Border radius
- Shadows

### B-011: Button Styling
- Blurple primary buttons
- Gray secondary buttons
- Red danger buttons
- Proper hover states

### B-012: Input Field Styling
- Dark backgrounds
- Focus outlines
- Placeholder text color

### B-013: Scrollbar Styling
- Thin scrollbars
- Dark track
- Rounded thumb

### B-014: Tooltip Styling
- Dark background
- Arrow pointer
- Proper positioning

### B-015: Context Menu Styling
- Dark background
- Hover highlights
- Icons aligned
- Danger items red

---

## Phase C: Visual Validation - Components (25 tasks)

### C-001: Server List Panel
- DM button at top
- Server icons in list
- Add server button
- Explore button
- Folder grouping

### C-002: Channel Sidebar
- Server header with dropdown
- Categories collapsible
- Text/voice/announcement channels
- User panel at bottom

### C-003: User Panel
- Avatar with status indicator
- Username display
- Mute/deafen/settings buttons
- Custom status

### C-004: Channel Header
- Channel name and icon
- Topic (truncated)
- Threads/pins/members/search buttons

### C-005: Message List
- Message grouping
- Date separators
- New messages divider
- Hover toolbar

### C-006: Message Composer
- Attachment button
- GIF/sticker/emoji buttons
- Textarea
- Typing indicator

### C-007: Member List
- Role sections
- Member items
- Status indicators
- Activity display

### C-008: User Profile Modal
- Banner
- Avatar
- Username/discriminator
- About me, roles, connections

### C-009: Server Settings Modal
- Navigation sidebar
- All settings tabs
- Save/cancel buttons

### C-010: User Settings Modal
- Navigation sidebar
- All settings tabs
- Log out button

### C-011: Server Create Wizard
- Template selection
- Server name input
- Icon upload
- Step navigation

### C-012: Emoji Picker
- Category tabs
- Search
- Emoji grid
- Skin tone selector

### C-013: GIF Picker
- Tenor integration
- Categories
- Search
- Preview

### C-014: Reaction Display
- Reaction pills
- Count badge
- Add reaction button

### C-015: Thread Panel
- Thread list
- Thread messages
- Reply composer

### C-016: Embed Preview
- Rich embeds
- YouTube/Spotify/Twitter
- Link previews

### C-017: Attachment Display
- Image gallery
- Video player
- Audio waveform
- File cards

### C-018: Voice Channel UI
- User list in sidebar
- Speaking indicators
- Join/leave buttons

### C-019: Voice Panel
- Connection status
- User tiles
- Controls (mute/deafen/disconnect)

### C-020: Role Editor
- Color picker
- Permission toggles
- Role list drag

### C-021: Channel Settings
- Overview tab
- Permissions tab
- Invite/webhooks

### C-022: Invite Modal
- Link display
- Copy button
- QR code
- Expiry options

### C-023: Friends List
- Online/All/Pending/Blocked tabs
- Friend items
- Add friend button

### C-024: DM List
- DM items
- Group DM icons
- Search

### C-025: Quick Switcher
- Ctrl+K trigger
- Search results
- Keyboard navigation

---

## Phase D: Functional Validation - Core Features (30 tasks)

### D-001: User Registration
- Create account
- Email verification (if enabled)
- Username validation

### D-002: User Login
- Existing account login
- Remember me
- Logout

### D-003: Create Server
- Wizard flow
- Template selection
- Icon upload
- Default channels created

### D-004: Join Server
- Invite link works
- Welcome screen
- Initial channels visible

### D-005: Create Channel
- Text channel
- Voice channel
- Category
- Private channel

### D-006: Send Message
- Text message sends
- Appears in real-time
- Notification to others

### D-007: Edit Message
- Edit mode works
- "edited" indicator
- Escape cancels

### D-008: Delete Message
- Delete works
- Message removed
- Mod delete others

### D-009: Reply to Message
- Reply reference shows
- Click to jump
- Reply preview in composer

### D-010: Reactions
- Add reaction
- Remove reaction
- See who reacted

### D-011: Attachments
- Image upload
- File upload
- Preview works
- Download works

### D-012: Embeds
- URL previews
- YouTube plays
- Spotify shows

### D-013: Emoji Picker
- Select emoji
- Inserts in message
- Custom emoji (if any)

### D-014: GIF Picker
- Search GIFs
- Select inserts
- Plays inline

### D-015: Threads
- Create thread
- Reply in thread
- Thread list shows

### D-016: Markdown
- Bold/italic
- Code blocks
- Quotes
- Lists

### D-017: Mentions
- @user autocomplete
- @role
- @everyone/@here

### D-018: Voice Join
- Click to join
- Audio works
- Speaking indicator

### D-019: Voice Mute/Deafen
- Self mute
- Self deafen
- UI updates

### D-020: Voice Disconnect
- Leave voice
- Panel updates

### D-021: Video Call (DM)
- Start call
- Video works
- End call

### D-022: Screen Share
- Share screen
- Others see it
- Stop share

### D-023: User Profile
- View profile
- Edit profile
- Avatar upload

### D-024: User Settings
- All tabs work
- Changes save
- Theme switch

### D-025: Server Settings
- All tabs work
- Changes save
- Roles editable

### D-026: Role Management
- Create role
- Edit permissions
- Assign to member

### D-027: Channel Permissions
- Override permissions
- Test visibility
- Test send ability

### D-028: Friends System
- Send request
- Accept/reject
- Remove friend

### D-029: DM Creation
- Start DM
- Send message
- Group DM

### D-030: Notifications
- Unread indicators
- Mention badges
- Desktop notifications

---

## Phase E: Functional Validation - Advanced (20 tasks)

### E-001: Drag Reorder Servers
- Drag server icon
- Order persists

### E-002: Drag Reorder Channels
- Drag channel
- Move between categories

### E-003: Server Folders
- Create folder
- Add servers
- Color picker

### E-004: Channel Settings
- Edit name/topic
- Slowmode
- NSFW toggle

### E-005: Invite System
- Create invite
- Set expiry
- Track uses

### E-006: Audit Log
- View actions
- Filter by type
- Filter by user

### E-007: Bans
- Ban user
- View ban list
- Unban

### E-008: Timeout
- Timeout user
- Duration picker
- Remove timeout

### E-009: Search Messages
- Search works
- Filters work
- Jump to result

### E-010: Pin Messages
- Pin message
- View pins
- Unpin

### E-011: Keyboard Shortcuts
- Ctrl+K quick switcher
- Escape close modal
- Enter send message

### E-012: Typing Indicator
- Shows when typing
- Multiple users
- Stops when done

### E-013: Online Status
- Set status
- Custom status
- Visible to others

### E-014: Activity Status
- Shows playing/listening
- Syncs properly

### E-015: Connections
- Add connection
- Show on profile

### E-016: Member List
- Shows by role
- Offline collapsed
- Count accurate

### E-017: Thread Archive
- Archive thread
- Unarchive
- Auto-archive works

### E-018: Voice Settings
- Input device
- Output device
- Volume controls

### E-019: Appearance Settings
- Theme switch
- Display mode
- Accessibility options

### E-020: Privacy Settings
- DM settings
- Friend request settings
- Block list

---

## Phase F: Fix Tasks (Created as issues found)

Issues discovered during validation will spawn fix tasks:
- Min Model: sonnet (or opus for complex fixes)
- Each fix task gets clear steps
- Validation re-run after fix

---

## Execution Order

1. Complete Phase A (deploy)
2. Phase B (visual themes) - take screenshots, compare to Discord
3. Phase C (visual components) - screenshot each component
4. Phase D (core functional) - test each feature
5. Phase E (advanced) - test advanced features
6. Phase F - fix all issues found
7. Re-validate fixed items

---

## Success Criteria

- All visual elements match Discord style
- All features functional
- No console errors
- No broken layouts
- Responsive on different screen sizes
- Theme switching works
- All CRUD operations work
- Voice/video works
- Search works
- Notifications work

