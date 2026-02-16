# Progress: p12-5-health-endpoints

## Task
Create health check and readiness endpoints for HAOS v2

**Location:** /home/ubuntu/repos/haos-v2

**Files to create:**
- `app/api/health/route.ts` - Basic health check endpoint
- `app/api/ready/route.ts` - Readiness probe (checks Matrix connection)
- `app/api/live/route.ts` - Liveness probe

**Requirements:**
1. `/api/health` - Returns 200 OK with basic status JSON
2. `/api/ready` - Checks Matrix homeserver connectivity, returns 200/503
3. `/api/live` - Simple liveness check for container orchestration
4. Include version info, uptime, memory usage in health response
5. Proper error handling and timeouts

**Success Criteria:**
- [ ] All three endpoints return correct status codes
- [ ] Health endpoint includes system info
- [ ] Readiness checks Matrix connectivity
- [ ] Build passes: `npm run build` exits 0

## Communication Log
- [2025-01-11 23:07 EST] Received task from main agent

## Attempts
### Attempt 1 — 2025-01-11 23:07
- **Status:** in-progress
- **What I'm doing:** Examining project structure and creating health endpoints