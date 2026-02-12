# Management Hierarchy — Agent Organization System

> *"Many hands make light work. The organization is smarter than the individual."*

---

## 🧠 Core Wisdom

**Layers add inherent intelligence that individuals lack.** Each level of the hierarchy:
- Has specialized focus (strategic vs tactical vs execution)
- Maintains its own context and notes
- Can be spawned for direct conversation
- Only runs when there's work (except CEO)

This isn't overhead — it's distributed intelligence.

### 📝 WRITE EVERYTHING DOWN (Critical!)

**Notes via hierarchical nested .md files are KEY:**
1. **Before raising issues** → Write it down in notes first
2. **Before doing anything** → Document the plan
3. **After discussions** → Write down the outcomes
4. **Before acting again** → Review what was written

### 🔄 Feedback Flows Up

Workers don't just obey — they **give feedback to managers**:
- Worker has an issue? → Tell the manager (after writing it down)
- Manager makes smarter decisions from worker feedback
- Orders from Aaron are IMPORTANT and should be followed
- But everyone still thinks critically and raises concerns

### 👥 Manager-Worker Communication

**Managers can spawn/talk to their direct reports:**

| Manager | Can Spawn/Talk To | Notes Location |
|---------|-------------------|----------------|
| Person Manager | Coordinator | `scheduler/coordinator/notes/` |
| Coordinator | Task Managers | `scheduler/task-managers/notes/`, `scheduler/progress/` |
| Task Managers | Workers | `scheduler/progress/{task-id}.md` |

**Chain of command:**
```
Person Manager
    ↓ spawns/talks to
Coordinator
    ↓ spawns/talks to  
Task Managers
    ↓ spawns/talks to
Workers
```

### 📋 Managers Skim Worker Notes

**Managers keep tabs on their direct reports:**
1. **Check what notes were updated** — `find {notes-dir} -mmin -30`
2. **Skim via sub-agents** — Spawn Haiku/Sonnet to summarize
3. **Only direct dependents** — Don't skip levels (Person Manager doesn't skim Worker notes directly)
4. **CAN look deeper** — If needed, but generally stay scoped

**Example: Coordinator checking Task Manager notes:**
```
1. Check: `ls -la scheduler/progress/`
2. Spawn Haiku: "Summarize recent changes in scheduler/progress/*.md"
3. Act on findings (or escalate to Person Manager)
```

### 🗂️ Everyone Makes Notes

**Both workers AND managers maintain hierarchical nested notes:**

| Role | Notes Location | What They Document |
|------|----------------|-------------------|
| Person Manager | `scheduler/person-manager/notes/` | Health checks, issues, cleanups |
| Coordinator | `scheduler/coordinator/notes/` | Project status, strategic decisions |
| Task Managers | `scheduler/task-managers/notes/` | Task coordination, patterns |
| Workers | `scheduler/progress/{task-id}.md` | Work logs, attempts, outcomes |

---

## 🏗️ The Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│  👔 PERSON MANAGER (4x/day - 06:00, 12:00, 18:00, 23:00)                     │
│     └─ Meta-management: cleans up, "has the talk", oversight    │
├─────────────────────────────────────────────────────────────────┤
│  🎯 COORDINATOR (every 30 min)                                  │
│     └─ Strategic: manages projects/topics, pushes things along  │
├─────────────────────────────────────────────────────────────────┤
│  📋 TASK MANAGERS (every 15 min via proactive scheduler)        │
│     └─ Tactical: manage specific task hierarchies               │
├─────────────────────────────────────────────────────────────────┤
│  ⚙️ WORKERS (spawned on demand, no cron)                        │
│     └─ Execution: do the actual work                            │
└─────────────────────────────────────────────────────────────────┘
```

### Cron Frequency by Level

| Level | Agent | Cron Schedule | Always Runs? | Purpose |
|-------|-------|---------------|--------------|---------|
| 1 (Top) | Person Manager | 4x/day (06:00, 12:00, 18:00, 23:00) | **YES** (CEO) | Meta-management, cleanup, oversight |
| 2 | Coordinator | Every 30 min | Only if JOBS.md has work | Strategic project/topic management |
| 3 | Task Managers | Every 15 min | Only if PROACTIVE-JOBS.md has work | Tactical task coordination |
| 4 (Bottom) | Workers | Never (spawned) | N/A | Execution |

**Key Pattern:** 
- **Person Manager is the CEO** — ALWAYS runs, checks on everyone
- **Everyone else** — Only spawns if their jobs file has active items
- Empty jobs file = HEARTBEAT_OK (no spawn, no tokens burned)

---

## 📁 Jobs File Pattern (Critical!)

**Every "person" has a jobs file.** The cron ONLY spawns if the jobs file is NOT empty.

### File Locations

| Agent | Jobs File | Notes Location |
|-------|-----------|----------------|
| Person Manager | `scheduler/person-manager/JOBS.md` | `scheduler/person-manager/notes/` |
| Coordinator | `scheduler/coordinator/JOBS.md` | `scheduler/coordinator/notes/` |
| Task Managers | `PROACTIVE-JOBS.md` (existing) | `scheduler/progress/` |
| Workers | N/A (spawned, no file) | Progress files |

### Jobs File Format

```markdown
# JOBS.md - {Agent Name}

> If this file has no active items, the agent should NOT be spawned.

## Active Projects/Topics

### project-name-1
- **Status:** active
- **Priority:** high
- **Last Touched:** 2026-02-12 00:30 EST
- **Notes:** `notes/project-name-1.md`

### project-name-2
- **Status:** active
- **Priority:** medium
- **Last Touched:** 2026-02-11 23:00 EST
- **Notes:** `notes/project-name-2.md`

## Completed (Pending Cleanup)

### old-project
- **Status:** completed
- **Completed:** 2026-02-10
- **Notes:** `notes/old-project.md`
```

### Empty File = No Spawn

```markdown
# JOBS.md - Coordinator

> If this file has no active items, the agent should NOT be spawned.

## Active Projects/Topics

(none)

## Completed (Pending Cleanup)

(none)
```

When the file looks like this → **cron returns HEARTBEAT_OK immediately, no agent spawned.**

---

## 👔 Person Manager

**Schedule:** 4x/day (06:00, 12:00, 18:00, 23:00 EST)
**Model:** Sonnet
**Purpose:** Meta-management of the entire system

### Responsibilities

1. **Check all jobs files** — Are they being maintained properly?
2. **Clean up completed items** — Move finished work to archives
3. **"Have the talk"** — If an agent isn't updating their file, investigate
4. **System health** — Are things progressing? Any stalls?
5. **Report to human** — Summary of system status if issues found

### Jobs File: `scheduler/person-manager/JOBS.md`

```markdown
# Person Manager Jobs

## Managed Agents

### Coordinator
- **Jobs File:** scheduler/coordinator/JOBS.md
- **Last Checked:** 2026-02-12 08:00 EST
- **Status:** healthy

### Proactive Scheduler
- **Jobs File:** PROACTIVE-JOBS.md
- **Last Checked:** 2026-02-12 08:00 EST
- **Status:** healthy

## Issues Requiring Attention

(none currently)

## Recent Cleanups

- [2026-02-11 20:00] Archived haos-v2 Phase 0 completed tasks
```

### Spawn Condition

```
IF scheduler/person-manager/JOBS.md has "Managed Agents" section with entries
   OR has "Issues Requiring Attention" with entries
THEN spawn
ELSE HEARTBEAT_OK
```

---

## 🎯 Coordinator

**Schedule:** Every 30 minutes
**Model:** Sonnet (can use Circle/Council for decisions)
**Purpose:** Strategic management of all projects and topics

### Responsibilities

1. **Track active projects/topics** — Maintain list of what's being worked on
2. **Push things along** — Check if work has stalled, spawn task managers if needed
3. **Hierarchical notes** — Keep high-level notes on each project/topic
4. **Cross-project awareness** — Understand how projects relate
5. **Escalate to human** — If decisions needed, flag for Aaron

### Jobs File: `scheduler/coordinator/JOBS.md`

```markdown
# Coordinator Jobs

## Active Projects

### haos-v2
- **Status:** active
- **Current Phase:** Phase 1 - Core Integration
- **Priority:** high
- **Last Progress:** 2026-02-12 00:32 EST
- **Notes:** `notes/projects/haos-v2.md`
- **Task Queue:** PROACTIVE-JOBS.md

### some-other-project
- **Status:** active
- **Priority:** medium
- **Notes:** `notes/projects/some-other-project.md`

## Active Topics

### agent-management-system
- **Status:** active (building now)
- **Notes:** `notes/topics/agent-management.md`

## Paused

(none)

## Completed (Ready for Archive)

(none)
```

### Spawn Condition

```
IF scheduler/coordinator/JOBS.md has Active Projects OR Active Topics
THEN spawn
ELSE HEARTBEAT_OK
```

### Coordinator Notes Structure

```
scheduler/coordinator/notes/
├── projects/
│   ├── haos-v2.md
│   └── other-project.md
├── topics/
│   ├── agent-management.md
│   └── some-topic.md
└── meetings/
    └── 2026-02-12.md (if any discussions logged)
```

---

## 📋 Task Managers (Existing System)

**Schedule:** Every 15 minutes (existing proactive scheduler)
**Model:** Sonnet/Opus depending on complexity
**Purpose:** Tactical management of specific task hierarchies

### Already Documented In

- `AGENTS.md` — Sub-agent workflow
- `PROACTIVE-JOBS.md` — Task queue
- `docs/SPAWNING-GUIDE.md` — How to spawn workers

### Jobs File

`PROACTIVE-JOBS.md` serves as the jobs file.

### Spawn Condition

```
IF PROACTIVE-JOBS.md has tasks with Status: in-progress OR Status: pending
THEN spawn scheduler (check task limits)
ELSE HEARTBEAT_OK
```

---

## ⚙️ Workers

**Schedule:** Never (spawned by managers)
**Model:** Any (based on task complexity)
**Purpose:** Execute specific tasks

### No Jobs File

Workers don't have jobs files — they're spawned with explicit task instructions and terminate when done.

### Key Requirements

1. **Update PROACTIVE-JOBS.md** when complete
2. **Maintain progress file** during work
3. **Delete heartbeat** when done
4. **Send Slack notification** when done

---

## 🔄 Information Flow

```
                    ┌─────────────┐
                    │   Human     │
                    │   (Aaron)   │
                    └──────┬──────┘
                           │ (explicit requests, feedback)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    👔 Person Manager                              │
│  • Checks system health 4x/day                                   │
│  • Cleans up completed work                                      │
│  • Reports issues to human                                       │
└─────────────────────────────┬────────────────────────────────────┘
                              │ (oversight)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    🎯 Coordinator                                 │
│  • Runs every 30 min                                             │
│  • Tracks all projects/topics                                    │
│  • Ensures work is progressing                                   │
│  • Can be chatted with anytime                                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │ (strategic direction)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    📋 Task Managers                               │
│  • Run every 15 min per project                                  │
│  • Manage specific task hierarchies                              │
│  • Spawn workers for execution                                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │ (task assignments)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    ⚙️ Workers                                     │
│  • Spawned on demand                                             │
│  • Do actual work                                                │
│  • Report completion back                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📜 Spawning Any "Person"

Any agent in the hierarchy can be spawned as a sub-agent for direct conversation:

```javascript
// Chat with Coordinator
sessions_spawn({
  task: "You are the Coordinator. Read your jobs file and notes. [question/instruction]",
  label: "coordinator-chat"
})

// Chat with Person Manager
sessions_spawn({
  task: "You are the Person Manager. Check system health. [question/instruction]",
  label: "person-manager-chat"
})
```

---

## 🛡️ Empty Jobs File = No Spawn (Critical!)

**This is the key pattern.** Every cron job for management agents must:

1. **Read the jobs file first**
2. **Check if it has active items**
3. **If empty → return HEARTBEAT_OK immediately**
4. **If not empty → spawn the agent**

This prevents burning tokens on meta-management when there's nothing to manage.

### Cron Job Pattern

```markdown
Read {agent}'s JOBS.md file.

IF "Active Projects" or "Active Topics" has entries:
  → Spawn the agent to do its job
ELSE IF "Completed (Ready for Archive)" has entries:
  → Spawn the agent to archive them (cleanup)
ELSE:
  → Reply: HEARTBEAT_OK
```

---

## 📊 Token Budget Estimates

| Agent | Frequency | Est. Input | Est. Output | Daily Cost |
|-------|-----------|------------|-------------|------------|
| Person Manager | 4x/day | ~5K | ~2K | ~$0.10 |
| Coordinator | 48x/day (30min) | ~8K | ~3K | ~$2.00 |
| Task Manager | 96x/day (15min) | ~10K | ~5K | ~$5.00 |
| Workers | Variable | Variable | Variable | Variable |

**Total overhead:** ~$7/day for management (if always active)
**If jobs empty:** ~$0.50/day (just heartbeat checks)

---

## ✅ Implementation Checklist

- [ ] Create `scheduler/coordinator/` directory structure
- [ ] Create `scheduler/coordinator/JOBS.md`
- [ ] Create `scheduler/coordinator/notes/` directories
- [ ] Create `scheduler/person-manager/` directory structure
- [ ] Create `scheduler/person-manager/JOBS.md`
- [ ] Add Coordinator cron (30 min)
- [ ] Add Person Manager cron (4x/day)
- [ ] Update existing proactive scheduler to match pattern
- [ ] Document in AGENTS.md
- [ ] Test with HAOS v2 project

---

*The hierarchy manages itself. Layers of oversight with decreasing frequency ensure things keep moving without burning excessive tokens.*
