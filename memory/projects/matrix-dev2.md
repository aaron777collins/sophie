# Matrix Server on dev2.aaroncollins.info

## Overview
Self-hosted Matrix ecosystem with Synapse, Element Web, PostgreSQL, and Coturn for video calls.

## Status
✅ **Live** - Deployed [2026-02-09 14:05 EST]

---

## Access

### Element Web Client
- **URL:** https://dev2.aaroncollins.info
- **Server:** dev2.aaroncollins.info (auto-detected)

### Aaron's Account
- **Username:** `aaron`
- **Password:** `InTheMatrix2026!Admin`
- **Matrix ID:** `@aaron:dev2.aaroncollins.info`
- **Admin:** Yes
- [2026-02-09 14:05 EST] Account created
- [2026-02-09 15:14 EST] Password changed from Matrix2026!Admin to InTheMatrix2026!Admin

---

## Architecture

### Services (Docker Compose)
| Service | Container | Image | Port |
|---------|-----------|-------|------|
| Synapse | matrix-synapse | ghcr.io/element-hq/synapse | 8008, 8448 |
| Element Web | matrix-element | vectorim/element-web | 8080→80 |
| PostgreSQL | matrix-postgres | postgres:16-alpine | 5432 (internal) |
| Coturn | matrix-coturn | coturn/coturn | 3478, 5349 (host network) |

### Reverse Proxy
- **Caddy** handles SSL (auto Let's Encrypt) and routing
- Connected to `matrix_matrix` Docker network

### Endpoints
| Purpose | URL |
|---------|-----|
| Element Web | https://dev2.aaroncollins.info |
| Matrix Client API | https://dev2.aaroncollins.info/_matrix/ |
| Federation | https://dev2.aaroncollins.info:8448 |
| Well-known (server) | https://dev2.aaroncollins.info/.well-known/matrix/server |
| Well-known (client) | https://dev2.aaroncollins.info/.well-known/matrix/client |

---

## Server Details

### Location
- **Host:** dev2.aaroncollins.info (15.204.224.86)
- **Files:** `~/matrix/`

### File Structure
```
~/matrix/
├── docker-compose.yml
├── synapse/
│   ├── homeserver.yaml
│   ├── dev2.aaroncollins.info.signing.key
│   └── dev2.aaroncollins.info.log.config
├── element/
│   └── config.json
├── coturn/
│   └── turnserver.conf
├── postgres/
│   └── data/
└── nginx/ (unused - using Caddy instead)
```

### Database
- **Type:** PostgreSQL 16
- **User:** synapse
- **Password:** SynapseDB_2026!SecurePass
- **Database:** synapse

### TURN Server (Video Calls)
- **URIs:**
  - turn:dev2.aaroncollins.info:3478?transport=udp
  - turn:dev2.aaroncollins.info:3478?transport=tcp
  - turns:dev2.aaroncollins.info:5349?transport=tcp
- **Shared Secret:** MatrixTURN_2026!SharedSecret

---

## Configuration Notes

### Synapse (homeserver.yaml)
- Registration disabled (use admin API to create users)
- Report stats: false
- Max upload: 100M
- URL previews enabled
- Federation enabled (trusted: matrix.org)

### Caddy Integration
- Added to `~/webstack/Caddyfile`
- Connected Caddy container to `matrix_matrix` network

---

## Management Commands

```bash
# SSH to server
ssh dev2

# View logs
docker logs matrix-synapse
docker logs matrix-postgres
docker logs matrix-coturn

# Restart services
cd ~/matrix && docker compose restart

# Create new user (admin)
docker exec matrix-synapse register_new_matrix_user http://localhost:8008 -c /data/homeserver.yaml -u USERNAME -p PASSWORD -a

# Create new user (regular)
docker exec matrix-synapse register_new_matrix_user http://localhost:8008 -c /data/homeserver.yaml -u USERNAME -p PASSWORD --no-admin
```

---

## Timeline
- [2026-02-09 14:00 EST] Setup started
- [2026-02-09 14:05 EST] All services deployed and running
- [2026-02-09 14:05 EST] Admin user 'aaron' created
- [2026-02-09 15:14 EST] Password updated per Aaron's request
