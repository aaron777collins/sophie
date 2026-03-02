# BDV2 Deployment Results — 2026-03-01 20:15 EST

## Status: ✅ SUCCESS

BDV2 is now deployed and accessible!

**URL:** https://dev2.aaroncollins.info/bdv2/login

## What Was Done

### Initial Worker (bdv2-infra-deploy)
1. ✅ Cloned bible-drawing-v2 to dev2
2. ✅ Installed dependencies (pnpm install)
3. ✅ Built production (pnpm build)
4. ✅ Set up pm2 process on port 3001
5. ⚠️ Ran out of time before configuring reverse proxy

### Person Manager Completion
1. ✅ Fixed Caddy config:
   - Removed `uri strip_prefix /bdv2` (Next.js uses basePath)
   - Changed `127.0.0.1:3001` → `172.17.0.1:3001` (Docker→host)
2. ✅ Restarted Caddy container
3. ✅ Verified login page renders

## Current State

| Component | Status | Location |
|-----------|--------|----------|
| BDV2 pm2 process | ✅ online | dev2:3001 |
| Melo pm2 process | ✅ online | dev2:3000 |
| Caddy reverse proxy | ✅ configured | Docker |
| Public URL | ✅ working | https://dev2.aaroncollins.info/bdv2 |

## Configuration Details

### PM2 Processes on dev2
```
bdv2: port 3001, /home/ubuntu/repos/bible-drawing-v2
melo: port 3000, /home/ubuntu/repos/melo
```

### Caddy Config (excerpt)
```
# Bible Drawing V2 - DO NOT strip prefix (Next.js uses basePath: /bdv2)
handle /bdv2* {
    reverse_proxy 172.17.0.1:3001
}
```

## Next Steps

1. Coordinator can now resume Layer 2 validation
2. Auth beads need re-validation against deployed BDV2
3. E2E tests should target https://dev2.aaroncollins.info/bdv2/

## Issues Found & Fixed

1. **basePath misconfiguration** — Caddy was stripping `/bdv2` but Next.js expects it
2. **Docker networking** — Had to use `172.17.0.1` (host IP) not `127.0.0.1`
