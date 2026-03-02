# Matrix Infrastructure

**Last Updated:** 2026-03-02

## Server Details

| Setting | Value |
|---------|-------|
| **Homeserver** | `matrix3.aaroncollins.info` |
| **Server URL** | `https://matrix3.aaroncollins.info` |
| **Service** | Synapse (Docker via systemd) |
| **Registration** | Disabled (manual account creation only) |

## Service Management

```bash
# Check status
systemctl status matrix-synapse

# Restart
sudo systemctl restart matrix-synapse

# Logs
sudo journalctl -u matrix-synapse -f
```

## Config Location

- **Main config:** `/matrix/synapse/config/homeserver.yaml`
- **Media storage:** `/matrix/synapse/storage/`

## Related Services

- **LiveKit:** `livekit.dev2.aaroncollins.info` (for MatrixRTC calls)
- **Element Web:** TBD

## Bot Accounts

| Bot | User ID | Purpose |
|-----|---------|---------|
| Sophie Secretary | `@sophie:matrix3.aaroncollins.info` | Element Secretary conversational bot |

## Rooms

| Room | Purpose |
|------|---------|
| Sophie | Main room for Sophie Secretary interaction |

## Element Secretary Integration

The Element Secretary should:
1. Connect to `matrix3.aaroncollins.info`
2. Join the Sophie room when Aaron joins
3. Leave/idle after 5 minutes of empty room (save tokens)
4. Use Sonnet via Claude Code for conversation
5. Dispatch work to Sophie backend when confirmed

---

**Note:** This was a gap in my notes! Now documented properly.
