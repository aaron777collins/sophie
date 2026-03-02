# Matrix/Element Voice Chat with Sophie

**Created:** 2026-03-01 16:22 EST
**Priority:** P1 (per Aaron)
**Goal:** Self-hosted private Matrix server where Aaron can voice chat with Sophie via Element X

---

## Overview

Aaron wants to use existing Element X clients (iOS/Android) to voice chat with Sophie. No custom UI needed — just a private Matrix server with Sophie as a participant who can join voice calls.

## Architecture

```
dev3 VPS (existing infrastructure)
├── Synapse (Matrix homeserver)
├── PostgreSQL (database for Synapse)
├── LiveKit (WebRTC SFU for voice/video)
├── lk-jwt-service (MatrixRTC auth bridge)
├── Traefik/nginx (reverse proxy + SSL)
└── Sophie Voice Bot (custom)
    ├── Matrix SDK (room events, presence)
    ├── LiveKit SDK (voice participation)
    └── Clawdbot bridge (localhost:18789)
```

## Security Requirements

- **No federation** — Completely isolated server
- **Invite-only room** — Only Aaron and Sophie
- **End-to-end encryption** — For the text portions
- **Clawdbot gateway stays private** — Bot talks to it via localhost

## Implementation Phases

### Phase 1: Infrastructure (Ansible)
- [ ] Clone matrix-docker-ansible-deploy playbook
- [ ] Configure for dev3
- [ ] Enable LiveKit + lk-jwt-service
- [ ] Run initial deployment
- [ ] Verify Element X can connect

### Phase 2: Matrix Configuration
- [ ] Disable federation
- [ ] Create @aaron user
- [ ] Create @sophie user (bot)
- [ ] Create private room
- [ ] Test Element X → Synapse connection

### Phase 3: Sophie Voice Bot
- [ ] Matrix SDK setup (room events)
- [ ] LiveKit SDK integration
- [ ] Voice activity detection (when Aaron joins call)
- [ ] STT → Clawdbot → TTS pipeline
- [ ] Join/leave call based on room occupancy

### Phase 4: Polish
- [ ] Auto-reconnect on failure
- [ ] Graceful error handling
- [ ] Logging and monitoring
- [ ] Documentation

## Technical Notes

### Matrix-Docker-Ansible-Deploy
- Repo: https://github.com/spantaleev/matrix-docker-ansible-deploy
- Includes LiveKit + lk-jwt-service as optional components
- Handles SSL via Traefik + Let's Encrypt

### LiveKit Integration
- Element Call uses LiveKit under the hood (MSC4195)
- lk-jwt-service bridges Matrix auth to LiveKit JWTs
- Bot needs to get JWT via lk-jwt-service, then join via LiveKit SDK

### Sophie Bot Components
- **mautrix-python** or **matrix-nio** for Matrix
- **livekit-agents** Python SDK for voice
- Runs on dev3, talks to Clawdbot gateway on localhost

## Domain Planning

Options:
- `matrix.aaroncollins.info`
- `element.aaroncollins.info`  
- `chat.aaroncollins.info`

Need subdomains for:
- Synapse server
- Element Web (optional)
- LiveKit signaling

## Server Info

**IMPORTANT:** matrix3.aaroncollins.info and livekit3.aaroncollins.info are just DNS A records pointing to dev3 (65.108.1.247). They are NOT separate servers!

- **Hostname:** dev3
- **IP:** 65.108.1.247
- **DNS aliases:** matrix3.aaroncollins.info, livekit3.aaroncollins.info, dev3.aaroncollins.info
- **Matrix server name:** aaroncollins.info

## Accounts

| User | Matrix ID | Password |
|------|-----------|----------|
| Aaron | @aaron:aaroncollins.info | KingOfKings12345! |
| Sophie | @sophie:aaroncollins.info | QJQb3SyirFep2XJ0nzGC4SXx |

## Progress Log

### 2026-03-01 16:22 EST
- Project created
- Aaron approved priority P1
- Starting infrastructure deployment

### 2026-03-01 16:56 EST
- Ansible playbook completed (ok=197, changed=62)
- All containers running: Synapse, Postgres, LiveKit, lk-jwt-service, Traefik, etc.

### 2026-03-01 17:23 EST
- User accounts created/passwords reset
- Aaron: @aaron:aaroncollins.info
- Sophie: @sophie:aaroncollins.info

### 2026-03-01 17:28 EST
- Aaron created Space + Room in Element X
- Sophie accepted invites via API
- Both accounts in "Sophie Room"

### 2026-03-01 17:37 EST
- Voice bot project created: ~/sophie-voice-bot/
- Python environment set up with livekit-agents, matrix-nio
- Matrix connection tested & working
- PLAN.md created with full implementation roadmap

### 2026-03-01 18:05 EST - SELF-HOSTED COMPLETE
- **Kokoro TTS:** Docker container running on port 8880 with `af_heart` voice
- **faster-whisper:** Installed for local STT
- **voice_bot.py:** Complete implementation created
  - LiveKit integration for voice calls
  - Energy-based VAD for speech detection
  - faster-whisper STT (local, no API needed)
  - Clawdbot gateway for LLM responses
  - Kokoro TTS for voice synthesis

**Status:** Core voice bot is COMPLETE and ready for testing.

### 2026-03-01 18:10 EST - E2EE ENABLED
- **python-olm:** Installed successfully (E2EE crypto)
- **matrix-nio[e2e]:** Installed with encryption support
- **MatrixE2EEClient:** Created with persistent key store
- **Room encryption:** Verified (`m.megolm.v1.aes-sha2`)
- **Sophie Device ID:** `VRTZLTRYGX`
- **Key store:** `~/sophie-voice-bot/data/matrix_store/`

**Security Model:**
- Matrix room: E2EE with Megolm
- LiveKit audio: SRTP (WebRTC encryption)
- All voice data encrypted in transit

**Next:** Integration testing with Element X

---

## Links

- [matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy)
- [lk-jwt-service](https://github.com/element-hq/lk-jwt-service)
- [LiveKit Agents](https://github.com/livekit/agents)
- [Element Call](https://github.com/element-hq/element-call)
