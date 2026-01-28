# Chrome on Xvfb (Display :99) Setup Guide

## The Problem
Chrome on Xvfb doesn't render properly with `scrot` screenshots - you get black screens. This guide documents how to get Chrome running reliably with visible screenshots.

## Key Requirements

1. **Fluxbox MUST start FIRST** - Chrome needs a window manager to render
2. **Use `import` instead of `scrot`** - ImageMagick's import works with Chrome's software rendering
3. **Chrome needs `--disable-gpu`** - GPU acceleration doesn't work on Xvfb
4. **Order matters** - Start fluxbox → wait → start Chrome

## Startup Script

Use `$HOME/start-chrome-xvfb.sh`:

```bash
#!/bin/bash
# Start Chrome on Xvfb display :99 with proper rendering

DISPLAY_NUM=:99
USER_DATA_DIR=$HOME/.chrome-automation
DEBUG_PORT=9222

export DISPLAY=$DISPLAY_NUM

# Kill existing processes
killall fluxbox chrome google-chrome 2>/dev/null
sleep 1

# Start window manager FIRST (critical!)
fluxbox &
sleep 2

# Start Chrome with required flags
google-chrome \
    --user-data-dir="$USER_DATA_DIR" \
    --remote-debugging-port=$DEBUG_PORT \
    --no-first-run \
    --disable-gpu \
    --disable-software-rasterizer \
    --start-maximized \
    2>&1 &

sleep 5
echo "Chrome started on $DISPLAY_NUM with DevTools on port $DEBUG_PORT"
```

## Taking Screenshots

**DON'T use:**
```bash
DISPLAY=:99 scrot /tmp/screenshot.png  # Returns black!
```

**DO use:**
```bash
DISPLAY=:99 import -window root /tmp/screenshot.png  # Works!
```

## Why This Works

1. **Fluxbox** creates the window hierarchy that Chrome needs to be visible
2. **`--disable-gpu`** forces software rendering (GPU doesn't work on virtual framebuffer)
3. **`import`** captures the X server framebuffer directly, while `scrot` has issues with Chrome's compositor

## Troubleshooting

### Black screenshots
- Check if fluxbox is running: `pgrep fluxbox`
- Check if Chrome windows exist: `DISPLAY=:99 xwininfo -root -children | grep -i chrome`
- Restart both in the correct order

### Chrome windows not managed
- Root window has 0 children = fluxbox died
- Restart fluxbox first, then Chrome

### Checking display status
```bash
DISPLAY=:99 xdpyinfo | head -5  # Should show display info
DISPLAY=:99 xwininfo -root -children | head -20  # List windows
```

## Quick Commands

```bash
# Full restart
$HOME/start-chrome-xvfb.sh

# Screenshot
DISPLAY=:99 import -window root /tmp/screenshot.png

# Check Chrome DevTools
curl -s http://localhost:9222/json | head -20
```

## See Also
- `~/clawd/docs/chrome-automation-setup.md` - Original setup docs
- `TOOLS.md` - Tool notes including browser automation
