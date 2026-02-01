# Chrome & Xvfb Automation

## Overview
Running Chrome headlessly on a virtual display for browser automation tasks.

## First Documented
2026-01-27

---

## Key Setup Requirements

### Startup Order (Critical!)
1. **Xvfb** must start first (provides display :99)
2. **Fluxbox** window manager must start second
3. **Chrome** starts last

**Why:** Chrome behaves erratically without a window manager. Fluxbox keeps it stable.

### Essential Chrome Flags
```bash
--disable-gpu              # Required for Xvfb
--remote-debugging-port=9222  # For programmatic control
```

### Screenshot Methods
| Method | Works? | Notes |
|--------|--------|-------|
| `scrot` | ❌ | Unreliable with Chrome |
| `import -window root` | ✅ | Recommended |
| `pyautogui.screenshot()` | ⚠️ | Needs gnome-screenshot |

---

## File Locations

| Item | Path |
|------|------|
| Startup script | `/home/ubuntu/start-chrome-automation.sh` |
| vclick tool | `~/clawd/tools/vclick/vclick.py` |
| zoomclick tool | `~/clawd/tools/zoomclick/zoomclick.py` |
| Extension template | `~/.zoomclick/templates/clawdbot_extension.png` |

---

## Browser Relay Extension

The Clawdbot Browser Relay extension must be clicked to attach a tab for automation.

**To attach:**
```bash
DISPLAY=:99 zoomclick --click clawdbot_extension
```

**Fallback (direct coords):**
```bash
DISPLAY=:99 vclick -c 1752 32
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Chrome not starting | Check Xvfb and Fluxbox are running first |
| `browser action=tabs` empty | Click extension to attach tab |
| Screenshots blank/wrong | Use `import -window root` instead of scrot |
| Can't interact with page | Check display is :99, check Chrome is on that display |

---

## Important Reminder
Aaron can't see the virtual display. When doing browser automation, **always send screenshots via Slack** so he can follow along and help guide.

---

## Related
- [TOOLS.md](/home/ubuntu/clawd/TOOLS.md) - Full setup documentation
- [docs/clawdbot-browser-relay.md](/home/ubuntu/clawd/docs/clawdbot-browser-relay.md) - Complete guide
