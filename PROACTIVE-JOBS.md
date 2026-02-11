# HAOS Proactive Jobs - Master Queue

> **Project:** HAOS (Discord UI + Matrix Backend)
> **Goal:** Production-ready, self-hostable, PIXEL-PERFECT Discord clone
> **Reference:** Discord screenshots saved in `haos/docs/reference/`
> **Last Updated:** 2026-02-11 00:15 EST

---

## Rules

> 🔢 **MAX 2 DEV TASKS IN-PROGRESS** at any time
> 🚨 **FULL COMPLETION STANDARD** — no stubs, no placeholders, production-ready only
> 📝 **UPDATE DOCS** — check off items in HAOS-COMPREHENSIVE-TASKS.md after each task
> 🔀 **COMMIT & PUSH** — merge to main branch after each completed task
> 🚀 **DEPLOY TO DEV2** — after each feature task:
> ```bash
> cd /home/ubuntu/repos/haos/apps/web && yarn build
> rsync -avz --delete webapp/ dev2:/home/ubuntu/haos/dist/
> ssh dev2 "docker restart haos-web 2>/dev/null || true"
> ```
> 📸 **VISUAL COMPARE** — after each UI task, screenshot dev2 and compare to Discord:
> ```bash
> node /home/ubuntu/repos/haos/scripts/screenshot-compare.js
> # Compare output with docs/reference/discord-reference-1.png
> ```

---

## ⚠️ CRITICAL: Visual Overhaul Required

The current HAOS UI does NOT look like Discord. This is the #1 priority.

**Reference screenshots:** `/home/ubuntu/repos/haos/docs/reference/`
- `discord-reference-1.png` — Full Discord UI (server list, channels, messages, members)
- `discord-reference-2.png` — Same screenshot for comparison

**Goal:** HAOS must be indistinguishable from Discord when logged in.

---

## Currently Running

### haos-visual-overhaul ⏳ PRIORITY 1
- **Status:** in-progress
- **Agent:** Doing comprehensive visual comparison and fixes
- **Goal:** Make HAOS look EXACTLY like Discord

---

## ═══════════════════════════════════════════════════════════
## WAVE 0: VISUAL OVERHAUL (CRITICAL - DO THIS FIRST)
## ═══════════════════════════════════════════════════════════

### haos-visual-overhaul
- **Priority:** CRITICAL
- **Min Model:** opus
- **Description:** Make HAOS look exactly like Discord
- **Status:** pending
- **Instructions:**
  1. Open Discord reference: `/home/ubuntu/repos/haos/docs/reference/discord-reference-1.png`
  2. Take screenshot of HAOS: `node scripts/screenshot-compare.js`
  3. Compare EVERY element side-by-side:
  
  **Server List (Left Bar):**
  - Width: 72px
  - Icons: 48px round, squircle on hover
  - Spacing: 8px between icons
  - Selection pill: 4px wide white bar
  - Unread dot: white circle
  - Folder expand animation
  
  **Channel Sidebar:**
  - Width: 240px  
  - Background: #2f3136
  - Server name header with dropdown
  - Categories: collapsible, uppercase text
  - Channel items: # icon, hover background
  - User panel at bottom: avatar, name, status, buttons
  
  **Message Area:**
  - Background: #36393f
  - Header: channel name, topic, icons
  - Messages: 40px avatars, name in color, timestamp
  - Message grouping (same author within 7min)
  - Hover: background highlight, action buttons
  - Composer: rounded, attachment button, emoji
  
  **Member List (Right):**
  - Width: 240px
  - Background: #2f3136
  - Role headers (collapsible)
  - Member items: avatar, name in role color, status dot
  - Activity display
  
  4. Document EVERY difference in `/home/ubuntu/repos/haos/docs/VISUAL-DIFFERENCES.md`
  5. Fix EVERY difference
  6. Rebuild and deploy to dev2
  7. Screenshot again and verify
  8. Repeat until pixel-perfect

### haos-visual-colors
- **Priority:** CRITICAL
- **Min Model:** sonnet
- **Description:** Fix all colors to match Discord exactly
- **Status:** pending
- **Instructions:**
  Discord color palette:
  - Background dark: #202225
  - Background medium: #2f3136
  - Background light: #36393f
  - Background lighter: #40444b
  - Text normal: #dcddde
  - Text muted: #72767d
  - Text link: #00aff4
  - Blurple: #5865F2
  - Green: #3ba55d
  - Red: #ed4245
  - Yellow: #faa81a
  
  1. Audit all CSS for color values
  2. Replace any non-matching colors
  3. Ensure dark theme matches Discord dark theme
  4. Deploy and verify

### haos-visual-layout
- **Priority:** CRITICAL
- **Min Model:** sonnet
- **Description:** Fix layout structure to match Discord
- **Status:** pending
- **Instructions:**
  1. Server list: fixed 72px width
  2. Channel sidebar: fixed 240px width
  3. Member list: fixed 240px width, hideable
  4. Message area: flex-grow to fill remaining space
  5. Ensure no Element-specific layout leaking through
  6. Deploy and verify

### haos-visual-fonts
- **Priority:** high
- **Min Model:** sonnet
- **Description:** Fix fonts to match Discord
- **Status:** pending
- **Instructions:**
  Discord uses: gg sans, Noto Sans, Whitney (fallbacks)
  Font sizes:
  - Channel names: 16px
  - Message text: 16px (1rem)
  - Timestamps: 12px
  - Category headers: 12px uppercase
  
  1. Import/configure correct fonts
  2. Set correct sizes throughout
  3. Deploy and verify

### haos-visual-components
- **Priority:** high
- **Min Model:** opus
- **Description:** Fix individual components to match Discord
- **Status:** pending
- **Instructions:**
  Components to fix:
  - Server icons (hover animation to squircle)
  - Channel items (icon, name, hover state)
  - Message bubbles (avatar position, timestamp)
  - User avatars (sizes, status indicator position)
  - Buttons (Discord button styles)
  - Inputs (Discord input styles)
  - Modals (Discord modal styles)
  - Tooltips (Discord tooltip styles)
  - Context menus (Discord context menu styles)
  
  1. Fix each component one by one
  2. Deploy and verify after each

---

## ═══════════════════════════════════════════════════════════
## WAVE 1: INFRASTRUCTURE (After Visual Overhaul)
## ═══════════════════════════════════════════════════════════

### haos-self-hosting-private-mode
- **Priority:** high
- **Description:** Private deployment mode
- **Status:** pending

### haos-self-hosting-setup-wizard
- **Priority:** high
- **Description:** First-run setup wizard
- **Status:** pending

### haos-self-hosting-docker-stack
- **Priority:** high
- **Description:** Complete Docker stack
- **Status:** pending

### haos-self-hosting-docs
- **Priority:** high
- **Description:** Self-hosting documentation
- **Status:** pending

### haos-admin-dashboard
- **Priority:** medium
- **Description:** Admin dashboard
- **Status:** pending

### haos-unit-testing
- **Priority:** high
- **Description:** Unit tests for HAOS modules
- **Status:** pending

### haos-mobile-testing
- **Priority:** medium
- **Description:** Mobile responsiveness
- **Status:** pending

---

## ═══════════════════════════════════════════════════════════
## WAVE 2-5: FEATURE COMPLETION
## ═══════════════════════════════════════════════════════════

### haos-phase2-remaining
- **Priority:** medium
- **Description:** Messaging features (52 tasks)
- **Status:** pending

### haos-phase3-server-settings
- **Priority:** medium
- **Description:** Server Settings Modal
- **Status:** pending

### haos-phase4-stage-channels
- **Priority:** medium
- **Description:** Stage Channels
- **Status:** pending

### haos-phase5-user-settings
- **Priority:** medium
- **Description:** User Settings
- **Status:** pending

### haos-phase6-mod-tools
- **Priority:** medium
- **Description:** Mod Tools
- **Status:** pending

### haos-phase7-navigation
- **Priority:** medium
- **Description:** Navigation & Discovery
- **Status:** pending

### haos-phase8-animations
- **Priority:** low
- **Description:** Animations & Polish
- **Status:** pending

---

## ═══════════════════════════════════════════════════════════
## WAVE 6: QA
## ═══════════════════════════════════════════════════════════

### haos-qa-matrix-integration
- **Priority:** high
- **Description:** Matrix SDK validation
- **Status:** pending

### haos-qa-accessibility
- **Priority:** medium
- **Description:** WCAG 2.1 AA audit
- **Status:** pending

### haos-qa-e2e-testing
- **Priority:** high
- **Description:** E2E test suite
- **Status:** pending

### haos-qa-security
- **Priority:** high
- **Description:** Security audit
- **Status:** pending

---

## Completed Tasks

### haos-phase6-moderation ✅
- **Completed:** 2026-02-10 22:15 EST

### haos-phase5-notifications ✅
- **Completed:** 2026-02-10

---

## Summary

| Wave | Priority | Status |
|------|----------|--------|
| Wave 0: Visual Overhaul | CRITICAL | Starting now |
| Wave 1: Infrastructure | High | Pending |
| Wave 2-5: Features | Medium | Pending |
| Wave 6: QA | High | Pending |

**MOST IMPORTANT:** Visual overhaul must be done FIRST. HAOS must look like Discord.
