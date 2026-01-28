# Clawdbot Browser Relay - Complete Guide

> **This document is self-contained.** If you've lost all context/memory, read this to understand how to use browser automation on this machine.

> **Purpose:** Enable headless browser automation via the Clawdbot Browser Relay Chrome extension running on Xvfb display :99.
> 
> **TL;DR:** Run `browser action=tabs profile=chrome`. If empty, run `$HOME/start-chrome-automation.sh`.

## Quick Start

```bash
# Check if browser is running and extension is active
browser action=tabs profile=chrome

# If no tabs returned, restart the browser stack:
$HOME/start-chrome-automation.sh

# Take a screenshot to verify
browser action=screenshot profile=chrome
```

## Overview

The Clawdbot Browser Relay is a Chrome extension that enables the `browser` tool to control Chrome tabs. On this machine, Chrome runs headlessly on a virtual display (Xvfb :99), and the extension must be clicked to attach a tab for automation.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Xvfb :99 (Virtual Display 1920x1080)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Fluxbox (Window Manager)                           │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │  Chrome (--remote-debugging-port=9222)        │  │    │
│  │  │  ┌─────────────────────────────────────────┐  │  │    │
│  │  │  │  Clawdbot Browser Relay Extension       │  │  │    │
│  │  │  │  (Attaches tabs for automation)         │  │  │    │
│  │  │  └─────────────────────────────────────────┘  │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              browser action=* profile=chrome
```

## How to Use

### 1. Check Status

```bash
# Check if Chrome is running
pgrep -f "chrome.*9222" && echo "Chrome running" || echo "Chrome NOT running"

# Check DevTools endpoint
curl -s http://localhost:9222/json/version | head -3

# Check if extension is attached (returns tabs if yes)
browser action=tabs profile=chrome
```

### 2. If Extension Not Attached

The extension icon must be clicked to attach the current tab. Use zoomclick:

```bash
# Click the extension icon using saved template
DISPLAY=:99 python3 ~/clawd/tools/zoomclick/zoomclick.py --click "clawdbot_extension"
```

Or use vclick with coordinates:
```bash
DISPLAY=:99 python3 ~/clawd/tools/vclick/vclick.py --coords 1752 32
```

### 3. Browse the Web

Once the extension is attached:

```bash
# Navigate to a URL
browser action=navigate profile=chrome targetUrl="https://example.com"

# Take a screenshot
browser action=screenshot profile=chrome

# Get page snapshot (for automation)
browser action=snapshot profile=chrome

# Click elements
browser action=act profile=chrome request='{"kind": "click", "ref": "link \"Learn more\""}'
```

## Troubleshooting

### Problem: `browser action=tabs` returns empty

**Cause:** Extension not clicked / tab not attached.

**Solution:**
```bash
# Click the extension
DISPLAY=:99 python3 ~/clawd/tools/zoomclick/zoomclick.py --click "clawdbot_extension"

# Wait a moment, then verify
sleep 2
browser action=tabs profile=chrome
```

### Problem: Chrome/Xvfb not running

**Cause:** Processes crashed or machine rebooted.

**Solution:**
```bash
# Restart the full stack
$HOME/start-chrome-automation.sh

# Verify
pgrep -a Xvfb
pgrep -a fluxbox
pgrep -f "chrome.*9222"
```

### Problem: Extension click not working

**Cause:** Template matching failed or icon moved.

**Solution 1:** Try with fallback coordinates:
```bash
DISPLAY=:99 python3 ~/clawd/tools/vclick/vclick.py --coords 1752 32
```

**Solution 2:** Re-capture the template:
```bash
# Take screenshot and find the icon
DISPLAY=:99 scrot /tmp/screen.png

# View it and identify new coordinates
# Then crop the icon (adjust coords as needed):
convert /tmp/screen.png -crop 24x24+1740+20 +repage ~/.zoomclick/templates/clawdbot_extension.png

# Update the JSON metadata:
cat > ~/.zoomclick/templates/clawdbot_extension.json << 'EOF'
{
  "name": "clawdbot_extension",
  "image": "$HOME/.zoomclick/templates/clawdbot_extension.png",
  "center_x": 1752,
  "center_y": 32
}
EOF
```

### Problem: Chrome shows "didn't shut down correctly"

**Cause:** Chrome wasn't closed cleanly.

**Solution:** The startup script auto-fixes this, but manually:
```bash
python3 -c "
import json
prefs_file = '$HOME/.chrome-automation/Default/Preferences'
with open(prefs_file, 'r') as f:
    prefs = json.load(f)
prefs['profile'] = prefs.get('profile', {})
prefs['profile']['exit_type'] = 'Normal'
prefs['profile']['exited_cleanly'] = True
with open(prefs_file, 'w') as f:
    json.dump(prefs, f)
"
```

## File Locations

| File | Purpose |
|------|---------|
| `$HOME/start-chrome-automation.sh` | Startup script (runs on boot) |
| `$HOME/.chrome-automation/` | Chrome user data directory |
| `~/.zoomclick/templates/clawdbot_extension.png` | Extension icon template |
| `~/.zoomclick/templates/clawdbot_extension.json` | Template metadata |
| `/tmp/xvfb.log` | Xvfb logs |
| `/tmp/chrome.log` | Chrome logs |
| `/tmp/chrome-automation.log` | Startup script logs |

## Extension Icon Templates

Two templates exist for different icon states:

| Template | State | Appearance | Purpose |
|----------|-------|------------|---------|
| `clawdbot_extension` | Inactive | Red circle with white gear | Click to activate |
| `clawdbot_extension_active` | Active | Green "ON" badge | Detect already attached |

- **Location:** `~/.zoomclick/templates/`
- **Coordinates:** (1752, 32) - center of the icon

### How Template Matching Works

1. zoomclick takes a fresh screenshot
2. Uses OpenCV to find the template image on screen
3. Returns confidence score (0.0 - 1.0)
4. If confidence > 0.7, uses matched location
5. If confidence < 0.7, falls back to saved coordinates

### Startup Logic

The startup script:
1. First checks for `clawdbot_extension_active` (ON state) with >0.8 confidence
2. If found → extension already active, skip clicking
3. If not → look for `clawdbot_extension` (inactive state)
4. If confidence >0.7 → click the matched location
5. If confidence <0.7 → use fallback coords (1752, 32)

## Startup Script Details

The script `$HOME/start-chrome-automation.sh`:

1. **Kills existing processes** (clean start)
2. **Starts Xvfb** on display :99 (1920x1080)
3. **Starts Fluxbox** window manager (required for Chrome stability)
4. **Fixes Chrome preferences** (prevents crash recovery prompt)
5. **Starts Chrome** with:
   - `--remote-debugging-port=9222`
   - Anti-detection flags
   - User data dir: `$HOME/.chrome-automation`
6. **Clicks extension** via zoomclick template (or fallback coords)

### Daemonization

Uses `setsid`, `nohup`, and `disown` to ensure processes survive:
- Shell exit
- SSH disconnection
- Parent process termination

### Crontab Entry

```
@reboot $HOME/start-chrome-automation.sh >> /tmp/chrome-automation.log 2>&1
```

## Common Workflows

### Browse a website and extract info

```bash
# Navigate
browser action=navigate profile=chrome targetUrl="https://news.ycombinator.com"

# Wait for load, take snapshot
browser action=snapshot profile=chrome

# Click a link (use ref from snapshot)
browser action=act profile=chrome request='{"kind": "click", "ref": "link \"Show HN\""}'
```

### Fill a form

```bash
# Navigate to form
browser action=navigate profile=chrome targetUrl="https://example.com/form"

# Type in a field
browser action=act profile=chrome request='{"kind": "type", "ref": "textbox \"Email\"", "text": "test@example.com"}'

# Click submit
browser action=act profile=chrome request='{"kind": "click", "ref": "button \"Submit\""}'
```

### Take screenshots for debugging

```bash
# Via browser tool
browser action=screenshot profile=chrome

# Via scrot (raw display capture)
DISPLAY=:99 scrot /tmp/debug.png
```

## Anti-Detection Features

Chrome runs with flags to avoid bot detection:

- `--disable-blink-features=AutomationControlled` — hides `navigator.webdriver`
- `--disable-infobars` — no "controlled by automation" bar
- `--disable-session-crashed-bubble` — no crash recovery UI
- `--no-sandbox` — required for headless operation

**Note:** WebGL tests fail (no GPU on Xvfb) but most sites don't check this.

## Tool Repositories

| Tool | Purpose | GitHub |
|------|---------|--------|
| **vclick** | Direct coordinate clicking, template matching | https://github.com/aaron777collins/vclick |
| **zoomclick** | Iterative zoom-and-click, template saving | https://github.com/aaron777collins/EnhanceAndClick |

**Installation:** See [Chrome Automation Setup](chrome-automation-setup.md) for complete installation instructions.

## See Also

- [Chrome Automation Setup](chrome-automation-setup.md) — **Complete setup from scratch** (includes tool installation)
- [Chrome Xvfb Setup](chrome-xvfb-setup.md) — Display configuration details
- TOOLS.md — Quick reference for all tools
