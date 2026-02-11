# HAOS Proactive Jobs - Master Queue

> **Project:** HAOS (Discord UI + Matrix Backend)
> **Goal:** Production-ready, self-hostable, PIXEL-PERFECT Discord clone
> **Reference:** Discord screenshots in `haos/docs/reference/`
> **Last Updated:** 2026-02-11 00:25 EST

---

## Rules

> 🔢 **MAX 2 DEV TASKS IN-PROGRESS** at any time
> 🚨 **FULL COMPLETION STANDARD** — no stubs, no placeholders, production-ready only
> 🔀 **COMMIT & PUSH** — merge after each completed task
> 📸 **BROWSER LOCK** — only 1 agent uses browser at a time (check `scheduler/browser.lock`)

### Browser Usage
```bash
# Acquire browser lock
echo "$TASK_ID $(date +%s)" > ~/clawd/scheduler/browser.lock

# Take screenshot
DISPLAY=:99 xdotool mousemove 960 540 click 1  # Focus Chrome
sleep 1
DISPLAY=:99 scrot -o /tmp/screenshot.png

# Release lock
rm ~/clawd/scheduler/browser.lock
```

### Deploy to Dev2
```bash
cd /home/ubuntu/repos/haos/apps/web
yarn build
rsync -avz --delete webapp/ dev2:/home/ubuntu/haos/dist/
ssh dev2 "docker restart haos-web"
```

---

## ⚠️ BLOCKING ISSUE: HAOS Crashes on Load

**Status:** HAOS JavaScript hangs, causing "Page Unresponsive"  
**Current:** Element Web restored on dev2 while debugging  
**Priority:** MUST FIX BEFORE visual work can proceed

---

## ═══════════════════════════════════════════════════════════
## WAVE -1: FIX HAOS CRASH (BLOCKING)
## ═══════════════════════════════════════════════════════════

### haos-debug-crash
- **Priority:** CRITICAL BLOCKING
- **Min Model:** opus
- **Status:** pending
- **Description:** Debug and fix HAOS JavaScript crash on load
- **Instructions:**
  1. Check browser console for errors:
     - Open dev tools on dev2.aaroncollins.info
     - Look for JavaScript errors
  2. Check if it's Matrix SDK related:
     - Homeserver connection
     - Config.json issues
     - IndexedDB problems
  3. Compare HAOS build vs Element Web build:
     - Are there missing chunks?
     - CSS loading issues?
  4. Test locally:
     ```bash
     cd /home/ubuntu/repos/haos/apps/web
     yarn start
     ```
  5. Fix identified issues
  6. Rebuild and deploy
  7. Verify site loads without crashing

### haos-restore-deploy
- **Priority:** HIGH
- **Min Model:** sonnet
- **Status:** pending (after haos-debug-crash)
- **Description:** Deploy fixed HAOS build to dev2
- **Instructions:**
  1. Ensure HAOS build works locally
  2. Stop Element Web: `ssh dev2 "docker stop matrix-element"`
  3. Deploy HAOS:
     ```bash
     rsync -avz --delete webapp/ dev2:/home/ubuntu/haos/dist/
     ssh dev2 "docker run -d --name haos-web --network matrix_matrix -v /home/ubuntu/haos/dist:/usr/share/nginx/html:ro -p 8080:80 nginx:alpine"
     ```
  4. Verify site loads
  5. Take screenshot and compare

---

## ═══════════════════════════════════════════════════════════
## WAVE 0: VISUAL OVERHAUL (After crash is fixed)
## ═══════════════════════════════════════════════════════════

### haos-visual-audit-real
- **Priority:** CRITICAL
- **Min Model:** opus
- **Status:** pending
- **Description:** REAL visual audit comparing HAOS to Discord
- **Instructions:**
  1. Open Discord reference: `haos/docs/reference/discord-reference-1.png`
  2. Screenshot HAOS (acquire browser lock first):
     ```bash
     echo "haos-visual-audit $(date +%s)" > ~/clawd/scheduler/browser.lock
     DISPLAY=:99 google-chrome https://dev2.aaroncollins.info &
     sleep 15
     DISPLAY=:99 xdotool mousemove 960 540 click 1
     sleep 2
     DISPLAY=:99 scrot -o ~/repos/haos/docs/reference/haos-current.png
     rm ~/clawd/scheduler/browser.lock
     ```
  3. Compare screenshots side-by-side
  4. Create `docs/VISUAL-DIFFERENCES.md` with EVERY difference
  5. Prioritize fixes

### haos-visual-colors-fix
- **Priority:** HIGH
- **Min Model:** sonnet
- **Status:** pending
- **Description:** Fix colors to match Discord exactly
- **Instructions:**
  Discord colors to use:
  - --discord-bg-tertiary: #202225
  - --discord-bg-secondary: #2f3136
  - --discord-bg-primary: #36393f
  - --discord-bg-modifier-hover: #40444b
  - --discord-text-normal: #dcddde
  - --discord-text-muted: #72767d
  - --discord-blurple: #5865F2
  
  1. Update CSS variables in `src/haos/_variables.pcss`
  2. Audit all HAOS CSS files for hardcoded colors
  3. Replace with correct Discord colors
  4. Build, deploy, screenshot, verify

### haos-visual-layout-fix
- **Priority:** HIGH
- **Min Model:** sonnet
- **Status:** pending
- **Description:** Fix layout structure
- **Instructions:**
  - Server list: 72px width
  - Channel sidebar: 240px width
  - Member list: 240px width
  - Message area: flex-grow
  
  1. Update layout CSS
  2. Build, deploy, screenshot, verify

### haos-visual-components-fix
- **Priority:** HIGH
- **Min Model:** opus
- **Status:** pending
- **Description:** Fix individual components
- **Instructions:**
  Fix each component to match Discord:
  - Server icons (48px, squircle hover)
  - Channel items (# icon, hover state)
  - Messages (40px avatars, timestamps)
  - User panel (avatar, status, buttons)
  
  1. Fix each component
  2. Build, deploy, screenshot, verify after each

---

## ═══════════════════════════════════════════════════════════
## WAVE 1: INFRASTRUCTURE
## ═══════════════════════════════════════════════════════════

### haos-self-hosting-private-mode
- **Priority:** HIGH
- **Status:** pending
- **Description:** Private deployment mode

### haos-self-hosting-docker-stack
- **Priority:** HIGH
- **Status:** pending
- **Description:** Complete Docker stack

### haos-admin-dashboard
- **Priority:** MEDIUM
- **Status:** pending
- **Description:** Admin dashboard

### haos-unit-testing
- **Priority:** HIGH
- **Status:** pending
- **Description:** Unit tests

---

## ═══════════════════════════════════════════════════════════
## WAVE 2-5: FEATURES
## ═══════════════════════════════════════════════════════════

### haos-phase2-remaining
- **Priority:** MEDIUM
- **Status:** pending
- **Description:** Messaging (52 tasks)

### haos-phase3-server-settings
- **Priority:** MEDIUM
- **Status:** pending
- **Description:** Server Settings

### haos-phase4-stage-channels
- **Priority:** MEDIUM
- **Status:** pending
- **Description:** Stage Channels

### haos-phase5-user-settings
- **Priority:** MEDIUM
- **Status:** pending
- **Description:** User Settings

### haos-phase6-mod-tools
- **Priority:** MEDIUM
- **Status:** pending
- **Description:** Mod Tools

---

## ═══════════════════════════════════════════════════════════
## WAVE 6: QA
## ═══════════════════════════════════════════════════════════

### haos-qa-matrix-integration
- **Priority:** HIGH
- **Status:** pending

### haos-qa-accessibility
- **Priority:** MEDIUM
- **Status:** pending

### haos-qa-security
- **Priority:** HIGH
- **Status:** pending

---

## Completed Tasks

### haos-phase6-moderation ✅
- **Completed:** 2026-02-10 22:15 EST

### haos-phase5-notifications ✅
- **Completed:** 2026-02-10

---

## Task Flow

```
1. haos-debug-crash (BLOCKING)
       ↓
2. haos-restore-deploy
       ↓
3. haos-visual-audit-real
       ↓
4. haos-visual-colors-fix
5. haos-visual-layout-fix
6. haos-visual-components-fix
       ↓
7. Wave 1: Infrastructure
       ↓
8. Wave 2-5: Features
       ↓
9. Wave 6: QA
```
