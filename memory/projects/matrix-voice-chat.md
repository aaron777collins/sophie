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

## Progress Log

### 2026-03-01 16:22 EST
- Project created
- Aaron approved priority P1
- Starting infrastructure deployment

---

## Links

- [matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy)
- [lk-jwt-service](https://github.com/element-hq/lk-jwt-service)
- [LiveKit Agents](https://github.com/livekit/agents)
- [Element Call](https://github.com/element-hq/element-call)
