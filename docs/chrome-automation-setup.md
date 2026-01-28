# Chrome Automation Setup (Complete Guide)

> **This is the COMPREHENSIVE setup guide.** Run these steps on a fresh Ubuntu server and you'll have a working headless Chrome automation setup with vision-based clicking.

## Overview

This guide sets up:
- **Xvfb** — Virtual display for headless operation
- **Fluxbox** — Window manager (required for Chrome stability)
- **Chrome** — With anti-detection flags and remote debugging
- **vclick** — Vision-based clicking tool
- **zoomclick** — Iterative zoom-and-click tool
- **Clawdbot Browser Relay** — Chrome extension for browser automation

## Prerequisites

- Ubuntu 20.04+ (or similar Debian-based system)
- sudo access
- ~2GB disk space

---

## Step 1: Install System Dependencies

```bash
# Update package lists
sudo apt update

# Core packages
sudo apt install -y \
    xvfb \
    fluxbox \
    scrot \
    imagemagick \
    x11-utils \
    xdotool \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    wget \
    bc

# For template matching and screenshots
sudo apt install -y \
    libopencv-dev \
    python3-opencv
```

---

## Step 2: Install Google Chrome

```bash
# Add Chrome's GPG key
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -

# Add Chrome's repository
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | \
    sudo tee /etc/apt/sources.list.d/google-chrome.list

# Install Chrome
sudo apt update
sudo apt install -y google-chrome-stable

# Verify installation
google-chrome --version
```

---

## Step 3: Install Python Dependencies

```bash
# Install globally (or use a virtualenv if preferred)
pip3 install --user \
    pyautogui \
    opencv-python \
    pillow \
    numpy
```

**Note:** PyAutoGUI requires X11. It will work on Xvfb when `DISPLAY` is set.

---

## Step 4: Install vclick (Vision Click Tool)

**GitHub:** https://github.com/aaron777collins/vclick

```bash
# Create tools directory
mkdir -p ~/clawd/tools
cd ~/clawd/tools

# Clone the repository
git clone https://github.com/aaron777collins/vclick.git
cd vclick

# Install dependencies
pip3 install --user -r requirements.txt 2>/dev/null || pip3 install --user pyautogui opencv-python pillow

# Verify installation
python3 vclick.py --help

# Optional: Create symlink for easy access
sudo ln -sf $(pwd)/vclick.py /usr/local/bin/vclick
```

### vclick Usage

```bash
# Take screenshot (uses scrot)
DISPLAY=:99 python3 ~/clawd/tools/vclick/vclick.py --screenshot

# Click at coordinates
DISPLAY=:99 python3 ~/clawd/tools/vclick/vclick.py --coords 500 300

# Template matching (find and click image)
DISPLAY=:99 python3 ~/clawd/tools/vclick/vclick.py --template button.png

# Type text after clicking
DISPLAY=:99 python3 ~/clawd/tools/vclick/vclick.py -c 500 300 --type "hello"
```

---

## Step 5: Install zoomclick (Zoom-and-Click Tool)

**GitHub:** https://github.com/aaron777collins/EnhanceAndClick

```bash
cd ~/clawd/tools

# Clone the repository
git clone https://github.com/aaron777collins/EnhanceAndClick.git zoomclick
cd zoomclick

# Install dependencies
pip3 install --user -r requirements.txt 2>/dev/null || pip3 install --user pyautogui opencv-python pillow numpy

# Create template storage directory
mkdir -p ~/.zoomclick/templates

# Verify installation
python3 zoomclick.py --help

# Optional: Create symlink for easy access
sudo ln -sf $(pwd)/zoomclick.py /usr/local/bin/zoomclick
```

### zoomclick Usage

```bash
# Start a zoom session (takes screenshot with quadrant overlay)
DISPLAY=:99 zoomclick --start

# Zoom into a quadrant
DISPLAY=:99 zoomclick --zoom top-right

# Save current view as a named template
DISPLAY=:99 zoomclick --save "my_button"

# Click a saved template (uses template matching)
DISPLAY=:99 zoomclick --click "my_button"

# List saved templates
zoomclick --list
```

---

## Step 6: Install Clawdbot Browser Relay Extension

The Browser Relay extension allows the `browser` tool to control Chrome tabs.

### Option A: Install from Clawdbot

If you have Clawdbot installed, the extension is bundled:

```bash
# Find the extension directory
EXTENSION_DIR=$(npm root -g)/clawdbot/data/browser-relay-extension

# If not found, check local installation
ls ~/.npm-global/lib/node_modules/clawdbot/data/browser-relay-extension
```

### Option B: Install Manually

```bash
# Create extension directory
mkdir -p ~/.chrome-automation-extension

# Download from Clawdbot releases (check for latest version)
# Or copy from an existing Clawdbot installation
```

### Load the Extension

When starting Chrome, use the `--load-extension` flag:

```bash
google-chrome --load-extension=/path/to/browser-relay-extension ...
```

---

## Step 7: Create the Startup Script

Create `$HOME/start-chrome-automation.sh`:

```bash
cat > $HOME/start-chrome-automation.sh << 'SCRIPT'
#!/bin/bash
# Chrome Automation Startup Script (Robust Version)
# Starts Xvfb + Fluxbox + Chrome with proper daemonization
# Docs: ~/clawd/docs/chrome-automation-setup.md

DISPLAY_NUM=":99"
DEBUG_PORT=9222
USER_DATA_DIR="$HOME/.chrome-automation"
LOG_DIR="/tmp"
EXTENSION_COORDS="1752 32"  # Clawdbot extension icon location (fallback)

# Tool paths
VCLICK="python3 ~/clawd/tools/vclick/vclick.py"
ZOOMCLICK="python3 ~/clawd/tools/zoomclick/zoomclick.py"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

cleanup() {
    log "Cleaning up existing processes..."
    pkill -f "Xvfb $DISPLAY_NUM" 2>/dev/null || true
    pkill -f "fluxbox" 2>/dev/null || true
    pkill -f "remote-debugging-port=$DEBUG_PORT" 2>/dev/null || true
    sleep 2
}

start_xvfb() {
    log "Starting Xvfb on display $DISPLAY_NUM..."
    setsid nohup Xvfb $DISPLAY_NUM -screen 0 1920x1080x24 > "$LOG_DIR/xvfb.log" 2>&1 &
    disown
    sleep 2
    
    if pgrep -f "Xvfb $DISPLAY_NUM" > /dev/null; then
        log "✓ Xvfb running (PID: $(pgrep -f "Xvfb $DISPLAY_NUM"))"
        return 0
    else
        log "✗ Xvfb failed to start!"
        return 1
    fi
}

start_fluxbox() {
    log "Starting Fluxbox window manager..."
    export DISPLAY=$DISPLAY_NUM
    setsid nohup fluxbox > "$LOG_DIR/fluxbox.log" 2>&1 &
    disown
    sleep 2
    
    if pgrep -x fluxbox > /dev/null; then
        log "✓ Fluxbox running (PID: $(pgrep -x fluxbox))"
        return 0
    else
        log "✗ Fluxbox failed to start!"
        return 1
    fi
}

fix_chrome_prefs() {
    local PREFS_FILE="$USER_DATA_DIR/Default/Preferences"
    if [ -f "$PREFS_FILE" ]; then
        log "Fixing Chrome preferences..."
        python3 -c "
import json
try:
    with open('$PREFS_FILE', 'r') as f:
        prefs = json.load(f)
    if 'profile' not in prefs:
        prefs['profile'] = {}
    prefs['profile']['exit_type'] = 'Normal'
    prefs['profile']['exited_cleanly'] = True
    with open('$PREFS_FILE', 'w') as f:
        json.dump(prefs, f)
    print('Done')
except Exception as e:
    print(f'Warning: {e}')
" 2>/dev/null || true
    fi
}

start_chrome() {
    log "Starting Chrome with remote debugging on port $DEBUG_PORT..."
    export DISPLAY=$DISPLAY_NUM
    
    setsid nohup google-chrome \
        --remote-debugging-port=$DEBUG_PORT \
        --user-data-dir="$USER_DATA_DIR" \
        --no-first-run \
        --no-default-browser-check \
        --disable-blink-features=AutomationControlled \
        --disable-infobars \
        --disable-session-crashed-bubble \
        --hide-crash-restore-bubble \
        --disable-gpu \
        --disable-dev-shm-usage \
        --no-sandbox \
        --window-size=1920,1080 \
        --start-maximized \
        "about:blank" > "$LOG_DIR/chrome.log" 2>&1 &
    disown
    sleep 4
    
    if pgrep -f "remote-debugging-port=$DEBUG_PORT" > /dev/null; then
        log "✓ Chrome running (PID: $(pgrep -f "remote-debugging-port=$DEBUG_PORT" | head -1))"
        return 0
    else
        log "✗ Chrome failed to start!"
        return 1
    fi
}

click_extension() {
    log "Clicking Clawdbot extension icon..."
    export DISPLAY=$DISPLAY_NUM
    
    # Check if extension is already active
    if [ -f ~/.zoomclick/templates/clawdbot_extension_active.png ]; then
        cd ~/clawd/tools/zoomclick 2>/dev/null || true
        RESULT=$($ZOOMCLICK --click "clawdbot_extension_active" --no-click 2>/dev/null || true)
        CONFIDENCE=$(echo "$RESULT" | grep -o '"confidence": [0-9.]*' | grep -o '[0-9.]*' || echo "0")
        if [ "$(echo "$CONFIDENCE > 0.8" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
            log "✓ Extension already active"
            return 0
        fi
    fi
    
    # Try zoomclick template
    if [ -f ~/.zoomclick/templates/clawdbot_extension.png ]; then
        log "Using zoomclick template for extension click"
        cd ~/clawd/tools/zoomclick 2>/dev/null || true
        RESULT=$($ZOOMCLICK --click "clawdbot_extension" --no-click 2>/dev/null || true)
        CONFIDENCE=$(echo "$RESULT" | grep -o '"confidence": [0-9.]*' | grep -o '[0-9.]*' || echo "0")
        
        if [ "$(echo "$CONFIDENCE > 0.7" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
            log "Template found (confidence: $CONFIDENCE), clicking..."
            $ZOOMCLICK --click "clawdbot_extension" 2>/dev/null
            log "✓ Extension clicked via template"
            return 0
        fi
    fi
    
    # Fallback to direct coordinates
    log "Using fallback coordinates ($EXTENSION_COORDS)"
    $VCLICK --coords $EXTENSION_COORDS 2>/dev/null || true
    sleep 1
}

verify_devtools() {
    log "Verifying DevTools endpoint..."
    for i in {1..5}; do
        if curl -s http://localhost:$DEBUG_PORT/json/version > /dev/null 2>&1; then
            log "✓ DevTools responding on port $DEBUG_PORT"
            return 0
        fi
        sleep 1
    done
    log "⚠ DevTools not responding yet"
    return 1
}

main() {
    log "=========================================="
    log "Chrome Automation Startup"
    log "=========================================="
    
    cleanup
    start_xvfb || exit 1
    start_fluxbox || exit 1
    fix_chrome_prefs
    start_chrome || exit 1
    verify_devtools
    
    sleep 3
    click_extension
    
    log ""
    log "=========================================="
    log "✓ Chrome automation ready!"
    log "  Display: $DISPLAY_NUM"
    log "  Debug port: $DEBUG_PORT"
    log "  User data: $USER_DATA_DIR"
    log "=========================================="
}

main "$@"
SCRIPT

chmod +x $HOME/start-chrome-automation.sh
```

---

## Step 8: Configure Auto-Start on Reboot

```bash
# Add to crontab
(crontab -l 2>/dev/null; echo "@reboot $HOME/start-chrome-automation.sh >> /tmp/chrome-automation.log 2>&1") | crontab -
```

---

## Step 9: First Run

```bash
# Start everything
$HOME/start-chrome-automation.sh

# Verify it's running
pgrep -a Xvfb
pgrep -a fluxbox
pgrep -f "chrome.*9222"

# Check DevTools
curl -s http://localhost:9222/json/version

# Take a test screenshot
DISPLAY=:99 scrot /tmp/test-screenshot.png
```

---

## Step 10: Create Extension Click Template (First Time Only)

The first time you run this, you need to create a template for clicking the extension:

```bash
# Start a zoom session
DISPLAY=:99 zoomclick --start

# Look at the screenshot, find the extension icon (top-right toolbar)
# Zoom in on it
DISPLAY=:99 zoomclick --zoom top-right
DISPLAY=:99 zoomclick --zoom top-right   # Keep zooming until icon is big

# Save the template
DISPLAY=:99 zoomclick --save "clawdbot_extension"

# Now you can click it anytime
DISPLAY=:99 zoomclick --click "clawdbot_extension"
```

---

## Verification

### Check All Components

```bash
# Xvfb running?
pgrep -f "Xvfb :99" && echo "✓ Xvfb" || echo "✗ Xvfb NOT running"

# Fluxbox running?
pgrep -x fluxbox && echo "✓ Fluxbox" || echo "✗ Fluxbox NOT running"

# Chrome running?
pgrep -f "remote-debugging-port=9222" && echo "✓ Chrome" || echo "✗ Chrome NOT running"

# DevTools responding?
curl -s http://localhost:9222/json/version > /dev/null && echo "✓ DevTools" || echo "✗ DevTools NOT responding"

# Browser tool working?
browser action=tabs profile=chrome && echo "✓ Browser tool" || echo "✗ Browser tool (may need extension click)"
```

### Test Screenshot Workflow

```bash
# Via scrot
DISPLAY=:99 scrot /tmp/screenshot.png

# Via vclick
DISPLAY=:99 python3 ~/clawd/tools/vclick/vclick.py --screenshot

# Via zoomclick
DISPLAY=:99 zoomclick --start
```

---

## Quick Reference

| Tool | Location | GitHub |
|------|----------|--------|
| vclick | `~/clawd/tools/vclick/vclick.py` | https://github.com/aaron777collins/vclick |
| zoomclick | `~/clawd/tools/zoomclick/zoomclick.py` | https://github.com/aaron777collins/EnhanceAndClick |
| Startup Script | `$HOME/start-chrome-automation.sh` | — |
| Chrome Profile | `$HOME/.chrome-automation/` | — |
| Templates | `~/.zoomclick/templates/` | — |

---

## Troubleshooting

### Black Screenshots
```bash
# Check display is running
DISPLAY=:99 xdpyinfo | head -5

# Check fluxbox is managing windows
DISPLAY=:99 xwininfo -root -children | grep -i chrome

# Restart everything
$HOME/start-chrome-automation.sh
```

### Chrome Crashes Immediately
- **Cause:** Fluxbox not running
- **Fix:** Ensure fluxbox starts before Chrome

### "Restore Pages?" Dialog
- **Cause:** Chrome didn't exit cleanly
- **Fix:** Run the startup script (it auto-fixes preferences)

### Extension Click Fails
```bash
# Check if template exists
ls ~/.zoomclick/templates/clawdbot_extension.*

# Recreate template
DISPLAY=:99 zoomclick --start
# ... zoom to icon ...
DISPLAY=:99 zoomclick --save "clawdbot_extension"
```

### vclick/zoomclick Command Not Found
```bash
# Use full path
python3 ~/clawd/tools/vclick/vclick.py --help

# Or create symlinks
sudo ln -sf ~/clawd/tools/vclick/vclick.py /usr/local/bin/vclick
sudo ln -sf ~/clawd/tools/zoomclick/zoomclick.py /usr/local/bin/zoomclick
```

---

## Chrome Flags Explained

| Flag | Purpose |
|------|---------|
| `--remote-debugging-port=9222` | Allows browser tool to connect |
| `--user-data-dir=...` | Persistent profile (logins survive restarts) |
| `--disable-blink-features=AutomationControlled` | Hides `navigator.webdriver` |
| `--disable-infobars` | No "Chrome is being controlled" banner |
| `--disable-session-crashed-bubble` | No "restore pages" prompt |
| `--disable-gpu` | Required for Xvfb (no real GPU) |
| `--disable-dev-shm-usage` | Prevents crashes in limited memory |
| `--no-sandbox` | Required for some headless setups |

---

## Related Documentation

- [Clawdbot Browser Relay Guide](clawdbot-browser-relay.md) — Using the browser tool
- [Chrome Xvfb Setup](chrome-xvfb-setup.md) — Display configuration details
- TOOLS.md — Quick reference for vclick/zoomclick usage

---

*Last updated: 2026-01-27*
