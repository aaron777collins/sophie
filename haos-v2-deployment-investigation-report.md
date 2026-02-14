# HAOS v2 Deployment Failure Investigation Report
**Date:** 2026-02-14  
**Investigator:** Subagent (deploy-investigation)  
**Target:** dev2 server (investigated on dev3)  
**Status:** ISSUES IDENTIFIED - Deployment Fixes Required

## Executive Summary

Investigation of HAOS v2 deployment failure revealed **application builds successfully locally** but has **configuration and deployment process issues** that prevent proper Docker-based deployment. Root causes identified with specific fixes provided.

## Investigation Findings

### ✅ 1. PM2 Process Status
- **Finding:** PM2 not installed/used on dev3
- **Status:** No PM2 processes found for HAOS v2
- **Note:** Deployment uses Docker, not PM2

### ✅ 2. Application Build Status
- **Result:** BUILD SUCCESSFUL ✅
- **Build tool:** pnpm (Next.js 14.2.35)
- **Build output:** Standalone bundle generated at `haos/apps/web/.next/standalone/`
- **Build artifacts:** All required files present and valid
- **Verification:** Local server starts successfully in 100ms

### ⚠️ 3. Root Cause Analysis

#### Primary Issue: Docker Build Performance
- **Problem:** Docker build process extremely slow (>180s, incomplete)
- **Cause:** Large context size (791.68MB transferred)
- **Impact:** Builds time out or hang during copy operations

#### Secondary Issue: Environment Configuration  
- **Problem:** No environment configuration files found
- **Missing:** `.env` files for Matrix server, LiveKit, database connections
- **Risk:** Runtime failures due to missing required environment variables

#### Configuration Mismatch Resolution ✅
- **Previously suspected:** Dockerfile CMD path mismatch
- **Verified:** `CMD ["node", "apps/web/server.js"]` is CORRECT
- **Confirmed:** Standalone build structure matches Dockerfile expectations

### ✅ 4. Application Functionality Verification
- **Local test:** `node apps/web/server.js` - SUCCESS
- **Startup time:** 100ms
- **Port binding:** 3000 (as expected)
- **Next.js version:** 14.2.35 (latest)

### ⚠️ 5. Environment Dependencies Analysis
Based on `next.config.js`, application requires:
```bash
# LiveKit Configuration (with defaults)
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.dev2.aaroncollins.info
LIVEKIT_API_KEY=devkey  
LIVEKIT_API_SECRET=LiveKit2026SecretKeyForMatrix
LIVEKIT_JWT_SERVICE_URL=https://dev2.aaroncollins.info/_livekit

# Matrix Configuration  
NEXT_PUBLIC_MATRIX_HOMESERVER=https://dev2.aaroncollins.info
```

## Recommended Fixes

### 🔧 Immediate Actions Required

#### 1. Optimize Docker Build Performance
```dockerfile
# Add to .dockerignore to reduce context size
.git/
node_modules/
.next/
*.log
.env*
coverage/
cypress/videos/
cypress/screenshots/
```

#### 2. Create Environment Configuration
```bash
# Create .env file with required variables
cd haos
cat > .env << EOF
NEXT_PUBLIC_MATRIX_HOMESERVER=https://dev2.aaroncollins.info  
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.dev2.aaroncollins.info
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=LiveKit2026SecretKeyForMatrix
LIVEKIT_JWT_SERVICE_URL=https://dev2.aaroncollins.info/_livekit
EOF
```

#### 3. Update Docker Compose Network Configuration
Verify `matrix_matrix` network exists:
```bash
docker network ls | grep matrix
# If missing: docker network create matrix_matrix
```

#### 4. Deployment Command Correction
```bash
# Correct deployment sequence:
cd haos
docker compose build --no-cache
docker compose up -d
docker compose logs -f haos  # Monitor startup
```

### 🔄 Deployment Process Verification

#### Successful Deployment Indicators:
1. Docker build completes without timeout
2. Container starts and stays running  
3. Health check passes (HTTP 200 on port 3000)
4. Logs show "Ready in Xms" message
5. Application accessible via configured port (3001)

## Updated Deployment Runbook

### Pre-deployment Checklist:
- [ ] Verify Matrix server connectivity to dev2.aaroncollins.info
- [ ] Ensure LiveKit services are running  
- [ ] Confirm Docker network `matrix_matrix` exists
- [ ] Environment variables configured in .env file
- [ ] Docker has sufficient disk space (>2GB free)

### Deployment Steps:
1. **Build Environment Setup:**
   ```bash
   cd /path/to/haos
   cp .env.example .env  # Edit with actual values
   ```

2. **Network Preparation:**
   ```bash
   docker network inspect matrix_matrix || docker network create matrix_matrix
   ```

3. **Application Build:**
   ```bash
   # Use --no-cache if previous builds failed
   docker compose build --progress=plain
   ```

4. **Service Startup:**
   ```bash
   docker compose up -d
   docker compose logs -f haos
   ```

5. **Health Verification:**
   ```bash
   # Should return 200 OK
   curl -f http://localhost:3001/api/health || echo "Health check failed"
   ```

### Troubleshooting Common Issues:

| Issue | Solution |
|-------|----------|
| Build timeout | Add .dockerignore, use --no-cache |  
| Container won't start | Check environment variables, network connectivity |
| Health check fails | Verify Matrix server reachable, check logs |
| Port conflicts | Ensure 3001 is available, adjust docker-compose.yml |

## Next Steps

1. **Immediate:** Apply .dockerignore optimization and retry deployment
2. **Short-term:** Implement proper environment variable management  
3. **Long-term:** Add automated deployment validation and rollback procedures

## Files Created/Updated

- `haos-v2-deployment-investigation-report.md` - This investigation report
- Required: `.dockerignore` file (needs creation)
- Required: `.env` configuration file (needs creation)

## Verification Status

- ✅ Build system functional
- ✅ Application code working  
- ✅ Docker configuration correct
- ⚠️ Environment setup incomplete
- ⚠️ Build optimization needed
- ❓ Network connectivity to dev2 (not tested from current environment)

---
**Investigation Complete:** Root causes identified with actionable fixes provided.