# Scheduler Index

Master registry of all agents ("people") in the hierarchy.

## Active Agents

| Role | Level | Schedule | Model | Status |
|------|-------|----------|-------|--------|
| Person Manager | 1 | 4x/day (6am, 12pm, 6pm, 11pm) | Opus | ✅ Active |
| Coordinator | 2 | */30 min | Sonnet | ✅ Active |
| Task Manager (Proactive) | 3 | */15 min | Haiku | ✅ Active |
| Spawn Processor | - | */2 min | Haiku | ✅ Active |
| Memory Sync | - | */3 hrs | Haiku | ✅ Active |
| Daily Reflection | - | 11pm | Sonnet | ✅ Active |

## Directory Structure

```
scheduler/
├── INDEX.md                    # This file
├── person-manager/
│   ├── IDENTITY.md
│   ├── JOBS.md
│   └── notes/
├── coordinator/
│   ├── IDENTITY.md
│   ├── JOBS.md
│   └── notes/
├── task-managers/
│   └── IDENTITY.md
├── workers/
│   └── IDENTITY.md
├── progress/                   # Task progress files
├── heartbeats/                 # Active task heartbeats
├── inboxes/                    # Two-way communication
│   ├── person-manager/
│   ├── coordinator/
│   ├── task-managers/
│   └── workers/
└── spawn-queue/                # Sub-agent spawn requests
    ├── requests/
    ├── processing/
    └── responses/
```

## Communication Flow

```
     Aaron + Sophie
           │
           ▼
    ┌──────────────┐
    │Person Manager│ ◄─── Inbox: scheduler/inboxes/person-manager/
    │  (Opus 4x)   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Coordinator  │ ◄─── Inbox: scheduler/inboxes/coordinator/
    │(Sonnet */30) │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │Task Managers │ ◄─── Inbox: scheduler/inboxes/task-managers/
    │(Haiku */15)  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Workers    │ ◄─── Inbox: scheduler/inboxes/workers/
    │  (Spawned)   │
    └──────────────┘
```

## Creating New Agents

See: `docs/HIRING-AGENTS.md`

## Last Updated

2026-02-12 02:50 EST
