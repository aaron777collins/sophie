# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## 🔑 Credentials & Access

> **📖 Master Reference:** `memory/topics/credentials-and-access.md`

Quick links to all credentials:
- **Email:** See [Email section](#-email-himalaya) below or `memory/topics/email-setup.md`
- **SMS/Twilio:** `~/clawd/data/twilio-credentials.secret`
- **GitHub:** `~/.config/gh/hosts.yml`
- **SSH:** `~/.ssh/config` (hosts: jaekel, dev2)
- **AWS:** Not configured (ask Aaron if needed)

---

## 📱 SMS (Twilio)

> **📖 Architecture:** `docs/sms-trust-architecture.md`

### Quick Reference

| Setting | Value |
|---------|-------|
| **Sophie's number** | `+13655139030` |
| **Aaron's number** | `+15175150233` (FULL trust) |
| **Credentials** | `~/clawd/data/twilio-credentials.secret` |
| **Webhook port** | `8089` |
| **Tools dir** | `~/clawd/tools/sms/` |

### Send SMS (Outbound)

```bash
# Send to Aaron
~/clawd/tools/sms/sms-cli.sh send +15175150233 "Your message here"

# Send to anyone (on Aaron's request)
~/clawd/tools/sms/sms-cli.sh send +1XXXXXXXXXX "Message"

# Check Twilio account status
~/clawd/tools/sms/sms-cli.sh status

# Lookup phone trust level
~/clawd/tools/sms/sms-cli.sh lookup 5175150233
```

### SMS Service Management

```bash
# Start webhook server + tunnel
~/clawd/tools/sms/start-sms.sh start

# Stop services
~/clawd/tools/sms/start-sms.sh stop

# Check status
~/clawd/tools/sms/start-sms.sh status

# Get current public URL
~/clawd/tools/sms/start-sms.sh url
```

### Trust Levels for SMS

| Level | Who | Permissions |
|-------|-----|-------------|
| **FULL** | Aaron (+15175150233) | Full access, commands |
| **PARTIAL** | Contacts granted by Aaron | Limited - relay only |
| **NONE** | Unknown numbers | Log only, no response |

### ⚠️ Important Notes

1. **Tunnel URL changes on restart** - Uses localtunnel (free). For production, need ngrok with auth token.
2. **SMS can be spoofed** - Even Aaron's number gets scrutiny on sensitive commands
3. **Logs:** `~/clawd/data/sms/logs/`
4. **DB tables:** `sms_messages`, `trusted_phones`, `contact_identifiers`

## Claude Code CLI (Opus Thinking)

> **📖 Full Guide:** `memory/topics/claude-code-cli-invocation.md`

**Purpose:** Extra brainpower, second opinions, deeper thinking, and autonomous file operations. Use freely!

### ⚠️ CRITICAL: PTY Required (2026-02-21)

**Claude Code requires a PTY (pseudo-terminal) to output.** Without one, it runs but produces ZERO output.

**Working Pattern:**
```bash
# Simple query (VERIFIED WORKING)
timeout 60 script -q -c 'claude -p "your question" --output-format text' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | tr -d '\r'

# With file operations
cd ~/clawd
timeout 120 script -q -c 'claude -p "your task" \
  --allowedTools "Read,Write,Edit,Bash" \
  --dangerously-skip-permissions \
  --output-format text' /dev/null 2>&1 | \
  perl -pe 's/\e\[[0-9;]*[mGKHF]//g; s/\e\][^\a]*\a//g; s/\e\[[^\a-~]*[\a-~]//g' | tr -d '\r'
```

**Why:** `script` provides a PTY. The `perl` command strips ANSI escape codes from output.

**What DOESN'T work:**
```bash
# ❌ These produce NO OUTPUT:
claude -p "prompt" --output-format text
nohup claude -p "prompt" > file.txt &
```

### Key Flags

| Flag | Purpose |
|------|---------|
| `-p` | Print mode (non-interactive) |
| `--allowedTools "Read,Write,Edit,Bash"` | Auto-approve tools |
| `--dangerously-skip-permissions` | Skip permission prompts |
| `--output-format json` | Structured output |
| `--model opus/sonnet` | Model selection |
| `--verbose` | Detailed output |

### JSON Output Format
```bash
claude -p "your question" --model opus --output-format json
```

Returns JSON with:
- `result`: The actual response
- `modelUsage`: Tokens, cost info
- `duration_ms`: API latency
- `session_id`: Conversation ID

**When to use:** Whenever it would be helpful! Examples:
- Thinking through complex problems
- Getting a second opinion
- Architecture decisions
- Debugging tricky issues
- Spawning Story Architect for user stories
- Anything that benefits from more thinking power

*Since I'm already Opus, using Claude Code Opus is totally fine. Aaron encourages using it freely.*

**Transparency:** When yielding to Opus in Slack, can announce it:
> "🧠 Yielding to Opus for [reason]"

**Important:** 
- Uses Anthropic API directly (NOT OpenRouter)
- Requires OAuth auth via `anthropic:claude-cli` profile
- NEVER try to use Opus via OpenRouter

## Sub-Agents

Spawn sub-agents freely for parallel work or isolated tasks:
- **Haiku** — lightweight tasks, quick lookups, simple operations
- **Sonnet** — moderate complexity, research, code generation
- **Opus** — complex reasoning, architecture, nuanced decisions

Size the model to the task. Use `sessions_spawn` to spin them up.

### ⚠️ Haiku Model Limitation (CRITICAL)
**OAuth tokens only have access to `claude-3-haiku-20240307`** — NOT 3.5 versions.
- ✅ `claude-3-haiku-20240307` — WORKS
- ❌ `claude-3-5-haiku-20241022` — 404 error
- ❌ `claude-3-5-haiku-latest` — 404 error

**Current config uses:** `claude-3-haiku-20240307` for all Haiku sub-agents.

### Brain/Body Model
I'm the brain (Opus) — thinking, planning, deciding. Use smaller/faster models as my "body" for executing actions and tasks. Sonnet has specific limits, so Opus + Haiku is often the practical split, but Sonnet can still be used when moderate complexity makes sense.

## Web Search

- **Google:** Blocked (returns error page)
- **DuckDuckGo:** Works! Use `https://duckduckgo.com/html/?q=<query>`
- Then fetch specific URLs from results if more detail needed

## Browser Automation

### ⚠️ CRITICAL: Use Playwright First, NOT Chrome Extension Relay!

**The Chrome extension relay is UNRELIABLE and basically never works.** (Aaron's words, 2026-02-28)

**Preferred order:**
1. **Playwright** — Reliable, headless, proper automation framework
2. **Direct browser tool with `profile=clawd`** — Clawdbot's isolated browser
3. **Chrome extension relay** — LAST RESORT only when absolutely needed

### Playwright (PREFERRED)

```bash
# Navigate and screenshot
npx playwright test --headed  # or headless by default

# Quick one-liner for screenshots
npx playwright screenshot https://example.com screenshot.png
```

**For MELO validation:** Use Playwright for all screenshot validation. It's what the test framework uses anyway!

### Clawdbot Isolated Browser (`profile=clawd`)

```bash
# Use the clawd profile - more reliable than Chrome relay
browser action=open profile=clawd targetUrl="https://example.com"
browser action=screenshot profile=clawd
browser action=snapshot profile=clawd
```

### Chrome Extension Relay (UNRELIABLE - LAST RESORT)

> **📖 Legacy Guide:** [`~/clawd/docs/clawdbot-browser-relay.md`](docs/clawdbot-browser-relay.md)

Chrome runs headlessly on Xvfb display :99 with the Clawdbot Browser Relay extension. **This is unreliable and should be avoided.**

### ⚠️ Important: Share Screenshots!
**Aaron can't see the virtual display.** When doing browser work, send screenshots via Slack (or current channel) so he can see what's happening and help guide.

### Quick Reference

| What | Value |
|------|-------|
| Display | `:99` (Xvfb 1920x1080) |
| Chrome Debug Port | `9222` |
| Browser Profile | `chrome` (use this with browser tool) |
| Startup Script | `$HOME/start-chrome-automation.sh` |
| Extension Template | `~/.zoomclick/templates/clawdbot_extension.png` |
| Extension Coords | (1752, 32) |

### Essential Commands

```bash
# Check if working (should return tabs)
browser action=tabs profile=chrome

# If empty, click extension to attach tab:
DISPLAY=:99 zoomclick --click clawdbot_extension

# If Chrome not running, restart everything:
$HOME/start-chrome-automation.sh

# Browse the web:
browser action=navigate profile=chrome targetUrl="https://example.com"
browser action=screenshot profile=chrome
browser action=snapshot profile=chrome
```

### How It Works

1. **Xvfb** provides virtual display :99
2. **Fluxbox** window manager keeps Chrome stable
3. **Chrome** runs with anti-detection flags and remote debugging
4. **Browser Relay extension** must be clicked to attach a tab
5. **zoomclick template** (`clawdbot_extension`) clicks the extension icon reliably

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `browser action=tabs` empty | Click extension: `DISPLAY=:99 zoomclick --click clawdbot_extension` |
| Chrome not running | Restart: `$HOME/start-chrome-automation.sh` |
| Extension click fails | Use fallback: `DISPLAY=:99 vclick -c 1752 32` |

**For detailed troubleshooting, workflows, and file locations:** See [`docs/clawdbot-browser-relay.md`](docs/clawdbot-browser-relay.md)

## Slack

### Channels
- **#aibot-chat** → `C0ABAU26S6N` (default channel for Sophie)

---

## 📧 Email (Himalaya)

> **📖 Full Guide:** `memory/topics/email-setup.md` ← **READ THIS BEFORE SENDING EMAIL**

### Quick Reference

| Setting | Value |
|---------|-------|
| **From addresses** | `contact@aaroncollins.info` OR `aaron777collins@gmail.com` |
| **App password** | `749n8f4k755l4r32` |
| **Config file** | `~/.config/himalaya/config.toml` |

**⚠️ Thread Rule:** When replying, use the SAME From address as the original email!
**⚠️ BCC Rule:** Always `Bcc: aaron777collins@gmail.com, contact@aaroncollins.info` (NOT CC — recipients see CC!)

### Send a Simple Email (Copy-Paste Ready)

```bash
cat << EOF | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Bcc: aaron777collins@gmail.com, contact@aaroncollins.info
Subject: Your Subject

Your message here.

Best,
Aaron
EOF
```

### Send HTML Email (Professional)

```bash
# 1. Create HTML file
cat > /tmp/email.html << 'HTMLEOF'
<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif;">
<h1>Title</h1>
<p>Your content here.</p>
</body></html>
HTMLEOF

# 2. Load and send
HTML_CONTENT=$(cat /tmp/email.html)
cat << EOF | himalaya template send
From: contact@aaroncollins.info
To: recipient@example.com
Bcc: aaron777collins@gmail.com, contact@aaroncollins.info
Subject: Your Subject

<#multipart type=alternative>
Plain text fallback here.
<#part type=text/html>
${HTML_CONTENT}
<#/multipart>
EOF
```

### ⚠️ Critical Rule
Use `<< EOF` (unquoted) NOT `<< 'EOF'` — quoted heredocs don't expand variables!

### Test Connection
```bash
himalaya account list
# Should show: fastmail | IMAP, SMTP | yes
```

---

## Vision Click Tools: vclick vs zoomclick

| Tool | GitHub Repository | Purpose |
|------|-------------------|---------|
| **vclick** | https://github.com/aaron777collins/vclick | Direct coordinate clicking, template matching |
| **zoomclick** | https://github.com/aaron777collins/EnhanceAndClick | Iterative zoom-and-click with template saving |

**Full installation guide:** [`~/clawd/docs/chrome-automation-setup.md`](docs/chrome-automation-setup.md)

---

**vclick** — Direct clicking tool
- Take screenshot, get coordinates from vision, click at those coords
- Template matching (find image on screen, click it)
- One-shot: when you already know where to click

**zoomclick** — Iterative zoom-to-target tool
- When you *don't* know exact coords, start with full screen
- Progressively zoom into quadrants until target is big & centered
- Save as named template for future clicks
- Better for small/hard-to-see UI elements

**When to use which:**
- Big obvious button? → `vclick --screenshot`, analyze, `vclick -c X Y`
- Tiny icon or precise target? → `zoomclick --start`, zoom in, `--save`, then `--click` later

---

## vclick - Vision Click Tool

Location: `~/clawd/tools/vclick/vclick.py`
Repo: https://github.com/aaron777collins/vclick

A vision-based clicking tool inspired by [Control-Windows](https://github.com/aaron777collins/Control-Windows). Uses PyAutoGUI for mouse control and OpenCV for template matching.

### Usage

```bash
# Take screenshot (full screen)
python3 ~/clawd/tools/vclick/vclick.py --screenshot

# Window/screen targeting
python3 ~/clawd/tools/vclick/vclick.py --list-windows              # list all windows with IDs
python3 ~/clawd/tools/vclick/vclick.py --screenshot -w "Chrome"    # screenshot of window by title
python3 ~/clawd/tools/vclick/vclick.py --screenshot --window-class "firefox"  # by class
python3 ~/clawd/tools/vclick/vclick.py --screenshot --window-id 12345  # by window ID
python3 ~/clawd/tools/vclick/vclick.py --screenshot --screen 1     # specific monitor (multi-monitor)

# Click at coordinates
python3 ~/clawd/tools/vclick/vclick.py --coords 500 300
python3 ~/clawd/tools/vclick/vclick.py -c 500 300 --click-type double

# Find and click template image (like Control-Windows "x" action)
python3 ~/clawd/tools/vclick/vclick.py --template button.png
python3 ~/clawd/tools/vclick/vclick.py -t button.png --no-click  # find only

# Vision mode - output screenshot for AI analysis
python3 ~/clawd/tools/vclick/vclick.py "the blue Submit button"

# Click then type
python3 ~/clawd/tools/vclick/vclick.py -c 500 300 --type "hello world"

# Click then press key
python3 ~/clawd/tools/vclick/vclick.py -c 500 300 --key enter
```

**Note:** When using `--window`, coordinates from vision analysis are window-relative. The tool automatically translates them to screen coordinates for clicking.

### Workflow for Sophie

1. Run `vclick --screenshot` or `vclick "description"`
2. Analyze the screenshot image with vision
3. Identify coordinates of target element
4. Run `vclick --coords X Y` to click

### Notes
- Uses scrot for screenshots (pyautogui.screenshot needs gnome-screenshot)
- Uses PyAutoGUI for mouse/keyboard control (works on Xvfb :99)
- Template matching uses OpenCV with adaptive confidence (like Control-Windows)
- Outputs JSON for easy parsing

---

## zoomclick - Iterative Zoom-and-Click Tool

Location: `~/clawd/tools/zoomclick/zoomclick.py` (also `/usr/local/bin/zoomclick`)
Repo: https://github.com/aaron777collins/EnhanceAndClick

An AI-friendly tool for precise UI clicking through iterative zooming. Instead of guessing pixel coordinates from a full screenshot, you progressively zoom into quadrants until your target is big and centered, then save it as a reusable template.

### Workflow (How to Use It)

**Step 1: Start a session**
```bash
zoomclick --start
```
Returns a screenshot with quadrant overlay lines. Analyze it and decide which quadrant contains your target.

**Step 2: Zoom iteratively**
```bash
zoomclick --zoom top-left    # or: top-right, bottom-left, bottom-right, center
zoomclick --zoom center      # keep zooming until target is BIG and CENTERED
```
Each zoom returns a new cropped image with overlay. Keep zooming until your target element fills most of the image.

**Step 3: Save as template**
```bash
zoomclick --save "submit_button"
```
Saves the current zoomed region as a named template for future clicking. Stores:
- The cropped image (for template matching)
- The center coordinates (fallback if matching fails)

**Step 4: Click anytime**
```bash
zoomclick --click "submit_button"
```
Finds the template on screen using OpenCV template matching and clicks its center. Falls back to saved coordinates if template not found.

### Commands Reference

| Command | Description |
|---------|-------------|
| `--start` | Start new session, take full screenshot with quadrant overlay |
| `--start -w "Title"` | Start on specific window by title (substring match) |
| `--start --window-class "class"` | Start on window by class name |
| `--start --window-id 12345` | Start on specific window ID |
| `--start --screen 1` | Start on specific screen (multi-monitor) |
| `--list-windows` | List all visible windows with IDs |
| `--zoom <quadrant>` | Zoom into quadrant (top-left, top-right, bottom-left, bottom-right, center) |
| `--save <name>` | Save current view as named template |
| `--click <name>` | Find and click saved template |
| `--click-center` | Click center of current viewport (without saving) |
| `--list` | List all saved templates |
| `--reset` | Reset zoom session |
| `--delete <name>` | Delete a saved template |
| `--no-click` | With --click, locate but don't click |

### Example Session for Sophie

```bash
# Want to click a "Submit" button on a webpage

# 1. Start zooming (optionally target a specific window)
zoomclick --start                    # full screen
zoomclick --start -w "Firefox"       # or target Firefox window
# → Analyze screenshot, target is in bottom-right

zoomclick --zoom bottom-right
# → Getting closer, target now in top-left of this view

zoomclick --zoom top-left
# → Target is big and centered!

# 2. Save it
zoomclick --save "submit_btn"
# → Template saved at ~/.zoomclick/templates/submit_btn.png

# 3. Later, click it anytime
zoomclick --click "submit_btn"
# → Finds button on screen, clicks it
```

### Window Mode
When you start with `--window`, the session tracks the window position. All zoom operations stay within that window, and click coordinates are automatically translated to screen-absolute positions. This is useful when:
- You only care about one app and don't want screen clutter
- The window might move between sessions (template matching handles this)
- Multiple similar windows exist and you want to target a specific one

### How Overlays Work

The red/green guide lines are **only added to the output image** shown for navigation — they're never on the actual screen or saved templates.

Each operation takes a fresh screenshot directly from the display:
- **Zoom:** Fresh screenshot → crop → overlay added to a *copy* for display
- **Save:** Fresh screenshot → crop → saves the *clean* image as template
- **Click:** Fresh screenshot → template match on *clean* image

Overlays are visual aids only, never captured or persisted.

### Storage Locations

- **Working files:** `/tmp/zoomclick/` (screenshots, crops, overlay copies)
- **Templates:** `~/.zoomclick/templates/` (persistent, clean images)
- **State:** `/tmp/zoomclick/state.json` (current zoom session)

### Saved Templates (Sophie's Machine)

| Template | Description | Coordinates |
|----------|-------------|-------------|
| `clawdbot_extension` | Browser Relay extension icon | (1752, 32) |

To list all saved templates: `zoomclick --list`

### Tips

- The quadrant overlay shows **red lines** dividing into 4 corners and a **green box** showing the center region
- Each zoom level halves the viewport dimensions
- Template matching uses OpenCV with adaptive confidence (starts at 100%, decreases until found)
- If template matching fails, the tool falls back to saved coordinates
- Use `--no-click` to test location without actually clicking

---

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
