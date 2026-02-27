# Task: Melo V2 Comprehensive Audit

**Created:** 2026-02-27 02:30 EST
**Requested by:** Aaron (Slack, 01:37 EST)
**Priority:** High

## Directive

> "For melo v2 go audit the app on dev2. Find missing features from discord or broken parts and fix it all."

## Current Status

**App Location:** `dev2:~/repos/melo`
**Running:** Yes, via pm2 on port 3000 (46h uptime)
**URL:** http://dev2.aaroncollins.info:3000/

## Previous Audit Summary (from FEATURE-AUDIT.md dated 2026-02-19)

Most features marked as "⚠️ Partial" - code exists but needs actual testing:

### Working/Likely Working
- ✅ Onboarding (recently fixed)
- ⚠️ Authentication (Matrix login/register) - needs verification
- ⚠️ Messaging (send/receive/DMs) - needs verification
- ⚠️ Servers (create/join/leave) - needs verification
- ⚠️ Channels (create/delete/settings) - needs verification
- ⚠️ E2EE (encryption features) - needs verification

### Known Blockers/Issues
- ❌ Voice/Video - Previous audit said "NO LIVEKIT SERVER" but Aaron confirmed LiveKit IS on dev2
- 🔧 UploadThing - needs real credentials
- ❌ No actual runtime testing done on most features

## Audit Plan

### Phase 1: Core Functionality (Critical)
1. [ ] Test Matrix authentication (login/register)
2. [ ] Test sending/receiving messages
3. [ ] Test server/channel creation
4. [ ] Test direct messages
5. [ ] Document all failures with screenshots

### Phase 2: Discord Feature Comparison
1. [ ] Compare UI/UX to Discord
2. [ ] List missing features
3. [ ] Identify broken UI elements
4. [ ] Test responsive design (mobile/tablet)

### Phase 3: Voice/Video (LiveKit)
1. [ ] Verify LiveKit is configured correctly
2. [ ] Test voice channel join/leave
3. [ ] Test video calls
4. [ ] Test screen share

### Phase 4: Advanced Features
1. [ ] Roles and permissions
2. [ ] File uploads
3. [ ] Message reactions
4. [ ] Message editing/deletion
5. [ ] Server invites
6. [ ] User settings

## Requirements per Aaron

- Use Opus planner
- Break into epics and stories
- Proper acceptance criteria
- All work tested with Playwright screenshots
- One thing at a time, investigated properly

## Next Steps

1. Create Epic: "Melo V2 Feature Audit & Fix"
2. Create User Stories with acceptance criteria
3. Spawn Story Architect for proper planning
4. Execute systematically
