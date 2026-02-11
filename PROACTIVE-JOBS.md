# Proactive Jobs - HAOS v2 (Discord Clone + Matrix Backend)

> 🚨 **STRATEGIC PIVOT [2026-02-11]**
> Abandoned: Reskinning Element Web (too complex, fighting architecture)
> New Approach: Discord clone frontend + Matrix backend
> Source: https://github.com/nayak-nirmalya/discord-clone

> 🔢 **RUN 1 TASK AT A TIME**
> - Only 1 task `in-progress` at a time (avoid resource conflicts)
> - Each task completes fully before next starts
> - Agents must write heartbeats to `scheduler/heartbeats/{task-id}.json`

> 📝 **FULL COMPLETION STANDARD**
> - "Done" means **PRODUCTION READY**
> - NO placeholders, stubs, or "TODO" comments
> - Validate before marking complete

> 🧠 **MODEL SELECTION**
> - **Opus** — All planning, audits, architecture decisions, complex implementation
> - **Sonnet** — Standard implementation where Opus already defined the steps
> - **Haiku** — ONLY for trivial tasks where Opus wrote explicit step-by-step commands
> 
> Default to Opus if uncertain. Haiku should almost never be used for HAOS work.

> ⚠️ **AGENTS MAY DIE**
> - All state lives in files, NOT session memory
> - Progress tracked in `scheduler/progress/{task-id}.md`
> - Any agent can resume from file state
> - READ the progress file before starting work

---

## How This Works

1. **Cron scheduler** runs every 15 minutes
2. Picks the next `pending` task and spawns a sub-agent
3. Sub-agent:
   - Writes heartbeat immediately
   - Reads any existing progress file
   - Does the work
   - Updates progress file continuously
   - Marks task complete when done
4. If agent dies, next cron run resumes from progress file

---

## Current Phase: Comprehensive Audit

We're auditing the Discord clone + planning Matrix integration before writing code.

---

## Core Infrastructure Tasks (Can run in parallel with audit)

### counsel-implementation-refinement
- **Type:** implementation
- **Min Model:** opus
- **Priority:** high
- **Status:** pending
- **Description:** Refine The Counsel multi-agent voting system
- **Instructions:**
  1. Read /home/ubuntu/clawd/docs/THE-COUNSEL.md (full spec)
  2. Read /home/ubuntu/clawd/skills/counsel/SKILL.md (usage guide)
  3. Create working integration that:
     - Accepts: question, context, options, complexity
     - Spawns N sub-agents (3/5/7) with perspective prompts
     - Collects their vote responses
     - Parses votes and tallies them
     - Determines winner (majority)
     - Logs full decision to memory/counsel/YYYY-MM-DD-HH-MM-slug.md
  4. Test with a real decision (e.g., "Should we use PostgreSQL or SQLite?")
  5. Document any issues or refinements
  6. Make it callable from other agents

**Output Location:** `/home/ubuntu/clawd/docs/haos-v2/`

### Master Checklist

| Task ID | Description | Status | Output File |
|---------|-------------|--------|-------------|
| audit-01-frontend-analysis | Analyze Discord clone frontend | ✅ completed | FRONTEND-AUDIT.md |
| audit-02-backend-mapping | Map Prisma → Matrix | ✅ completed | BACKEND-MAPPING.md |
| audit-03-auth-strategy | Clerk → Matrix auth | ⏳ pending | AUTH-STRATEGY.md |
| audit-04-realtime-strategy | Socket.io → Matrix sync | ⏳ pending | REALTIME-STRATEGY.md |
| audit-05-media-strategy | UploadThing → Matrix media | ⏳ pending | MEDIA-STRATEGY.md |
| audit-06-livekit-integration | Verify LiveKit compatibility | ⏳ pending | LIVEKIT-INTEGRATION.md |
| audit-07-feature-gap-analysis | Discord clone vs what we need | ⏳ pending | FEATURE-GAPS.md |
| audit-08-self-hosting-plan | Docker + infrastructure | ⏳ pending | SELF-HOSTING-PLAN.md |
| audit-09-migration-existing | What to keep from HAOS v1 | ⏳ pending | MIGRATION-FROM-V1.md |
| audit-10-implementation-plan | Final comprehensive plan | ⏳ pending | IMPLEMENTATION-PLAN.md |

---

## Task Definitions

### audit-01-frontend-analysis
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** completed
- **Started:** 2026-02-11 00:30 EST
- **Completed:** 2026-02-11 00:36 EST
- **Description:** Analyze Discord clone frontend structure
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/FRONTEND-AUDIT.md`
- **Summary:** 53 components (14 UI + 39 feature), 24 routes (8 page + 16 API), 45 dependencies. Built on Next.js 13, Radix UI, Tailwind, Zustand, React Query, Socket.io, LiveKit.

---

### audit-02-backend-mapping
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** completed
- **Started:** 2026-02-11 01:15 EST
- **Completed:** 2026-02-11 01:20 EST
- **Description:** Map Discord clone's Prisma models to Matrix equivalents
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/BACKEND-MAPPING.md`
- **Dependencies:** audit-01 (need to understand frontend first)

#### Detailed Instructions

**Step 1: Read the Prisma schema**
```bash
cat /home/ubuntu/repos/discord-clone-reference/prisma/schema.prisma
```
Document every model: Server, Channel, Member, Message, Profile, etc.

**Step 2: For EACH model, identify Matrix equivalent**

| Prisma Model | Matrix Equivalent | Notes |
|--------------|-------------------|-------|
| Server | Matrix Space | Spaces can contain rooms |
| Channel | Matrix Room | Room within a space |
| Member | Room membership | m.room.member state event |
| Message | Matrix event | m.room.message |
| Profile | Matrix user | @user:homeserver |
| Role | Power levels + custom state | io.haos.roles state event |
| Conversation (DM) | Direct room | is_direct flag |

**Step 3: Read ALL API routes**
```bash
# App Router APIs
find /home/ubuntu/repos/discord-clone-reference/app/api -name "route.ts" | head -20
# Pages Router APIs (for Socket.io)
ls /home/ubuntu/repos/discord-clone-reference/pages/api/socket/
```

**Step 4: Map each API endpoint to Matrix SDK calls**

| API Route | Purpose | Matrix SDK Method |
|-----------|---------|-------------------|
| POST /api/servers | Create server | client.createRoom() with space type |
| GET /api/servers/[id] | Get server | client.getRoom() + state events |
| POST /api/channels | Create channel | client.createRoom() + add to space |
| POST /api/messages | Send message | room.sendMessage() |
| etc. | ... | ... |

**Step 5: Document complex mappings**
- Invites: Matrix room aliases vs invite codes
- Permissions: Power levels vs Discord's permission bitflags
- Reactions: m.reaction events
- Threads: m.thread relation

**Step 6: Create the output file**
Write comprehensive markdown to `/home/ubuntu/clawd/docs/haos-v2/BACKEND-MAPPING.md`

**Step 7: Send Slack summary**
```
✅ [audit-02-backend-mapping] COMPLETED
- X Prisma models mapped to Matrix
- Y API routes documented
- Key complexity: [what's hard]
Full audit: ~/clawd/docs/haos-v2/BACKEND-MAPPING.md
```

---

### audit-03-auth-strategy
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan auth migration from Clerk to Matrix
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/AUTH-STRATEGY.md`
- **Dependencies:** audit-01

#### Detailed Instructions

**Step 1: Find all Clerk usage**
```bash
cd /home/ubuntu/repos/discord-clone-reference
grep -r "@clerk" --include="*.ts" --include="*.tsx" | head -30
grep -r "useUser\|useAuth\|currentUser\|auth()" --include="*.ts" --include="*.tsx" | head -30
```

Document:
- Which components use Clerk hooks
- How user data is accessed
- Where auth checks happen

**Step 2: Understand Matrix authentication**

Matrix auth flow:
1. User enters username + password (or SSO)
2. Client calls `/login` on homeserver
3. Receives access_token + device_id
4. Token stored in localStorage
5. All subsequent requests use token

Document the Matrix login API endpoints and response format.

**Step 3: Plan the migration**

| Clerk Feature | Matrix Replacement |
|---------------|-------------------|
| `useUser()` | Custom hook using matrix-js-sdk client.getUser() |
| `useAuth()` | Custom MatrixAuthProvider context |
| `<SignIn />` | Custom login page with Matrix login |
| `<UserButton />` | Custom component with Matrix user data |
| currentUser in API routes | Validate Matrix access token |

**Step 4: Design the auth components**
- `MatrixAuthProvider` - Context providing client + user
- `MatrixLoginPage` - SSO support optional
- `useMatrixUser()` - Hook for user data
- `MatrixGuard` - Route protection component

**Step 5: Handle session persistence**
- Store access_token in localStorage (or secure cookie)
- Handle token refresh/expiry
- Sync across tabs

**Step 6: Write the strategy document**
Create `/home/ubuntu/clawd/docs/haos-v2/AUTH-STRATEGY.md` with:
- Current Clerk usage inventory
- Matrix auth flow explanation
- Component-by-component migration plan
- Code examples for key patterns

**Step 7: Send Slack summary**

---

### audit-04-realtime-strategy
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan Socket.io → Matrix sync migration
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/REALTIME-STRATEGY.md`
- **Dependencies:** audit-01, audit-02

#### Detailed Instructions

**Step 1: Document all Socket.io usage**
```bash
cd /home/ubuntu/repos/discord-clone-reference
grep -r "socket" --include="*.ts" --include="*.tsx" | grep -v node_modules | head -50
cat pages/api/socket/io.ts
cat pages/api/socket/messages.ts
cat pages/api/socket/direct-messages.ts
```

Document:
- Socket events emitted (e.g., `chat:message:${channelId}`)
- Socket events listened to
- How real-time updates propagate

**Step 2: Understand Matrix sync**

Matrix sync loop:
1. Client calls `/sync` with timeout
2. Server holds connection until new events OR timeout
3. Returns: rooms changed, new messages, presence, etc.
4. Client processes events, updates local state
5. Repeat with `since` token

The matrix-js-sdk handles this automatically via:
- `client.startClient()` - starts sync loop
- `client.on('Room.timeline', callback)` - new messages
- `client.on('RoomMember.typing', callback)` - typing
- `client.on('RoomMember.membership', callback)` - joins/leaves

**Step 3: Map Socket events to Matrix events**

| Socket.io Event | Matrix Equivalent |
|-----------------|-------------------|
| `chat:message:${channelId}` | Room.timeline event |
| `typing:${channelId}` | RoomMember.typing |
| `member:update` | RoomMember.membership |
| `channel:update` | Room state events |
| `server:update` | Space state events |

**Step 4: Plan the SocketProvider replacement**

Create `MatrixSyncProvider` that:
- Initializes matrix-js-sdk client
- Starts sync loop
- Provides hooks for subscribing to events:
  - `useRoomMessages(roomId)` - live message list
  - `useTypingMembers(roomId)` - who's typing
  - `useRoomMembers(roomId)` - live member list
  - `usePresence(userId)` - online/offline

**Step 5: Handle optimistic updates**

Socket.io sends messages instantly; Matrix has network latency.
Plan for:
- Local echo (show message immediately)
- Confirmation (update when server confirms)
- Failure handling (retry or show error)

**Step 6: Write the strategy document**

**Step 7: Send Slack summary**

---

### audit-05-media-strategy
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan file uploads migration (UploadThing → Matrix)
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/MEDIA-STRATEGY.md`
- **Dependencies:** audit-01

#### Detailed Instructions

**Step 1: Document UploadThing usage**
```bash
cd /home/ubuntu/repos/discord-clone-reference
grep -r "uploadthing\|UploadButton\|useUploadThing" --include="*.ts" --include="*.tsx"
cat app/api/uploadthing/core.ts
```

Document:
- File types supported (images, PDFs, etc.)
- Size limits
- Where uploads are triggered (message composer, avatar, server icon)

**Step 2: Understand Matrix content API**

Matrix file upload:
1. POST file to `/_matrix/media/v3/upload`
2. Receive `mxc://` URI (e.g., `mxc://matrix.org/abc123`)
3. Include mxc:// URI in message event
4. Clients fetch via `/_matrix/media/v3/download/matrix.org/abc123`

matrix-js-sdk:
```javascript
const response = await client.uploadContent(file, { name: file.name });
// response.content_uri = "mxc://..."
```

**Step 3: Map upload scenarios**

| Upload Type | Current | Matrix Approach |
|-------------|---------|-----------------|
| Message attachment | UploadThing | client.uploadContent() + m.file/m.image event |
| User avatar | UploadThing | client.setAvatarUrl(mxc://) |
| Server icon | UploadThing | Space state event with mxc:// |
| Channel icon | UploadThing | Room avatar state event |

**Step 4: Plan the upload components**
- `MatrixFileUpload` - Generic upload component
- `MatrixImagePreview` - Render mxc:// images
- `MatrixVideoPlayer` - Render mxc:// videos
- Thumbnail generation (Matrix can auto-generate)

**Step 5: Handle large files**
- Matrix homeservers have size limits (configurable)
- May need chunked upload for very large files
- Consider client-side compression for images

**Step 6: Write the strategy document**

**Step 7: Send Slack summary**

---

### audit-06-livekit-integration
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Verify LiveKit voice/video compatibility
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/LIVEKIT-INTEGRATION.md`
- **Dependencies:** audit-01

#### Detailed Instructions

**Step 1: Document Discord clone's LiveKit usage**
```bash
cd /home/ubuntu/repos/discord-clone-reference
grep -r "livekit\|@livekit" --include="*.ts" --include="*.tsx"
cat components/media-room.tsx
```

Document:
- How rooms are created
- How tokens are generated
- Video/audio UI components

**Step 2: Check our existing LiveKit setup**

We have LiveKit running on dev2. Verify:
- Server URL
- API key/secret location
- Current configuration

```bash
ssh dev2 "docker ps | grep livekit"
```

**Step 3: Verify compatibility**

The Discord clone likely uses:
- `@livekit/components-react` for UI
- Server-side token generation

Check if versions match what we have.

**Step 4: Plan integration points**

| Feature | Discord Clone | Our Setup |
|---------|---------------|-----------|
| Voice channels | LiveKit room | Same |
| Video calls | LiveKit room | Same |
| Screen share | LiveKit track | Same |
| Server-side tokens | /api/livekit | Need to add |

**Step 5: Document any adjustments needed**
- Token generation endpoint
- Room naming convention
- Permission model (who can join voice)

**Step 6: Write the integration document**

**Step 7: Send Slack summary**

---

### audit-07-feature-gap-analysis
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Compare Discord clone features vs HAOS requirements
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/FEATURE-GAPS.md`
- **Dependencies:** audit-01

#### Detailed Instructions

**Step 1: List ALL features in Discord clone**

From the frontend audit, enumerate:
- Server management (create, edit, delete, invite)
- Channel types (text, voice, video)
- Messaging (send, edit, delete, reactions, threads)
- User features (profile, settings, status)
- Moderation (kick, ban, roles)
- Real-time (typing, presence, notifications)

**Step 2: List HAOS-specific requirements**

Features we NEED that Discord clone may not have:
- **E2E encryption** (Matrix has this built-in)
- **Federation** (talk to other Matrix servers)
- **Private mode** (single homeserver, no federation)
- **Self-hosting** (Docker Compose one-click deploy)
- **Custom branding** (white-label support)
- **Advanced roles** (more granular than Discord)
- **Audit logging** (compliance features)

**Step 3: Create gap analysis table**

| Feature | Discord Clone | HAOS Needed | Gap |
|---------|---------------|-------------|-----|
| E2E encryption | ❌ | ✅ | Add Megolm encryption |
| Federation | ❌ | ✅ | Matrix handles this |
| Private mode | ❌ | ✅ | Need toggle |
| Self-hosting | ❌ | ✅ | Docker stack |
| ... | ... | ... | ... |

**Step 4: Prioritize gaps**

1. **Critical** (blocks launch): Self-hosting, auth
2. **High** (core value): E2E encryption, private mode
3. **Medium** (nice to have): Advanced roles, audit log
4. **Low** (future): Federation UI, custom branding

**Step 5: Estimate effort for each gap**

| Gap | Complexity | Estimated Tasks |
|-----|------------|-----------------|
| E2E encryption | High | 20-30 tasks |
| Self-hosting | Medium | 15-20 tasks |
| Private mode | Low | 5-10 tasks |

**Step 6: Write the analysis document**

**Step 7: Send Slack summary**

---

### audit-08-self-hosting-plan
- **Type:** audit
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Plan self-hosting infrastructure
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/SELF-HOSTING-PLAN.md`
- **Dependencies:** audit-02, audit-06

#### Detailed Instructions

**Step 1: List required services**

For a complete HAOS deployment:
- **Synapse** - Matrix homeserver
- **PostgreSQL** - Database for Synapse
- **HAOS Web** - Next.js frontend
- **LiveKit** - Voice/video server
- **Redis** - (maybe, for caching)
- **Caddy/Traefik** - Reverse proxy + SSL

**Step 2: Design Docker Compose stack**

Create a mental model of:
```yaml
services:
  synapse:
    image: matrixdotorg/synapse
    depends_on: [postgres]
  postgres:
    image: postgres:15
  haos-web:
    build: ./haos
    depends_on: [synapse]
  livekit:
    image: livekit/livekit-server
  caddy:
    image: caddy
    ports: [80, 443]
```

**Step 3: Plan configuration**

Environment variables needed:
- `SYNAPSE_SERVER_NAME` - e.g., chat.example.com
- `HAOS_HOMESERVER_URL` - URL to Synapse
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- Database credentials
- SSL certificate source (Let's Encrypt)

**Step 4: Plan private federation mode**

For fully private deployments:
- Synapse config: `allow_public_rooms_without_auth: false`
- Synapse config: `enable_registration: false` (invite only)
- No federation: `federation_domain_whitelist: []`

**Step 5: Plan admin dashboard**

First-time setup wizard:
1. Create admin account
2. Set server name
3. Configure federation (on/off)
4. Generate invite links

**Step 6: Write the plan document**

Include:
- Architecture diagram (text-based)
- Docker Compose file draft
- Environment variable reference
- First-time setup flow
- Backup/restore procedure

**Step 7: Send Slack summary**

---

### audit-09-migration-existing
- **Type:** audit
- **Min Model:** opus
- **Priority:** high
- **Status:** pending
- **Description:** Determine what to salvage from HAOS v1
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/MIGRATION-FROM-V1.md`
- **Dependencies:** audit-01, audit-02

#### Detailed Instructions

**Step 1: Explore HAOS v1 codebase**
```bash
ls -la /home/ubuntu/repos/haos/apps/web/src/haos/
ls -la /home/ubuntu/repos/haos/apps/web/src/components/haos/
```

**Step 2: Identify reusable code**

Categories:
- **Matrix SDK patterns** - How we integrated matrix-js-sdk
- **Voice/video components** - LiveKit integration
- **Utility functions** - Helpers that aren't Element-specific
- **Type definitions** - If still applicable
- **CSS patterns** - Discord-style variables (maybe)

**Step 3: List code to port**

| File/Module | Reusable? | Notes |
|-------------|-----------|-------|
| haos/voice/* | ✅ Yes | LiveKit integration |
| haos/moderation/* | Maybe | Logic yes, UI rebuild |
| haos/notifications/* | Maybe | Matrix events yes |
| components/haos/settings/* | ❌ No | Element-specific |

**Step 4: Document lessons learned**

What went wrong with v1:
- Element's architecture too complex
- Fighting the framework instead of building on it
- CSS overrides were fragile

What to carry forward:
- Matrix SDK integration patterns
- State event schemas (io.haos.*)
- Permission model design

**Step 5: Write the migration document**

**Step 6: Send Slack summary**

---

### audit-10-final-implementation-plan
- **Type:** planning
- **Min Model:** opus
- **Priority:** critical
- **Status:** pending
- **Description:** Create the master implementation plan
- **Output:** `/home/ubuntu/clawd/docs/haos-v2/IMPLEMENTATION-PLAN.md`
- **Dependencies:** ALL previous audits (01-09)

#### Detailed Instructions

**Step 1: Read ALL audit documents**
```bash
ls /home/ubuntu/clawd/docs/haos-v2/
cat /home/ubuntu/clawd/docs/haos-v2/FRONTEND-AUDIT.md
cat /home/ubuntu/clawd/docs/haos-v2/BACKEND-MAPPING.md
# ... etc for all 9 audit docs
```

**Step 2: Define implementation phases**

| Phase | Focus | Estimated Tasks |
|-------|-------|-----------------|
| 1 | Project setup + Matrix SDK | 20 |
| 2 | Auth system (Matrix login) | 25 |
| 3 | Core messaging (rooms/events) | 40 |
| 4 | Real-time sync | 30 |
| 5 | Voice/video (LiveKit) | 25 |
| 6 | File uploads | 15 |
| 7 | Advanced features | 50 |
| 8 | Self-hosting | 30 |
| 9 | Testing + polish | 40 |

**Step 3: Break each phase into atomic tasks**

Example for Phase 2 (Auth):
```
auth-01: Create MatrixAuthProvider context
auth-02: Build login page UI
auth-03: Implement login API call
auth-04: Handle login errors
auth-05: Store access token securely
auth-06: Create useMatrixUser hook
auth-07: Build logout functionality
auth-08: Handle session expiry
auth-09: Add SSO support (optional)
auth-10: Create registration page
...
```

**Step 4: Estimate time for each task**

| Task Size | Time Estimate |
|-----------|---------------|
| Small | 1-2 hours |
| Medium | 2-4 hours |
| Large | 4-8 hours |
| XL | 8-16 hours |

**Step 5: Identify dependencies**

Task dependency graph:
- Phase 2 depends on Phase 1
- Phase 3 depends on Phase 2
- Phase 4 depends on Phase 3
- Phase 5 is parallel to Phase 3-4
- etc.

**Step 6: CRITICAL — Rewrite PROACTIVE-JOBS.md with ALL implementation tasks**

⚠️ **THIS IS THE MOST IMPORTANT STEP** ⚠️

You MUST rewrite PROACTIVE-JOBS.md to contain:

1. **Keep the header rules** (1 task at a time, full completion standard, agents may die)
2. **Archive all audit-* tasks** to "Completed Tasks" section  
3. **Add EVERY implementation task** with FULL definitions

**Required format for EACH task:**
```markdown
### impl-phase1-01-scaffold-nextjs
- **Type:** implementation
- **Min Model:** sonnet
- **Priority:** critical
- **Status:** pending
- **Description:** Set up clean Next.js project with Matrix SDK
- **Dependencies:** none (first task)
- **Output:** Working app at /home/ubuntu/repos/haos-v2/

#### Detailed Instructions

**Step 1:** Clone the Discord clone
```bash
git clone https://github.com/nayak-nirmalya/discord-clone /home/ubuntu/repos/haos-v2
cd /home/ubuntu/repos/haos-v2
```

**Step 2:** Remove Clerk dependencies
```bash
npm uninstall @clerk/nextjs
# Then manually remove all @clerk imports from every file
grep -r "@clerk" --include="*.ts" --include="*.tsx" -l | xargs -I {} echo "Edit: {}"
```

**Step 3:** (continue with explicit commands...)

**Final Step:** Send Slack summary
```

4. **Tasks ordered for sequential execution** (one at a time)
5. **Each task completable by fresh agent** with NO prior context
6. **~275 total tasks** across 9 implementation phases
7. **Model selection for impl tasks:**
   - **Opus** — Architecture, complex components, state management, anything ambiguous
   - **Sonnet** — Standard implementation with clear instructions
   - **Haiku** — Almost never. Only if you wrote explicit bash commands that just need execution

**THE ENTIRE PLAN LIVES IN PROACTIVE-JOBS.md**
**CRON READS THIS FILE → SPAWNS AGENTS → AGENTS EXECUTE SEQUENTIALLY**

After rewriting, verify:
- [ ] Header rules preserved
- [ ] All audit tasks archived as complete
- [ ] All impl tasks have detailed instructions
- [ ] Dependencies specified (what must complete first)
- [ ] First impl task is Status: pending, rest are pending

**Step 7: Write the plan document**

**Step 8: Send Slack summary**
```
✅ [audit-10-final-implementation-plan] COMPLETED

Audit phase complete! Created implementation roadmap:
- 9 phases, ~275 total tasks
- Estimated: X weeks of sub-agent work
- First implementation task ready to spawn

Full plan: ~/clawd/docs/haos-v2/IMPLEMENTATION-PLAN.md
```

---

## Completed Tasks

### audit-01-frontend-analysis ✅
- Completed: 2026-02-11 00:36 EST
- Output: `/home/ubuntu/clawd/docs/haos-v2/FRONTEND-AUDIT.md`
- Summary: 53 components, 24 routes, 45 dependencies analyzed

---

## Archived (HAOS v1 - Abandoned)

All previous haos-* tasks from the Element Web reskinning approach are archived.
The pivot to Discord clone + Matrix backend makes them obsolete.

See git history for details on v1 work.

---

## Notes

**Why this pivot?**
- Element Web's architecture is deeply entangled with its own patterns
- Discord clone is clean Next.js 13 with modern patterns
- Easier to swap backend than reskin complex frontend
- We keep Matrix's killer features: E2EE, federation, self-hosting

**What we're keeping:**
- Matrix/Synapse homeserver
- LiveKit for voice/video
- E2E encryption capabilities
- Federation support (toggleable)
- Private mode concept

**What we're replacing:**
- Element Web frontend → Discord clone frontend
- Element's complex state → Zustand + React Query
- Clerk auth → Matrix auth
- UploadThing → Matrix content API
- Socket.io → Matrix sync
- Prisma → Matrix state events
