# Topic: Management Hierarchy

**Created:** 2026-02-12 01:17 EST
**Status:** Active pattern

## Overview

We use a hierarchical management system for agents. Each level has specialized focus and decreasing cron frequency going up.

## The Hierarchy

```
👔 Person Manager (2x/day, Opus) — CEO, ALWAYS runs
   └── 🎯 Coordinator (30 min, Sonnet) — Strategic
       └── 📋 Task Managers (15 min, varies) — Tactical
           └── ⚙️ Workers (spawned, varies) — Execution
```

## Key Principles

### "Many hands make light work"
- The organization is smarter than the individual
- Layers add inherent intelligence that individuals lack
- Distribute work across specialized agents

### Only CEO Always Runs
- Person Manager checks system health regardless of work
- Everyone else only spawns if their jobs file has active items
- Empty jobs file = HEARTBEAT_OK (no tokens burned)

### Write Everything Down
- Notes via hierarchical nested .md files are KEY
- Before raising issues → Write it down first
- After discussions → Write outcomes before acting again

### Feedback Flows Up
- Workers obey managers BUT give feedback
- Managers make smarter decisions from worker feedback
- Orders from Aaron are IMPORTANT and should be followed
- Everyone still thinks critically and raises concerns

### Take Action, Don't Recommend
- Person Manager and Coordinator should DO things
- Don't just suggest — spawn agents, fix issues, update files
- Report what was DONE, not what could be done

### Manage Direct Reports Only
- Don't skip levels in the hierarchy
- Person Manager → Coordinator (not Task Managers directly)
- Skim notes of direct dependents via Haiku/Sonnet
- CAN look deeper if needed, but stay scoped

## File Locations

| Person | Jobs File | Identity | Notes |
|--------|-----------|----------|-------|
| Person Manager | `scheduler/person-manager/JOBS.md` | `scheduler/person-manager/IDENTITY.md` | `scheduler/person-manager/notes/` |
| Coordinator | `scheduler/coordinator/JOBS.md` | `scheduler/coordinator/IDENTITY.md` | `scheduler/coordinator/notes/` |
| Task Managers | `PROACTIVE-JOBS.md` | `scheduler/task-managers/IDENTITY.md` | `scheduler/progress/` |
| Workers | N/A | `scheduler/workers/IDENTITY.md` | Progress files |

## Full Documentation

See: `docs/MANAGEMENT-HIERARCHY.md`
