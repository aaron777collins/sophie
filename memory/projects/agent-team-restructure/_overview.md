# Agent Team Restructure Project

> **Status:** Active Design Phase
> **Created:** 2026-03-05 23:50 EST
> **Owner:** Sophie
> **Directive:** Aaron's request to move from generic workers to specialized agent swarm

---

## 🎯 Core Problem (Why We're Doing This)

Our current system fails because:
1. **Single generic worker = context overload** — Too many domains, too much info
2. **No specialization = mediocre at everything** — Jack of all trades, master of none
3. **No peer review = hallucinations slip through** — Workers validate themselves
4. **No audit trail = problems go undetected** — Can't trace what went wrong
5. **Tasks don't get done properly** — Aaron's direct feedback

## 💡 Solution: Specialized Agent Swarm

Model the worker system after a **real software engineering organization**:
- Specialized roles with domain expertise
- Team collaboration on multi-domain tasks
- Independent QA and validation
- Scrum Master for process management
- Anti-hallucination auditor

---

## 🏗️ New Organization Structure

```
👑 Aaron + Sophie — Top level direction
   │
   └── 👔 Person Manager (Opus, 4x/day) — Master Plans, Epics
       │
       ├── 📐 Story Architect (Opus) — User Stories with ACs
       │
       └── 🎯 Coordinator (Opus/Sonnet) — Sprint planning, task assignment
           │
           ├── 🏃 Scrum Master (Sonnet) — NEW: Process, blockers, velocity
           │
           └── 👥 Development Team (Swarm)
               │
               ├── 🎨 Frontend Specialist (Sonnet)
               ├── ⚙️ Backend Specialist (Sonnet)
               ├── 🏛️ Architect (Sonnet/Opus)
               ├── 🧪 QA Engineer (Sonnet)
               ├── 🔍 Validator (Sonnet) — Independent verification
               ├── 🛡️ DevOps Engineer (Sonnet)
               └── 👁️ Hallucination Auditor (Sonnet) — NEW: Meta-validation
```

---

## 👤 Specialized Roles (Detailed)

### 🎨 Frontend Specialist
**Domain:** React, Next.js, TypeScript, CSS, UI/UX, accessibility
**Skills to install:**
- shadcn/ui patterns
- React best practices
- Playwright E2E testing
- Responsive design patterns
- Accessibility (a11y) validation

**Picks up:** UI components, styling, forms, client-side logic
**Collaborates with:** Backend (API integration), QA (visual testing)

### ⚙️ Backend Specialist
**Domain:** Node.js, APIs, databases, authentication, server logic
**Skills to install:**
- Prisma/Drizzle patterns
- REST/GraphQL API design
- Authentication patterns (NextAuth, JWT)
- Database schema design
- Security best practices

**Picks up:** API endpoints, database migrations, server actions
**Collaborates with:** Frontend (API contracts), DevOps (deployment)

### 🏛️ Architect
**Domain:** System design, technical decisions, cross-cutting concerns
**Skills to install:**
- Clean architecture / DDD
- System design patterns
- Database schema optimization
- Performance patterns
- Technical debt management

**Picks up:** Architecture decisions, refactoring, technical debt
**Collaborates with:** All roles (technical guidance)

### 🧪 QA Engineer
**Domain:** Testing strategy, test implementation, quality assurance
**Skills to install:**
- Jest/Vitest patterns
- Playwright E2E testing
- Visual regression testing
- Performance testing
- Test coverage analysis

**Picks up:** Test writing, test maintenance, coverage gaps
**Collaborates with:** All implementers (test requirements)

### 🔍 Validator
**Domain:** Independent verification, evidence collection, acceptance criteria
**Skills:**
- Layer 3 independent testing
- Evidence documentation
- Screenshot capture at multiple viewports
- Adversarial testing mindset

**Picks up:** Completed work for verification
**Reports to:** Coordinator (validation results)

### 🛡️ DevOps Engineer
**Domain:** CI/CD, deployment, infrastructure, monitoring
**Skills to install:**
- Docker patterns
- GitHub Actions
- Deployment strategies
- Monitoring setup
- Log analysis

**Picks up:** Build fixes, deployment issues, infra tasks
**Collaborates with:** All roles (deployment support)

### 👁️ Hallucination Auditor (NEW)
**Domain:** Meta-validation, loop detection, quality auditing
**Responsibilities:**
- Audit other agents' work for hallucinations
- Detect infinite loops or stuck patterns
- Verify claims against evidence
- Flag suspicious patterns
- Maintain audit trail

**Picks up:** Random sampling of completed work
**Reports to:** Coordinator, Person Manager

### 🏃 Scrum Master (NEW)
**Domain:** Process facilitation, blocker removal, velocity tracking
**Responsibilities:**
- Monitor task progress across team
- Identify and escalate blockers
- Track velocity and capacity
- Assign tasks to appropriate specialists
- Facilitate handoffs between roles

**Reports to:** Coordinator
**Coordinates:** All development team members

---

## 🔄 Workflow: How Tasks Flow

### Single-Domain Task (Simple)
```
Coordinator assigns task
    ↓
Specialist claims (bd update --claim)
    ↓
Specialist spawns sub-agent for implementation
    ↓
Writes tests (TDD: RED → GREEN → REFACTOR)
    ↓
Submits for validation (bd update --status needs-validation)
    ↓
Validator verifies independently
    ↓
If pass: bd close
If fail: back to specialist
```

### Multi-Domain Task (Team Collaboration)
```
Coordinator assigns task
    ↓
Scrum Master identifies required specialists
    ↓
Multiple specialists claim sub-tasks
    ↓
Backend builds API → Frontend consumes → QA tests
    ↓
All sub-tasks pass individually
    ↓
Validator tests integrated feature
    ↓
Auditor samples for hallucination check
```

---

## 🛡️ Anti-Hallucination System

### Per-Agent Checks
Every agent MUST:
1. **State assumptions explicitly** — "I assume X because Y"
2. **Verify file existence** — `ls`/`cat` before claiming a file exists
3. **Run commands before claiming results** — Don't fabricate output
4. **Include evidence** — Screenshots, logs, test output
5. **Note uncertainty** — "I'm unsure about X"

### Loop Detection
Agents detect their own loops:
1. Track repeated actions (same command 3+ times)
2. Track repeated errors (same error 3+ times)
3. Track repeated file edits (editing same line 3+ times)
4. **If loop detected:** STOP, document, escalate

### Hallucination Auditor Process
1. **Random sampling:** 20% of completed tasks
2. **Evidence verification:** Claims match actual output?
3. **Code review:** Does code do what was claimed?
4. **Test verification:** Tests actually run and pass?
5. **Cross-reference:** Dependencies actually satisfied?

### Audit Trail
Every claim logged:
```
{timestamp} {agent} {action} {evidence_path}
2026-03-05 23:55 frontend-specialist "created button component" scheduler/evidence/clawd-123/
```

---

## 📁 File Structure (New)

```
~/clawd/
├── scheduler/
│   ├── coordinator/
│   ├── person-manager/
│   ├── story-architect/
│   ├── scrum-master/          # NEW
│   ├── specialists/           # NEW
│   │   ├── frontend/
│   │   │   ├── IDENTITY.md
│   │   │   └── notes/
│   │   ├── backend/
│   │   ├── architect/
│   │   ├── qa/
│   │   ├── devops/
│   │   └── auditor/
│   ├── validator/
│   └── evidence/              # NEW: Evidence storage
│       └── {bead-id}/
│           ├── screenshots/
│           ├── logs/
│           └── tests/
│
├── _bmad/                     # BMAD methodology
│
└── openclaw/                  # NEW: Agent configurations
    ├── agents/
    │   ├── frontend-specialist.yaml
    │   ├── backend-specialist.yaml
    │   ├── architect.yaml
    │   ├── qa-engineer.yaml
    │   ├── devops-engineer.yaml
    │   ├── validator.yaml
    │   ├── scrum-master.yaml
    │   └── hallucination-auditor.yaml
    └── skills/                # Skills library
```

---

## 🔧 Beads Integration

Each specialist interacts with beads:

```bash
# Check what's available for my specialty
bd list --status open --labels frontend

# Claim a task
bd update clawd-123 --claim

# Add progress note
bd note clawd-123 "Implemented button component, tests passing"

# Submit for validation
bd update clawd-123 --status needs-validation

# If blocked, document
bd update clawd-123 --status blocked --note "Waiting on backend API"
```

### Labels for Routing
- `frontend` — UI/styling work
- `backend` — API/database work
- `architecture` — Design decisions
- `testing` — Test writing/fixes
- `devops` — Build/deploy issues
- `cross-cutting` — Multi-domain work

---

## 📊 Research Status

Sub-agents researching:
- [ ] Frontend skills/frameworks
- [ ] Backend skills/frameworks
- [ ] Architecture patterns
- [ ] QA/Testing frameworks
- [ ] DevOps patterns
- [ ] Agent swarm/coordination patterns
- [ ] Anti-hallucination techniques

Results will be merged into this plan.

---

## ⏭️ Next Steps

1. [ ] Finalize role definitions
2. [ ] Research popular skills for each role
3. [ ] Create OpenClaw agent configurations
4. [ ] Create IDENTITY.md for each specialist
5. [ ] Update AGENTS.md with new structure
6. [ ] Create routing logic in Coordinator
7. [ ] Implement Scrum Master cron job
8. [ ] Implement Hallucination Auditor cron job
9. [ ] Test with a real task flow
10. [ ] Document handoff protocols
