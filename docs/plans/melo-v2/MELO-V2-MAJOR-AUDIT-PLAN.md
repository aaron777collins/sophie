# MELO V2 MAJOR AUDIT PLAN

**Created:** 2026-02-22 23:20 EST
**Directive From:** Aaron Collins
**Priority:** Critical
**Status:** In Progress

---

## Vision Statement

> "We're trying to make a Matrix client that feels like Discord, a common platform. That's why we used the Discord clone UI... and we need to make it all work!"

**Goal:** Create a fully-functional Discord-like experience using Matrix protocol as the backend, with Element-style privacy/self-hosting capabilities.

---

## Directive Summary

Aaron's requirements:
1. ✅ Comprehensive audit of ALL Melo v2 features
2. ✅ Brainstorm with Opus sub-agents (multiple perspectives)
3. ✅ User stories for ALL features (User, Admin, Moderator perspectives)
4. ✅ All contingencies and dependencies mapped
5. ✅ Epics containing related stories
6. ✅ Detailed acceptance criteria (Given/When/Then)
7. ✅ Save all stories/epics to repo
8. ✅ Review round with fresh-context sub-agents
9. ✅ Proactive plan that auto-executes
10. ✅ Break stories into bite-sized tasks
11. ✅ Validate with Playwright screenshots (all device sizes)
12. ✅ Update all people identities with these standards
13. ✅ Apply this standard to ALL future projects

---

## Phase 1: Foundation (Immediate)

### 1.1 Update All Identities
- [ ] Update IDENTITY.md (Sophie) with new standards
- [ ] Update Person Manager with epic/story requirements
- [ ] Update Story Architect with multi-perspective brainstorming
- [ ] Update Coordinator with task breakdown requirements
- [ ] Update Validator with Playwright screenshot requirements
- [ ] Update Workers with acceptance criteria standards

### 1.2 Create Directory Structure
```
scheduler/stories/melo-v2/
├── VISION.md                    # Project vision document
├── FEATURE-AUDIT.md             # Current feature audit
├── epics/
│   ├── MELO-E001-authentication.md
│   ├── MELO-E002-servers-spaces.md
│   ├── MELO-E003-channels-rooms.md
│   ├── MELO-E004-messaging.md
│   ├── MELO-E005-direct-messages.md
│   ├── MELO-E006-voice-video.md
│   ├── MELO-E007-moderation.md
│   ├── MELO-E008-user-settings.md
│   ├── MELO-E009-notifications.md
│   ├── MELO-E010-e2ee-privacy.md
│   ├── MELO-E011-mobile-pwa.md
│   └── MELO-E012-admin-features.md
└── stories/
    └── (organized by epic)
```

---

## Phase 2: Feature Audit (Sub-Agent: Sonnet)

### 2.1 Audit Categories
1. **Authentication** - Sign-in, Sign-up, 2FA, SSO, Sessions
2. **Servers/Spaces** - Create, Edit, Delete, Settings, Roles, Permissions
3. **Channels/Rooms** - Text, Voice, Video, Categories, Permissions
4. **Messaging** - Send, Edit, Delete, Reactions, Threads, Embeds, Files
5. **Direct Messages** - 1:1, Group DMs, Friend system
6. **Voice/Video** - LiveKit integration, Screen share, WebRTC
7. **Moderation** - Bans, Kicks, Mutes, Reports, Audit logs
8. **User Settings** - Profile, Privacy, Notifications, Appearance
9. **Notifications** - Push, In-app, Email, Mentions
10. **E2EE/Privacy** - Encryption, Key management, Verification
11. **Mobile/PWA** - Responsive, Install, Offline
12. **Admin** - Server management, User management, Analytics

### 2.2 Audit Output
For each feature:
- Current implementation status (✅ Working, ⚠️ Partial, ❌ Missing, 🔴 Broken)
- Code location (files/components)
- Dependencies
- Known issues
- Test coverage

---

## Phase 3: Multi-Perspective Brainstorming (Sub-Agents: Opus)

### 3.1 Perspective Agents
Spawn 4 Opus sub-agents with different perspectives:

1. **User Perspective Agent**
   - Regular user workflows
   - Onboarding experience
   - Daily usage patterns
   - Edge cases and errors

2. **Admin Perspective Agent**
   - Server setup and management
   - User management
   - Moderation tools
   - Analytics and monitoring

3. **Moderator Perspective Agent**
   - Content moderation
   - User behavior management
   - Report handling
   - Community safety

4. **Technical Perspective Agent**
   - Architecture review
   - Performance considerations
   - Security audit
   - Scalability concerns

### 3.2 Brainstorming Process
Each agent produces:
- List of user stories for their perspective
- Contingencies (what could go wrong)
- Dependencies (what depends on what)
- Edge cases
- Acceptance criteria suggestions

---

## Phase 4: Story Creation (Story Architect: Opus)

### 4.1 Epic Structure
Each epic contains:
- Vision/purpose
- User stories (5-20 per epic)
- Dependencies on other epics
- Success metrics

### 4.2 Story Structure
Each story contains:
- As a [user type] I want [feature] so that [benefit]
- Acceptance criteria (Given/When/Then)
- Contingencies
- Dependencies
- Device sizes to test (Desktop, Tablet, Mobile)
- Screenshots required

---

## Phase 5: Review Round (Fresh-Context Sub-Agents)

### 5.1 Reviewers
Spawn fresh Opus sub-agents to review:
- Story completeness
- Missing edge cases
- Unclear acceptance criteria
- Dependency gaps
- Technical feasibility

### 5.2 Iteration
- Reviewers submit feedback
- Story Architect updates stories
- Second review pass
- Final approval

---

## Phase 6: Task Breakdown (Coordinator)

### 6.1 Task Structure
Each story broken into tasks:
- Specific implementation steps
- Test requirements
- Estimated complexity
- Dependencies

### 6.2 Task Queue
- Populate PROACTIVE-JOBS.md
- Set priorities
- Assign models

---

## Phase 7: Validation (Validator)

### 7.1 Playwright Testing
For each acceptance criterion:
- Desktop test (1920x1080)
- Tablet test (768x1024)
- Mobile test (375x667)
- Screenshot evidence

### 7.2 Evidence Storage
```
scheduler/validation/
├── screenshots/melo-v2/
│   ├── {STORY-ID}/
│   │   ├── desktop/
│   │   ├── tablet/
│   │   └── mobile/
└── reports/melo-v2/
    └── {STORY-ID}-{date}.md
```

---

## Proactive Execution Schedule

### Cron Jobs to Create
1. **Person Manager** (4x/day) - Epic oversight, story approval
2. **Story Architect** (2x/day) - Story creation from audit
3. **Coordinator** (every 30 min) - Task breakdown, worker assignment
4. **Validator** (every 30 min) - Validation queue processing

### Auto-Continuation
When context limit approaches:
1. Save progress to `scheduler/progress/melo-v2/`
2. Document next steps in `scheduler/coordinator/notes/`
3. Gateway wake on completion

---

## Execution Order

1. **NOW:** Update all identities with new standards
2. **NOW:** Create directory structure
3. **SPAWN:** Audit sub-agent (Sonnet) for feature audit
4. **SPAWN:** 4x Opus perspective brainstormers
5. **AWAIT:** Audit + brainstorm results
6. **SPAWN:** Story Architect to create stories
7. **SPAWN:** Review sub-agents
8. **UPDATE:** Stories based on review
9. **SPAWN:** Coordinator to break into tasks
10. **PROACTIVE:** Workers begin implementation
11. **CONTINUOUS:** Validation with screenshots

---

## Success Criteria

- [ ] All 12+ epics created with full stories
- [ ] 100+ user stories covering all features
- [ ] All stories have detailed acceptance criteria
- [ ] All perspectives (user/admin/mod) covered
- [ ] All stories reviewed by fresh-context agents
- [ ] Stories merged to melo repo
- [ ] Proactive jobs executing automatically
- [ ] Playwright validation producing screenshots
- [ ] All device sizes tested

---

## Notes

**Timeout Mitigation:**
- This plan enables continuation across sessions
- Progress saved to files
- Sub-agents work independently
- Proactive jobs auto-resume

**This becomes the standard for ALL future projects.**
