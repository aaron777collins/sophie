# MELO Project Plan Audit Report

**Audit Date:** 2026-02-11
**Auditor:** Sophie (Opus sub-agent)
**Scope:** Full plan review for MELO 52% → 100% completion

---

## Executive Summary

The MELO project plan is **85% comprehensive** with good phase coverage but has **critical gaps** that must be addressed before execution begins. The current task breakdown (847 tasks, 442 completed, 405 remaining) is thorough for feature implementation but **lacks adequate testing, documentation, and contingency planning**.

### Key Findings

| Category | Status | Issues Found |
|----------|--------|--------------|
| Feature Coverage | ✅ Good | 405 tasks well-defined |
| Task Ordering | ⚠️ Needs Work | Minor dependency issues |
| Testing Strategy | 🔴 Critical Gap | No unit tests, limited E2E scope |
| Documentation | 🔴 Critical Gap | No user/developer docs tasks |
| **Self-Hosting** | 🔴 **CRITICAL** | **No federation/private mode tasks** |
| **Deployment** | 🔴 **CRITICAL** | **No homeserver config documentation** |
| Contingencies | ⚠️ Needs Work | No fallback plans documented |
| i18n/l10n | ⚠️ Needs Work | MELO strings not localized |
| Mobile Testing | 🔴 Missing | No mobile-specific test phase |

---

## 1. Task Coverage Analysis

### Phase Summary

| Phase | Total | Completed | Remaining | Queue Coverage |
|-------|-------|-----------|-----------|----------------|
| 1 - Foundation | 68 | 68 | 0 | ✅ Complete |
| 2 - Messaging | 160 | 108 | 52 | ✅ `melo-phase2-remaining` |
| 3 - Servers & Roles | 138 | 85 | 53 | ✅ `melo-phase3-server-settings` |
| 4 - Voice & Video | 105 | 94 | 11 | ⚠️ Partial (see below) |
| 5 - User System | 138 | 98 | 40 | ✅ Multiple tasks |
| 6 - Moderation | 85 | 60 | 25 | ✅ `melo-phase6-*` tasks |
| 7 - Search & Discovery | 68 | 50 | 18 | ✅ `melo-phase7-*` tasks |
| 8 - Polish & Premium | 85 | 50 | 35 | ⚠️ Partial (see below) |

### Gaps Identified

#### 🔴 Critical: Stage Channels Not Covered (P4-096 to P4-105)
The `melo-phase4-voice-remaining` task instructions mention Stage Channels but the actual implementation appears incomplete. Only P4-021 and P4-091 are mentioned in instructions.

**Missing from queue:**
- P4-096: Stage channel component
- P4-097: Stage speakers list
- P4-098: Stage audience list
- P4-099: Stage raise hand
- P4-100: Stage invite to speak
- P4-101: Stage move to audience
- P4-102: Stage topic display
- P4-103: Stage started notification
- P4-104: Stage discovery
- P4-105: Stage scheduling

**Recommendation:** Create dedicated `melo-phase4-stage-channels` task with explicit instructions.

#### 🔴 Critical: Premium Features UI (P8-051 to P8-070)
The `melo-phase8-premium` task exists but is marked as `low` priority. These are **user-facing features** that affect the visual polish of the app.

**Missing context in instructions:**
- How premium status is determined (subscription API?)
- How to stub premium features for non-premium users
- Integration with any payment/subscription system

#### ⚠️ Moderate: Server Settings Modal Details (P3-019 to P3-050)
Task exists but instructions lack specificity on:
- Matrix state event mappings for each setting
- Which settings require admin permissions
- Integration with existing Element settings infrastructure

#### 🔴 CRITICAL: Self-Hosting & Federation (MISSING FROM PLAN)

**MELO Vision Requirement:** "Self-hostable & fully private — no requirement for public federation, can run completely isolated"

The current task list has **ZERO tasks** for self-hosting configuration. This is a fundamental gap given MELO's core value proposition.

**Missing features not in any task:**

1. **Federation Toggle (Public vs Private Mode)**
   - UI toggle in server/instance settings to disable federation
   - Matrix already supports `m.federate: false` on room creation
   - Need global instance-level "private deployment" mode
   - Visual indicator when running in private mode

2. **Homeserver Configuration**
   - First-run configuration wizard (homeserver URL, admin setup)
   - `config.json` documentation for self-hosters
   - Environment variable support for Docker deployments
   - Well-known file setup guidance

3. **Private Deployment Mode**
   - Disable server discovery for private instances
   - Hide "Explore Servers" for private deployments
   - Restrict invite links to internal network
   - Admin panel for instance management

4. **Self-Hosting Documentation**
   - Step-by-step guide for setting up Synapse/Dendrite + MELO
   - Docker Compose complete stack (homeserver + MELO + LiveKit)
   - nginx/Caddy reverse proxy configurations
   - SSL certificate setup (Let's Encrypt)
   - Backup and restore procedures

5. **Instance Administration**
   - Admin dashboard (server stats, user management)
   - Instance branding (custom logo, name, colors)
   - SMTP configuration for email notifications
   - Storage quota management

**Note:** The `melo-deployment-docker` task exists but only covers building the Docker image, NOT:
- Homeserver integration
- Complete stack deployment
- Private mode configuration
- Admin documentation

**Recommendation:** Create `melo-self-hosting` phase with ~40-50 tasks covering all above.

---

## 2. Dependency Analysis

### Correct Dependencies ✅

1. **QA phases scheduled after feature completion** - Correct
2. **Security review before deployment** - Correct
3. **E2E testing after features** - Correct

### Dependency Issues ⚠️

#### Issue 1: Phase 4 → Phase 5 Dependency
**Problem:** User Profile (P5) includes activity display (P5-016: game activity) which depends on presence/activity infrastructure that overlaps with Voice (P4).

**Impact:** If voice is incomplete, activity display won't have all data sources.

**Recommendation:** Complete P4-A (Voice Infrastructure) before P5-C (Status System).

#### Issue 2: Phase 3 → Phase 6 Dependency
**Problem:** Moderation tools (P6) assume role/permission infrastructure (P3) is complete.

**Current state:** P3-C (Role System) is mostly complete but P3-094-095 (Linked/Subscription roles) are deferred.

**Impact:** Premium moderation features may have permission gaps.

**Recommendation:** Add explicit note that P6 features should only rely on core role system, not premium features.

#### Issue 3: E2E Testing → Security Review Order
**Current order:** Security review → E2E testing → Deployment

**Recommended order:** E2E testing → Security review → Deployment

**Reasoning:** E2E tests may reveal functional issues that change security surface. Better to stabilize functionality first, then audit security.

---

## 3. Missing Phases

### 🔴 Unit Testing Phase (CRITICAL)

**Current state:** 1,398 test files exist in the codebase (Element's tests), but **0 dedicated MELO unit tests**.

**What's missing:**
- Tests for MeloRoleStore, MeloVoiceStore, MeloNotificationStore
- Tests for Matrix state event handlers (io.melo.*)
- Tests for permission calculation logic
- Tests for voice connection state machine

**Recommended task:**
```markdown
### melo-unit-testing
- **Type:** continuous
- **Min Model:** opus
- **Priority:** high
- **Project:** melo
- **Description:** Create unit tests for all MELO stores and utilities
- **Instructions:**
  1. Set up Jest configuration for MELO modules
  2. Create tests for MeloRoleStore (CRUD, hierarchy, permissions)
  3. Create tests for MeloVoiceStore (connection states, participant management)
  4. Create tests for MeloNotificationStore (notification rules, muting)
  5. Create tests for useAutoMod hook (rule matching, action execution)
  6. Create tests for permission calculator
  7. Aim for 80% coverage on MELO modules
  8. Run with `pnpm test:melo`
```

### 🔴 Documentation Phase (CRITICAL)

**Current state:** 
- `/docs/` exists with architecture docs (PLAN.md, UI-SPEC.md, etc.)
- No user-facing documentation
- No developer onboarding docs

**What's missing:**
- User guide: How to create servers, manage roles, use voice
- Admin guide: Server moderation, AutoMod setup
- Developer guide: How to extend MELO, custom themes
- API reference: Matrix state events, webhook format

**Recommended task:**
```markdown
### melo-documentation
- **Type:** continuous
- **Min Model:** opus
- **Priority:** medium
- **Project:** melo
- **Description:** Create user and developer documentation
- **Instructions:**
  1. Create docs/user-guide/ with:
     - Getting started
     - Server creation and management
     - Voice and video
     - Moderation for admins
  2. Create docs/developer-guide/ with:
     - Architecture overview
     - Extending MELO
     - Custom themes
     - Matrix event reference
  3. Add inline JSDoc to all public APIs
  4. Create CONTRIBUTING.md
```

### 🔴 Mobile Responsiveness Testing (CRITICAL)

**Current state:**
- `mobile/` directory exists with some components
- No dedicated mobile testing phase
- Breakpoint system exists but untested at scale

**What's missing:**
- Test all modals on mobile viewport sizes
- Test voice UI on mobile
- Test touch gestures (swipe to dismiss, long-press context menus)
- Test keyboard avoidance on mobile input

**Recommended task:**
```markdown
### melo-mobile-testing
- **Type:** continuous
- **Min Model:** opus
- **Priority:** high
- **Project:** melo
- **Description:** Mobile responsiveness audit and fixes
- **Instructions:**
  1. Test every modal at 375px, 414px, 768px widths
  2. Verify voice controls work on mobile
  3. Test touch interactions (context menus, swipe)
  4. Test with virtual keyboard open
  5. Fix any overflow, layout, or interaction issues
  6. Verify bottom sheet patterns on mobile
  7. Test landscape orientation
```

### 🔴 Self-Hosting & Private Deployment Phase (CRITICAL)

**Current state:**
- MELO is built on Element/Matrix which supports federation
- `m.federate: false` exists for room-level federation disable
- NO instance-level private mode configuration
- NO self-hosting documentation

**This is a CORE VALUE PROPOSITION of MELO and must be addressed.**

**Recommended task:**
```markdown
### melo-self-hosting
- **Type:** continuous
- **Min Model:** opus
- **Priority:** critical
- **Project:** melo
- **Description:** Self-hosting infrastructure and private deployment mode
- **Instructions:**
  Phase A - Private Mode:
  1. Create PrivateModeConfig in settings
  2. Add instance-level federation toggle (affects all rooms)
  3. Hide server discovery when private mode enabled
  4. Add visual indicator for private mode in UI
  5. Restrict invite link generation to admins in private mode
  
  Phase B - Homeserver Configuration:
  6. Create first-run setup wizard for homeserver URL
  7. Document config.json options for self-hosters
  8. Add environment variable overrides (MELO_HOMESERVER_URL, etc.)
  9. Create admin login/setup flow
  
  Phase C - Docker Deployment:
  10. Create docker-compose.yml with Synapse + MELO + LiveKit
  11. Add nginx config for reverse proxy
  12. Document SSL setup with Let's Encrypt
  13. Create backup/restore scripts
  
  Phase D - Documentation:
  14. Write comprehensive self-hosting guide
  15. Document homeserver requirements
  16. Create troubleshooting guide
  17. Document upgrade procedures
```

### ⚠️ Localization/i18n Phase (MODERATE)

**Current state:**
- Element has full i18n infrastructure (50+ languages)
- MELO-specific strings are **hardcoded in English**

**What's missing:**
- Extract MELO strings to i18n files
- Keys for: role names, permission descriptions, AutoMod rules, etc.

**Recommended task:**
```markdown
### melo-i18n
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** melo
- **Description:** Internationalize MELO-specific strings
- **Instructions:**
  1. Audit all MELO components for hardcoded strings
  2. Add to src/i18n/strings/en_EN.json with melo_ prefix
  3. Run `yarn i18n` to generate keys
  4. Replace hardcoded strings with _t() calls
  5. Prioritize user-facing text over dev/admin text
```

### ⚠️ Performance Testing Phase (MODERATE)

**Current state:**
- Performance utilities exist (PerformanceMonitor.ts, BundleOptimization.ts)
- No dedicated performance testing phase

**What's missing:**
- Lighthouse CI integration
- Bundle size budget enforcement
- Memory leak testing (especially for voice)
- Large server stress testing (1000+ members)

---

## 4. Contingency Analysis

### Matrix SDK Limitations

**Current assumption:** Matrix SDK supports all required features.

**Known risks:**
1. **Custom presence states** - Matrix has limited presence (online/offline/unavailable). Discord-style custom status may need custom state events.
2. **Typing indicators scope** - Matrix typing indicators are room-level. Per-channel might need workarounds.
3. **Reactions** - Matrix supports reactions but not Discord-style "super reactions" with animations.

**Recommended contingencies:**
```markdown
## Matrix SDK Contingency Plan

### If presence is insufficient:
- Use io.melo.presence custom state event
- Poll presence every 30s for connected clients
- Cache last activity timestamp

### If typing indicators are insufficient:
- Use ephemeral events for typing
- Scope by thread ID for thread typing

### If reactions are insufficient:
- Store reaction animations in io.melo.reactions
- Render client-side animations
```

### LiveKit Integration Issues

**Current assumption:** LiveKit works seamlessly for voice/video.

**Known risks:**
1. **Token service availability** - If token service is down, voice breaks
2. **Browser compatibility** - WebRTC varies by browser
3. **Firewall/NAT issues** - Corporate networks may block

**Recommended contingencies:**
```markdown
## LiveKit Contingency Plan

### If token service fails:
- Cache tokens client-side (1 hour TTL)
- Show "Voice unavailable" gracefully
- Retry with exponential backoff

### If WebRTC fails:
- Detect browser capabilities at startup
- Show "Unsupported browser" for known-broken versions
- Provide fallback to audio-only mode

### If connectivity fails:
- Detect ICE connection failures
- Suggest TURN server fallback
- Provide network diagnostics panel (VoiceDiagnosticsPanel.tsx exists!)
```

### Error State Handling

**Current state:** ErrorBoundary.tsx exists for crash recovery.

**Missing:**
- Per-feature error boundaries (voice error, message error, etc.)
- Retry logic for failed operations
- Offline queue for message sending

---

## 5. Recommended Task Order

Based on dependency analysis, the optimal execution order is:

### Wave 1: Foundation Completion (Parallel OK)
1. `melo-phase2-remaining` - Complete messaging
2. `melo-phase3-server-settings` - Complete server settings

### Wave 2: Voice & User System (Sequential)
3. `melo-phase4-voice-remaining` - Complete voice (needs rewrite for Stage)
4. **NEW: `melo-phase4-stage-channels`** - Stage implementation
5. `melo-phase5-status-system` - Status (depends on presence from P4)
6. `melo-phase5-user-settings` - User settings
7. `melo-phase5-user-actions` - User actions

### Wave 3: Moderation & Discovery
8. `melo-phase6-reports-safety` - Reports
9. `melo-phase6-mod-tools` - Mod tools
10. `melo-phase7-user-discovery` - User discovery
11. `melo-phase7-navigation` - Navigation

### Wave 4: Polish
12. `melo-phase8-animations` - Animations
13. `melo-phase8-final-polish` - Final polish
14. `melo-phase8-premium` - Premium features (can be deferred)

### Wave 5: Testing & QA
15. **NEW: `melo-unit-testing`** - Unit tests
16. **NEW: `melo-mobile-testing`** - Mobile testing
17. `melo-qa-matrix-integration` - Matrix integration QA
18. `melo-qa-ui-review` - UI review
19. `melo-qa-accessibility` - Accessibility audit
20. `melo-qa-e2e-testing` - E2E tests (MOVE BEFORE SECURITY)
21. `melo-qa-security` - Security review

### Wave 6: Self-Hosting & Deployment (CRITICAL for MELO mission)
22. **NEW: `melo-self-hosting`** - Self-hosting infrastructure (PRIORITY!)
23. **NEW: `melo-documentation`** - Documentation (includes self-hosting guides)
24. **NEW: `melo-i18n`** - Localization
25. `melo-deployment-docker` - Docker deployment (enhanced with full stack)

---

## 6. Immediate Action Items

### 🚨 MUST FIX - Core Value Proposition

1. **Create `melo-self-hosting` task** - THIS IS CRITICAL
   - Private mode toggle
   - Homeserver configuration
   - Docker stack with Synapse/Dendrite
   - Self-hosting documentation
   - **This is why MELO exists - don't ship without it!**

### Must Fix Before Continuing

2. **Create `melo-phase4-stage-channels` task** with explicit P4-096 to P4-105 instructions
3. **Create `melo-unit-testing` task** - Critical for stability
4. **Create `melo-mobile-testing` task** - Critical for UX
5. **Reorder E2E testing before security review** in PROACTIVE-JOBS.md
6. **Update `melo-phase4-voice-remaining` instructions** to clarify P4-021 and exclude Stage

### Should Fix Soon

7. Create `melo-documentation` task (merge with self-hosting docs)
8. Create `melo-i18n` task
9. Document contingency plans in `/docs/contingencies/`
10. Add error handling guidelines to AGENTS.md for MELO work

### Nice to Have

11. Performance testing phase
12. Load testing phase (simulate 1000+ member servers)
13. Accessibility automation (axe-core CI integration)

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **No self-hosting** | **Certain** | **CRITICAL** | **Add self-hosting phase - core value prop!** |
| Matrix SDK gaps | Medium | High | Document workarounds, use custom events |
| LiveKit issues | Low | High | Implement fallbacks, diagnostics exist |
| Mobile breaks | High | Medium | Add mobile testing phase |
| No unit tests | Certain | High | Add testing phase NOW |
| Security vulnerabilities | Medium | Critical | Keep security review, add SAST tools |
| Documentation debt | Certain | Medium | Add doc phase before deployment |
| Federation misconfigured | Medium | High | Clear docs + validation in setup wizard |

---

## 8. Updated Task Count

After adding missing phases:

| Category | Original Tasks | New Tasks | Total |
|----------|----------------|-----------|-------|
| Feature Development | 405 | 0 | 405 |
| Stage Channels (reclassified) | 0 | 10 | 10 |
| **Self-Hosting & Private Mode** | **0** | **~45** | **~45** |
| Unit Testing | 0 | ~50 | ~50 |
| Mobile Testing | 0 | ~20 | ~20 |
| Documentation | 0 | ~30 | ~30 |
| i18n | 0 | ~15 | ~15 |
| **Grand Total** | 405 | **~170** | **~575** |

**Estimated completion with additions:** 3-4 additional weeks of development time.

### Self-Hosting Task Breakdown (~45 tasks)

| Area | Tasks |
|------|-------|
| Private Mode Toggle | 5 |
| Federation Configuration | 8 |
| Homeserver Setup Wizard | 6 |
| Config.json/Env Vars | 5 |
| Docker Compose Stack | 8 |
| Reverse Proxy Configs | 4 |
| Admin Dashboard | 6 |
| Documentation | 8 |

---

## Conclusion

The MELO project plan is **solid for Discord-clone feature development** but **critically missing infrastructure that makes MELO unique**:

### 🚨 The Big Miss: Self-Hosting & Private Mode

MELO's core value proposition is:
> "Self-hostable & fully private — no requirement for public federation, can run completely isolated"

The current plan has **ZERO tasks** for this. Without self-hosting support:
- Users can't run private instances
- There's no differentiation from Discord
- The Matrix backend advantage is underutilized

### Other Critical Gaps

- No unit tests (0 MELO-specific tests)
- No mobile testing phase  
- No documentation for self-hosters
- Stage Channels not covered

### Revised Scope

The recommended additions will increase project scope by **~42%** (405 → 575 tasks) but will result in a product that actually delivers on its promise.

**Bottom line:** 
1. **Self-hosting is NOT optional** - it's why MELO exists
2. Don't ship without unit tests and mobile testing
3. The Discord-clone features are well-planned; the Matrix/self-hosting infrastructure is not

**Recommended priority:**
1. Self-hosting & private mode (core value)
2. Testing infrastructure (stability)
3. Documentation (adoption)
4. Remaining features (polish)

---

*Audit completed by Sophie (Opus sub-agent)*
*Report location: /home/ubuntu/clawd/scheduler/melo-plan-audit.md*
