# HAOS v2 Deployment

## Current Status: ✅ DEPLOYED AND WORKING
- **Date:** 2026-02-14 18:50 EST
- **URL:** https://dev2.aaroncollins.info
- **Host:** dev2 (EC2 instance)

## Recent Fix [2026-02-14 18:50 EST]

### Problem
Main page was blank after deployment. PM2 logs showed:
- `MissingStaticPage: Failed to load static file for page: /404`
- Static assets not found in standalone output

### Root Cause
Next.js standalone builds require manual copying of static assets:
- `.next/static/` must be copied to `.next/standalone/.next/static/`
- The standalone output only includes server.js and pruned node_modules

### Solution
1. Built locally: `npm run build`
2. Copied static assets: `cp -r .next/static .next/standalone/.next/`
3. Created .env file in standalone directory
4. Rsync'd to dev2: `rsync -avz --delete .next/standalone/ dev2:/home/ubuntu/repos/haos-v2-new/.next/standalone/`
5. Restarted PM2: `pm2 restart haos-v2 --update-env`

### Deployment Stack
- **Frontend:** Next.js 14.2.35 (standalone mode)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx (routes both frontend + Matrix API)
- **Matrix Backend:** Synapse
- **Voice/Video:** LiveKit (configured)

### Environment Variables (dev2)
```
NEXT_PUBLIC_MATRIX_HOMESERVER_URL=https://dev2.aaroncollins.info
NEXT_PUBLIC_SITE_URL=https://dev2.aaroncollins.info
NEXT_PUBLIC_LIVEKIT_URL=wss://dev2.aaroncollins.info/_livekit
```

## Git Status
- **Repository:** ~/repos/haos-v2
- **Remote (aaron):** https://github.com/aaron777collins/haos.git
- **Branch:** master (57 commits ahead of origin)
- **Pushed:** ✅ Yes (to aaron remote)

## Previous Issues (Historical)

### [2026-02-14 Earlier]
- Server Actions not working in standalone mode
- Fixed by switching to API routes for auth
- Auth flow now uses `/api/auth/login` instead of server actions

### [2026-02-14 00:03 EST]
- Initial deployment failures
- Docker container wouldn't start
- Switched to PM2-based deployment
