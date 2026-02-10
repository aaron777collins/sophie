# Proactive Jobs

> ⚠️ **This is for CONTINUOUS PROJECT WORK only!**  
> For scheduled tasks (daily, weekly, etc.) use regular cron jobs instead.

> 🔢 **MAX 2 DEV TASKS IN-PROGRESS**
> - Keep at most 2 tasks with `Status: in-progress` at a time
> - Remaining tasks stay `Status: pending` (scheduled, not running)
> - This prevents resource contention and context switching overhead
> - When a task completes, the next pending task can be promoted

> 🚨 **FULL COMPLETION STANDARD**
> - "Done" means **PRODUCTION READY** — no placeholders, no stubs, no "iterate later"
> - If a feature needs SDK integration → INTEGRATE IT, don't stub it
> - If you can't fully complete something → be honest, don't claim it's done
> - Every completion must pass validation: builds, works end-to-end, no TODOs left

> 📝 **KEEP DOCS IN SYNC**
> - After completing tasks: update `HAOS-COMPREHENSIVE-TASKS.md` in the project repo!
> - Check off completed items, update summary counts

---

## Active Tasks

### haos-visual-validation
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** critical
- **Project:** haos
- **Description:** Validate HAOS UI matches Discord perfectly. Deploy and fix all visual issues.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Deploy to dev2, view in browser, screenshot, compare to Discord, fix until perfect
- **Instructions:**
  1. Build production: `cd /home/ubuntu/repos/haos/apps/web && yarn build`
  2. Deploy to dev2.aaroncollins.info (replace Element)
  3. View in browser, take screenshots of: login, server list, channels, messages, member list, voice panel
  4. Compare each to Discord screenshots (open Discord in another tab)
  5. Identify visual issues (spacing, colors, fonts, icons, alignment)
  6. Fix issues in CSS/TSX, rebuild, redeploy
  7. Repeat until GORGEOUS and professional
  8. Post comparison screenshots to Slack #aibot-chat

---

## Pending Tasks (Queued in Order)

### haos-phase1-remaining
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete remaining Phase 1 Foundation tasks (P1-027 to P1-076)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** See HAOS-COMPREHENSIVE-TASKS.md Phase 1 unchecked items
- **Instructions:**
  1. Read HAOS-COMPREHENSIVE-TASKS.md Phase 1 section
  2. Implement P1-027: Server reordering (drag and drop)
  3. Implement P1-028: Server folder creation modal
  4. Implement P1-029: Server folder color picker
  5. Implement P1-047: Channel create button per category
  6. Implement P1-048: Channel settings button (gear on hover)
  7. Implement P1-049: Invite creation button
  8. Implement P1-057: Custom status display
  9. Implement P1-058: Status picker popup
  10. Implement P1-075: Member activity display
  11. Implement P1-076: Member hover card trigger
  12. Run build, verify no errors
  13. Update HAOS-COMPREHENSIVE-TASKS.md with completions
  14. Git commit with descriptive message

### haos-phase2-messages
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 2 message display features (P2-015 to P2-035)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Virtual scrolling, jump button, markdown parsing
- **Instructions:**
  1. Implement P2-015: Virtual scrolling using react-window
  2. Implement P2-016: Jump to bottom FAB button
  3. Implement P2-025: Spoiler text (click to reveal)
  4. Implement P2-026: Code block syntax highlighting (highlight.js or prism)
  5. Implement P2-027: Inline code styling
  6. Implement P2-028: Quote block styling
  7. Implement P2-029: Header markdown (# ## ###)
  8. Implement P2-030: Bold/italic/underline/strikethrough
  9. Implement P2-031: List markdown (bullets/numbers)
  10. Implement P2-032: Link auto-detection
  11. Implement P2-033: Masked links [text](url)
  12. Implement P2-034: Timestamp formatting (<t:epoch:format>)
  13. Implement P2-035: Message search highlight
  14. Build and verify
  15. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase2-composer
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 2 composer features (P2-058 to P2-064)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Draft persistence, edit mode, reply preview
- **Instructions:**
  1. Implement P2-058: Draft persistence (localStorage per room)
  2. Implement P2-059: Slowmode indicator
  3. Implement P2-060: Permissions-based input disable
  4. Implement P2-061: Edit mode styling
  5. Implement P2-062: Reply preview bar
  6. Implement P2-063: Cancel reply button
  7. Implement P2-064: Rich text formatting toolbar
  8. Build and verify
  9. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase2-reactions
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 2 reaction features (P2-075 to P2-079)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Reaction tooltips, user list, custom emoji
- **Instructions:**
  1. Implement P2-075: Reaction user tooltip (show first 3 names)
  2. Implement P2-076: Reaction user list modal (all reactors)
  3. Implement P2-077: Custom emoji reactions
  4. Implement P2-078: Animated emoji reactions
  5. Implement P2-079: Super reactions (premium burst effect)
  6. Build and verify
  7. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase2-embeds
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 2 embed features (P2-118 to P2-121)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** GitHub, Reddit, generic embeds, suppression
- **Instructions:**
  1. Implement P2-118: GitHub embed (repo/issue/PR cards)
  2. Implement P2-119: Reddit embed (post preview)
  3. Implement P2-120: Generic link preview (fallback for unknown URLs)
  4. Implement P2-121: Embed suppression toggle (eye icon on message)
  5. Build and verify
  6. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase2-attachments
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 2 attachment features (P2-132 to P2-141)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Voice messages, file previews
- **Instructions:**
  1. Implement P2-132: Voice message recording
  2. Implement P2-133: Voice message waveform display
  3. Implement P2-134: Voice message playback speed control
  4. Implement P2-137: PDF preview (first page thumbnail)
  5. Implement P2-138: Text file preview (code preview)
  6. Implement P2-139: Attachment download all button
  7. Implement P2-140: Attachment size limit warning
  8. Implement P2-141: Attachment compression options
  9. Build and verify
  10. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase2-emoji
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 2 emoji/GIF/sticker system (P2-149 to P2-161)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Custom emoji upload, GIF picker, stickers, soundboard
- **Instructions:**
  1. Implement P2-149: Custom emoji upload
  2. Implement P2-150: Emoji slots display (free vs Nitro)
  3. Implement P2-151: Animated emoji support
  4. Implement P2-152: Emoji usage analytics (for frequently used)
  5. Implement P2-153: GIF picker integration (Tenor API)
  6. Implement P2-154: GIF search
  7. Implement P2-155: GIF categories/trending
  8. Implement P2-156: GIF favorites
  9. Implement P2-157: Sticker picker
  10. Implement P2-158: Sticker packs
  11. Implement P2-159: Sticker upload
  12. Implement P2-160: Soundboard UI (premium)
  13. Implement P2-161: Sound effects library
  14. Build and verify
  15. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase3-server-settings
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 3 server settings modal (P3-019 to P3-050)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Full server settings UI matching Discord
- **Instructions:**
  1. Create ServerSettingsModal.tsx component
  2. Implement settings navigation sidebar
  3. Create Overview tab (name, icon, banner, system messages)
  4. Create Roles tab (link to role editor)
  5. Create Emoji tab
  6. Create Stickers tab
  7. Create Moderation tab
  8. Create Audit Log tab
  9. Create Bans tab
  10. Create Integrations tab
  11. Create Widget tab
  12. Create Delete Server section (danger zone)
  13. Wire up all Matrix API calls
  14. Build and verify
  15. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase3-roles-complete
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete remaining role features (P3-085 to P3-095)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Role assignment UI, bulk operations, integration roles
- **Instructions:**
  1. Implement P3-085: Role assignment modal
  2. Implement P3-086: Bulk role assignment
  3. Implement P3-087: Role member list
  4. Implement P3-088: Role member count
  5. Implement P3-089: Channel permission overrides UI
  6. Implement P3-090: Permission calculator (effective perms display)
  7. Implement P3-091: Role templates (preset permissions)
  8. Implement P3-092: Role import/export
  9. Implement P3-093: Integration roles (for bots)
  10. Build and verify
  11. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase3-channels
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 3 channel management (P3-096 to P3-120)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Channel creation, settings, permissions
- **Instructions:**
  1. Create ChannelCreateModal.tsx
  2. Implement channel type selector (text/voice/forum/announcement)
  3. Create ChannelSettingsModal.tsx
  4. Implement channel overview edit
  5. Implement channel permissions tab
  6. Create permission override management UI
  7. Implement channel invites tab
  8. Implement channel webhooks tab
  9. Implement category creation/settings
  10. Implement channel reordering (drag and drop)
  11. Build and verify
  12. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase3-invites
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 3 invite system (P3-121 to P3-138)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Invite creation, management, welcome screen
- **Instructions:**
  1. Create InviteCreateModal.tsx
  2. Implement invite expiry/max uses options
  3. Create invite link display with copy button
  4. Create QR code generation
  5. Create ServerInviteList.tsx for managing invites
  6. Implement invite tracking
  7. Create WelcomeScreenEditor.tsx
  8. Build and verify
  9. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase4-voice-complete
- **Type:** continuous
- **Min Model:** opus
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 4 voice channel features (P4-011 to P4-045)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Voice settings, moderation, push-to-talk
- **Instructions:**
  1. Implement P4-011: Voice quality settings UI
  2. Implement P4-012: Echo cancellation toggle
  3. Implement P4-013: Noise suppression toggle
  4. Implement P4-014: Automatic gain control
  5. Implement P4-015: Voice diagnostics panel
  6. Implement P4-028: Server mute (moderator action)
  7. Implement P4-029: Server deafen (moderator action)
  8. Implement P4-030: Move user to channel
  9. Implement P4-031: Disconnect user
  10. Implement P4-032: Per-user volume control
  11. Implement P4-034: Push-to-talk mode
  12. Implement P4-035: Push-to-talk keybind setting
  13. Implement P4-036: Voice activity sensitivity slider
  14. Implement P4-037: Input device selector
  15. Implement P4-038: Output device selector
  16. Implement P4-039-040: Volume test buttons
  17. Build and verify
  18. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase4-voice-ui
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 4 voice UI features (P4-050 to P4-065)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Voice status bar, popout, controls
- **Instructions:**
  1. Implement P4-050: Voice popout window
  2. Implement P4-051: Voice status bar channel name
  3. Implement P4-052: Latency indicator in status bar
  4. Implement P4-053: Connection quality indicator
  5. Implement P4-054: Screen share button
  6. Implement P4-055: Video toggle button
  7. Implement P4-056: Full screen button
  8. Implement P4-057: Picture-in-picture button
  9. Implement P4-058: Soundboard button
  10. Implement P4-059: Activities button
  11. Implement P4-060: Voice user context menu
  12. Build and verify
  13. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase4-video
- **Type:** continuous
- **Min Model:** opus
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 4 video features (P4-066 to P4-085)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Video grid, camera controls, virtual background
- **Instructions:**
  1. Create VideoGrid.tsx component (1-25 participants)
  2. Create VideoTile.tsx component
  3. Implement focus mode (spotlight speaker)
  4. Implement camera on/off toggle
  5. Create camera device selector
  6. Create camera preview
  7. Implement virtual background (TensorFlow.js)
  8. Implement background blur
  9. Create video quality settings
  10. Implement pin participant
  11. Implement video reactions (emoji overlay)
  12. Implement hand raise
  13. Build and verify
  14. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase4-screenshare
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 4 screen share features (P4-086 to P4-095)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Screen share picker, options, preview
- **Instructions:**
  1. Create ScreenSharePicker.tsx (screens/windows/tabs)
  2. Implement screen share with audio toggle
  3. Create quality selector (720p/1080p/source)
  4. Create FPS selector (15/30/60)
  5. Implement screen share preview before starting
  6. Implement application window share
  7. Implement browser tab share
  8. Build and verify
  9. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase4-stage
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** low
- **Project:** haos
- **Description:** Complete Phase 4 stage channel features (P4-096 to P4-105)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Stage channels for larger audio events
- **Instructions:**
  1. Create StageChannel.tsx component
  2. Implement speakers list (on stage)
  3. Implement audience list
  4. Implement raise hand functionality
  5. Implement invite to speak (moderator)
  6. Implement move to audience (moderator)
  7. Create stage topic display
  8. Create stage started notification
  9. Build and verify
  10. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase5-profile
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 5 user profile features (P5-007 to P5-025)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Profile modal with full Discord features
- **Instructions:**
  1. Implement P5-007: About me section
  2. Implement P5-008: Member since date
  3. Implement P5-009: Joined server date
  4. Implement P5-010: Roles display
  5. Implement P5-011: Note (personal note about user)
  6. Implement P5-012: Mutual servers
  7. Implement P5-013: Mutual friends
  8. Implement P5-014: Connections (Twitter, GitHub, etc)
  9. Implement P5-015: Spotify activity display
  10. Implement P5-016: Game activity display
  11. Implement P5-017: Custom status display
  12. Create ProfileEditModal.tsx
  13. Implement avatar upload
  14. Implement banner upload
  15. Implement bio edit
  16. Build and verify
  17. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase5-settings
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 5 user settings tabs (P5-028 to P5-055)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Full user settings modal
- **Instructions:**
  1. Implement My Account tab (password, email, phone, 2FA)
  2. Implement Profile tab
  3. Implement Privacy & Safety tab
  4. Implement Authorized Apps tab
  5. Implement Connections tab (add connections flow)
  6. Implement Appearance tab (theme, display mode)
  7. Implement Accessibility tab
  8. Implement Voice & Video tab
  9. Implement Keybinds tab
  10. Implement Language tab
  11. Implement Notifications tab
  12. Implement Activity Status tab
  13. Implement Devices tab (logged in sessions)
  14. Build and verify
  15. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase5-status
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 5 status system (P5-061 to P5-070)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Custom status, activity sync
- **Instructions:**
  1. Create CustomStatusModal.tsx
  2. Implement status emoji picker
  3. Implement status text input
  4. Implement clear after selector
  5. Implement activity sync structure (for Spotify, games)
  6. Implement game detection (if desktop)
  7. Create rich presence display
  8. Implement Playing/Listening/Streaming status types
  9. Build and verify
  10. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase5-friends
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 5 friends & DMs (P5-071 to P5-098)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Friends list, DMs, group DMs, calls
- **Instructions:**
  1. Create FriendsTab.tsx (Home view)
  2. Implement Online/All/Pending/Blocked sections
  3. Create AddFriendModal.tsx
  4. Implement friend request flow
  5. Implement accept/reject/block actions
  6. Create DM list component
  7. Create group DM creation flow
  8. Implement group DM management
  9. Create voice/video call UI for DMs
  10. Implement call ring indicator
  11. Build and verify
  12. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase5-notifications
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 5 notification features (P5-101 to P5-118)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Desktop notifications, notification settings, inbox
- **Instructions:**
  1. Implement desktop notifications (Web Notification API)
  2. Implement notification sounds
  3. Create per-channel notification settings
  4. Create per-server notification settings
  5. Implement notification mute timing
  6. Implement suppress @everyone/@here options
  7. Create unread channel indicator
  8. Implement mark as read (channel/server/all)
  9. Create Inbox component (mentions + unreads tabs)
  10. Build and verify
  11. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase5-user-actions
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 5 user action menus (P5-119 to P5-138)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Context menus, moderation actions
- **Instructions:**
  1. Create user context menu
  2. Create member context menu (in server)
  3. Implement nickname change (for members)
  4. Implement role management from context menu
  5. Implement mute/deafen/move/kick/ban/timeout
  6. Create timeout duration picker
  7. Implement report user/message flow
  8. Build and verify
  9. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase6-moderation
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 6 moderation actions (P6-001 to P6-020)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Kick, ban, timeout, message moderation
- **Instructions:**
  1. Create KickModal.tsx
  2. Create BanModal.tsx with delete messages option
  3. Create TimeoutModal.tsx with duration picker
  4. Implement unban action
  5. Implement message delete (single and bulk)
  6. Implement message pin/unpin
  7. Implement slow mode setter
  8. Implement channel lock
  9. Create server lockdown mode
  10. Build and verify
  11. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase6-audit-log
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 6 audit log (P6-021 to P6-035)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Audit log viewer with filters
- **Instructions:**
  1. Create AuditLogViewer.tsx
  2. Implement filter by action type
  3. Implement filter by user
  4. Implement filter by date range
  5. Create AuditLogEntry.tsx component
  6. Implement action type icons
  7. Create before/after diff view
  8. Map Matrix room state events to audit log format
  9. Build and verify
  10. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase6-automod
- **Type:** continuous
- **Min Model:** opus
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 6 AutoMod system (P6-036 to P6-060)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Full AutoMod with keyword/spam/link filters
- **Instructions:**
  1. Create AutoModSettings.tsx panel
  2. Create io.haos.automod state event type
  3. Implement keyword filter rule (blocklist editor)
  4. Implement spam filter rule
  5. Implement mention spam filter
  6. Implement link filter with allowlist
  7. Implement invite link filter
  8. Implement NSFW/profanity presets
  9. Create AutoMod actions (block, timeout, alert)
  10. Create exempt roles/channels config
  11. Create AutoMod log channel
  12. Create AutoMod alert embeds
  13. Build and verify
  14. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase6-reports
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** low
- **Project:** haos
- **Description:** Complete Phase 6 reports & safety (P6-061 to P6-075)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Report system, safety features
- **Instructions:**
  1. Create ReportModal.tsx (for messages and users)
  2. Implement report categories
  3. Create reports inbox for moderators
  4. Implement report resolution actions
  5. Create user safety hub
  6. Implement blocked user management
  7. Implement DM request filtering
  8. Build and verify
  9. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase7-search
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 7 message search (P7-003 to P7-020)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Full message search with filters
- **Instructions:**
  1. Implement search query parsing
  2. Implement filters: from, mentions, has:attachment, has:link, has:embed
  3. Implement date filters: before, after
  4. Implement channel filter
  5. Create search results list
  6. Create search result message preview
  7. Implement jump to message from result
  8. Implement search result highlight
  9. Implement search pagination
  10. Build and verify
  11. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase7-quickswitcher
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 7 quick switcher (P7-021 to P7-030)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Ctrl+K quick navigation
- **Instructions:**
  1. Create QuickSwitcher.tsx modal
  2. Implement recent destinations section
  3. Implement channel/server/DM/user search
  4. Create keyboard navigation (up/down/enter)
  5. Create search result icons and indicators
  6. Implement quick actions (mute, leave)
  7. Bind to Ctrl+K keyboard shortcut
  8. Build and verify
  9. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase7-discovery
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** low
- **Project:** haos
- **Description:** Complete Phase 7 server discovery (P7-031 to P7-050)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Server discovery hub (if applicable)
- **Instructions:**
  1. Create ServerDiscovery.tsx hub
  2. Create ServerCard.tsx component
  3. Implement server categories
  4. Implement server search
  5. Create server preview modal
  6. Implement join server flow
  7. Build and verify
  8. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase7-navigation
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 7 navigation features (P7-061 to P7-068)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Breadcrumbs, history, deep linking
- **Instructions:**
  1. Implement breadcrumb navigation
  2. Implement back/forward navigation buttons
  3. Implement history navigation shortcuts (Ctrl+[/])
  4. Implement deep linking (URLs to channels/messages)
  5. Implement invite URL handling
  6. Build and verify
  7. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase8-animations
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 8 animations & micro-interactions (P8-004 to P8-020)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Polish animations throughout
- **Instructions:**
  1. Implement loading spinners
  2. Implement skeleton loaders
  3. Implement page/modal transitions
  4. Implement dropdown/tooltip animations
  5. Create toast notification system with animations
  6. Implement avatar hover effects
  7. Implement button ripple effect
  8. Implement typing indicator animation polish
  9. Implement reaction add animation
  10. Implement message send animation
  11. Build and verify
  12. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase8-performance
- **Type:** continuous
- **Min Model:** opus
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 8 performance optimizations (P8-021 to P8-035)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Code splitting, lazy loading, optimization
- **Instructions:**
  1. Implement code splitting for routes
  2. Implement lazy loading for heavy components
  3. Implement image lazy loading
  4. Optimize virtual scrolling
  5. Audit and add React.memo where beneficial
  6. Audit useMemo/useCallback usage
  7. Analyze and reduce bundle size
  8. Audit tree shaking
  9. Optimize font loading
  10. Implement service worker for caching
  11. Build and verify bundle size improvement
  12. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase8-accessibility
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete Phase 8 accessibility (P8-036 to P8-050)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** A11y audit and fixes
- **Instructions:**
  1. Run screen reader testing
  2. Audit and fix ARIA labels
  3. Audit and fix ARIA roles
  4. Ensure full keyboard navigation
  5. Implement focus trap in modals
  6. Add skip links
  7. Audit color contrast (WCAG AA)
  8. Implement reduced motion support
  9. Implement high contrast mode option
  10. Ensure proper font scaling
  11. Build and verify
  12. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase8-premium
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** low
- **Project:** haos
- **Description:** Complete Phase 8 premium features UI (P8-051 to P8-070)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Premium/Nitro equivalent UI
- **Instructions:**
  1. Create Nitro upsell modals
  2. Create premium badge display
  3. Implement animated avatar support
  4. Create avatar decoration shop UI
  5. Implement profile banner support
  6. Create profile effect shop UI
  7. Implement custom emoji anywhere indicator
  8. Create server boost UI
  9. Create boost perks display
  10. Build and verify
  11. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase8-polish
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 8 final polish (P8-071 to P8-085)
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Error handling, onboarding, final touches
- **Instructions:**
  1. Create error boundary UI with friendly messages
  2. Create 404 page
  3. Create maintenance page
  4. Implement rate limit handling UI
  5. Create connection status indicator
  6. Create reconnecting overlay
  7. Create changelog modal
  8. Create what's new popup
  9. Create onboarding flow for new users
  10. Create server onboarding
  11. Create keyboard shortcuts modal (Ctrl+/)
  12. Create About dialog
  13. Build and verify
  14. Update HAOS-COMPREHENSIVE-TASKS.md
  15. FINAL: Full visual comparison to Discord

---

## Archived Tasks

### haos-phase3-server-wizard
- **Completed:** 2026-02-10 15:35 EST
- **Model Used:** opus (eb23f05e-f5a2-46b0-8f95-b4c6d12f6ee3)
- **Notes:** Complete Discord-style server creation wizard (ServerCreateWizard.tsx). Implements P3-001 to P3-018: 4 templates (Gaming, Friends, Community, Creators), avatar upload with preview/initials, server name validation, full Matrix Space creation with categories and channels. Git commit 84896b6.

### haos-phase3-roles
- **Completed:** 2026-02-10 01:00 EST
- **Model Used:** opus
- **Notes:** Complete Discord-style role system with 57 permissions (exceeds 50+ requirement). Implemented types, constants, permissions calculator, HaosRoleStore, useRoles hooks, and full UI (RoleList, RoleEditor, PermissionEditor, ColorPicker). Custom Matrix state events (io.haos.roles, io.haos.member_roles, io.haos.channel_overrides). Bidirectional Matrix power level sync. Build passes.

### haos-phase1-themes
- **Completed:** 2026-02-10 01:20 EST
- **Model Used:** opus
- **Notes:** All P1-073 to P1-079 complete. Light theme, AMOLED theme, theme switcher with 9 preset accent colors + custom hue, smooth transitions, documentation. Build passes. Visual validation needed via haos-visual-validation task.

### haos-phase4-voice-infra
- **Completed:** 2026-02-10 16:45 EST
- **Model Used:** opus
- **Notes:** Voice infrastructure was already fully implemented. Validated: types.ts (io.haos.voice.* state events), VoiceConnectionManager.ts (auto-reconnect), HaosVoiceStore.ts, hooks/useHaosVoice.ts. Components updated. TypeScript compiles, build passes.

### haos-phase2-threads
- **Completed:** 2026-02-10 01:15 EST
- **Model Used:** opus
- **Notes:** Complete thread system (P2-102 to P2-107). Implemented thread preview in main chat, archive/unarchive via room account data, member count from timeline events, per-thread notifications, auto-archive, and full threads list panel with filtering/sorting. All Matrix SDK integrated. Git commit 61a9baa.

### haos-phase2-embeds
- **Completed:** 2026-02-10 00:46 EST
- **Model Used:** opus
- **Notes:** Full implementation of URL preview service and platform-specific embeds. Created SpotifyEmbed, TwitchEmbed, EmbedDetector. Enhanced HaosEmbed (removed TODOs), YouTubeEmbed (startTime), url-preview-service (Matrix SDK integration). Added Twitch CSS. All in commit 84896b6.

### haos-phase2-autocomplete
- **Completed:** 2026-02-10 01:00 EST
- **Model Used:** opus
- **Notes:** Created CommandAutocomplete.tsx. Fixed TypeScript warnings. CSS overrides apply Discord styling to existing Element autocomplete. All 4 types complete: @mentions, #channels, :emoji:, /commands. Git commit ddb9fca.

### haos-implementation
- **Completed:** 2026-02-09 23:30 EST
- **Model Used:** sonnet
- **Notes:** Phase 2 CSS and Phase 3 TSX complete. Build passing. Transitioned to phase-specific tasks.
