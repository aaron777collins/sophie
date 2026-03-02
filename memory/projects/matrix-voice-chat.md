# Matrix Voice Chat Setup - Master Plan

**Created:** 2026-03-02 01:00 EST
**Status:** In Progress
**Priority:** P0 - Aaron's direct request

## Overview

Setting up a private Matrix server with LiveKit for voice chat between Aaron and Sophie.

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CADDY (TLS Termination)                                        │
│  - matrix3.aaroncollins.info → Traefik:8080                     │
│  - livekit3.aaroncollins.info → Host:7880 (LiveKit WebSocket)   │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  TRAEFIK        │  │  LIVEKIT        │  │  LIVEKIT        │
│  (Matrix routes)│  │  (Host Network) │  │  JWT SERVICE    │
│  :8080          │  │  :7880 WS       │  │  :8080          │
└────────┬────────┘  │  :5350 TURNS    │  └─────────────────┘
         │           │  :3479 TURN/UDP │
         ▼           │  :7881 ICE/TCP  │
┌─────────────────┐  │  :7882 ICE/UDP  │
│  SYNAPSE        │  │  :30000-40000   │
│  :8008          │  │  (relay ports)  │
└─────────────────┘  └─────────────────┘
```

## Completed Work

### 2026-03-01 - Initial Setup
- [x] Matrix server deployed via ansible playbook
- [x] LiveKit integrated for voice/video
- [x] Created aaron@aaroncollins.info account
- [x] Created sophie@aaroncollins.info account
- [x] "Sophie Room" created for voice chats

### 2026-03-02 - TLS & Networking Fixes
- [x] **Issue:** Traefik had no TLS certs for port 5350 (TURNS)
  - **Fix:** Copied Caddy certs to LiveKit, set `external_tls: false`
  - LiveKit now handles TLS directly on port 5350

- [x] **Issue:** TURN relay ports (30000-40000) not exposed
  - **Fix:** Switched LiveKit to host networking (`--network=host`)
  - All relay ports now accessible

- [x] **Issue:** Caddy couldn't reach LiveKit after host networking change
  - **Fix:** Updated Caddyfile to use `172.18.0.1:7880` (Docker host gateway)
  - Restarted Caddy to pick up changes

- [x] **Issue:** Permission denied reading config in container
  - **Fix:** `chmod 644` on config and cert files

## Current Status

### Working ✅
- TLS on port 5350 (TURNS) - verified with openssl
- WebSocket endpoint via Caddy - returns 200
- JWT service accessible - returns 405 (correct for POST endpoint)
- LiveKit server running with host networking
- All required ports listening

### Automated Tests ✅
All infrastructure tests passing as of 2026-03-02 01:10 EST:

**Matrix Tests (7/7 passed):**
- Homeserver reachability ✅
- .well-known configuration ✅
- LiveKit WebSocket endpoint ✅
- JWT service ✅
- Matrix login ✅
- Room access ✅
- Send message ✅

**WebRTC/Voice Tests (6/6 passed):**
- LiveKit HTTP endpoint ✅
- TURN TLS (port 5350) ✅
- TURN UDP (port 3479) ✅
- ICE TCP (port 7881) ✅
- ICE UDP (port 7882) ✅
- WebSocket endpoint ✅

### Still Needs Manual Testing 🧪
- Actual voice call between Aaron's Element X and another client
- Video call functionality
- Call quality and stability
- Reconnection handling

### Potential Issues ⚠️
1. **External IP Detection** - LiveKit logs show many Docker bridge IPs
   - May cause ICE candidate issues
   - Consider setting explicit `node_ip` in config

2. **Cert Renewal** - Certs copied from Caddy will expire
   - Cron job created: `/usr/local/bin/sync-livekit-certs.sh`
   - Runs weekly on Sundays at 4 AM

3. **Traefik Redundancy** - Two reverse proxies is complex
   - Consider migrating Matrix routes to Caddy directly
   - Would simplify architecture

## Test Accounts

| Username | Password | Purpose |
|----------|----------|---------|
| @aaron:matrix3.aaroncollins.info | (Aaron's) | Primary user |
| @sophie:matrix3.aaroncollins.info | (set by Aaron) | Sophie's account |
| @testbot:matrix3.aaroncollins.info | testbot123 | Automated testing |

**Note:** User domain is `matrix3.aaroncollins.info` not `aaroncollins.info`

## Test Rooms

| Room ID | Name | Purpose |
|---------|------|---------|
| !iCDid0eGkre_6MbGVNl4lpvjqw90py9XY45ouXXn-nE | Sophie Room | Main voice chat |
| !7tIURiTxHg2V1hFKdWtw1yIjNiNP6IyImXXbaew2hcE | Test Room | Automated testing |

## Automated Test Scripts

Location: `/home/ubuntu/clawd/tools/matrix-test/`

### test_matrix.py
Tests Matrix server connectivity and basic functionality:
```bash
cd /home/ubuntu/clawd
source .venv-matrix/bin/activate
python tools/matrix-test/test_matrix.py
```

### test_voice.py
Tests LiveKit/WebRTC connectivity:
```bash
cd /home/ubuntu/clawd
source .venv-matrix/bin/activate
python tools/matrix-test/test_voice.py
```

## Testing Progress

### Phase 1: Automated Connectivity Tests ✅ COMPLETE
- [x] Create Python script using matrix-nio
- [x] Test Matrix login
- [x] Test room join
- [x] Test message send/receive

### Phase 2: Voice Infrastructure Tests ✅ COMPLETE
- [x] Test TURN TLS connectivity (port 5350)
- [x] Test TURN UDP connectivity (port 3479)
- [x] Test ICE TCP/UDP ports
- [x] Test WebSocket endpoint

### Phase 3: Manual Voice Tests 🧪 PENDING
- [ ] End-to-end voice call between two clients
- [ ] Verify audio flows both directions
- [ ] Test call termination
- [ ] Test reconnection after network drop

## Configuration Files

| File | Purpose |
|------|---------|
| `/matrix/livekit-server/config/config.yaml` | LiveKit server config |
| `/matrix/livekit-server/certs/` | TLS certs for TURNS |
| `/matrix/synapse/config/homeserver.yaml` | Synapse config |
| `/home/ubuntu/webstack/caddy/Caddyfile` | Caddy routes |
| `/matrix/traefik/config/traefik.yml` | Traefik config |
| `/etc/systemd/system/matrix-livekit-server.service` | LiveKit systemd |

## Commands Reference

```bash
# Check LiveKit status
docker logs matrix-livekit-server --tail 50

# Test TLS on TURNS port
openssl s_client -connect livekit3.aaroncollins.info:5350 -servername livekit3.aaroncollins.info

# Test WebSocket endpoint
curl -sI https://livekit3.aaroncollins.info/

# Restart services
sudo systemctl restart matrix-livekit-server
sudo systemctl restart matrix-traefik
docker restart caddy

# Sync certs from Caddy
sudo /usr/local/bin/sync-livekit-certs.sh
```

## Contingencies

### If voice still doesn't work after all fixes:
1. Check LiveKit logs for connection attempts
2. Verify ICE candidates in browser DevTools
3. Check if TURN relay is being used (port 30000-40000 traffic)
4. Try direct connection without TURN (may work on same network)

### If Element X mic stays disabled:
1. Force close and reopen app
2. Check iOS microphone permissions
3. Try Element Web instead (more debugging info)
4. Check if other accounts have same issue

### If TLS cert expires:
1. Run `/usr/local/bin/sync-livekit-certs.sh`
2. Or manually copy from Caddy:
   ```bash
   docker cp caddy:/data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/livekit3.aaroncollins.info/livekit3.aaroncollins.info.crt /matrix/livekit-server/certs/certificate.crt
   docker cp caddy:/data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/livekit3.aaroncollins.info/livekit3.aaroncollins.info.key /matrix/livekit-server/certs/privatekey.key
   sudo systemctl restart matrix-livekit-server
   ```

## Next Steps

1. [ ] Set up automated testing with matrix-nio + WebRTC
2. [ ] Test voice call between sophie and sophie2 accounts
3. [ ] Document any additional issues found
4. [ ] Consider simplifying architecture (remove Traefik)
5. [ ] Set up monitoring for LiveKit health

## Dependencies

- Matrix Synapse server
- LiveKit server with TURN
- Valid TLS certificates
- Caddy reverse proxy
- Docker networking

## Notes

- Aaron's mic was showing disabled in Element X - this was the TLS issue on port 5350
- The playbook's default setup assumes Traefik is the only reverse proxy
- Host networking for LiveKit is required for relay ports to work
- Weekly cert sync should prevent expiration issues
