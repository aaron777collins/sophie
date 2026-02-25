# Gateway Architecture Documentation

**Version:** 1.0  
**Created:** 2026-02-24  
**Author:** Sub-agent p3-2 (Proactive Job System Enhancement)  
**Status:** Complete  

---

## Executive Summary

The Clawdbot Gateway is the central orchestration layer that enables Sophie (and associated management agents) to operate autonomously. It consists of:

1. **WebSocket Gateway Server** - Real-time communication hub running on port 18789
2. **Systemd Service** - User-level daemon for process management and auto-restart
3. **Cron Scheduler** - Time-based task execution for proactive agents
4. **Agent Hierarchy** - Multi-level management structure for task delegation
5. **Session Management** - Conversation and sub-agent lifecycle tracking
6. **Validation Pipeline** - 3-layer verification system for quality assurance

This document provides a comprehensive audit of the current architecture, identifies improvement areas, and outlines a migration plan for future enhancements.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Components](#core-components)
3. [Communication Architecture](#communication-architecture)
4. [Agent Hierarchy](#agent-hierarchy)
5. [Session & Sub-Agent Management](#session--sub-agent-management)
6. [Configuration System](#configuration-system)
7. [Validation & Testing](#validation--testing)
8. [Current Limitations & Improvement Areas](#current-limitations--improvement-areas)
9. [Migration Plan](#migration-plan)
10. [Technical Reference](#technical-reference)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLAWDBOT GATEWAY                                │
│                         (WebSocket Server @ 18789)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Slack     │    │   Cron      │    │  HTTP API   │    │   Nodes     │  │
│  │  Channel    │    │ Scheduler   │    │ (REST)      │    │ (Devices)   │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         └──────────────────┼──────────────────┼──────────────────┘         │
│                            │                  │                            │
│                     ┌──────┴──────────────────┴──────┐                     │
│                     │        Agent Runtime           │                     │
│                     │    (Claude API Integration)    │                     │
│                     └──────────────┬─────────────────┘                     │
│                                    │                                       │
│         ┌─────────────────────────┬┴┬─────────────────────────┐            │
│         │                         │ │                         │            │
│  ┌──────┴──────┐           ┌──────┴─┴──────┐           ┌──────┴──────┐    │
│  │  Sessions   │           │   Memory      │           │   Skills    │    │
│  │  Storage    │           │   (Local)     │           │   Engine    │    │
│  └─────────────┘           └───────────────┘           └─────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
              ┌───────────────────────────────────────────────────┐
              │                  WORKSPACE                         │
              │               ~/clawd/                             │
              │  ┌─────────────────────────────────────────────┐  │
              │  │ scheduler/                                   │  │
              │  │ ├── coordinator/IDENTITY.md, JOBS.md         │  │
              │  │ ├── person-manager/IDENTITY.md               │  │
              │  │ ├── task-managers/IDENTITY.md                │  │
              │  │ ├── validator/IDENTITY.md                    │  │
              │  │ ├── story-architect/IDENTITY.md              │  │
              │  │ ├── workers/IDENTITY.md                      │  │
              │  │ ├── heartbeats/                              │  │
              │  │ ├── inboxes/{agent}/                         │  │
              │  │ ├── spawn-queue/                             │  │
              │  │ └── progress/                                │  │
              │  └─────────────────────────────────────────────┘  │
              └───────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js v22 | Server execution |
| Gateway | WebSocket + HTTP | Real-time + REST API |
| Process Mgmt | Systemd (user-level) | Daemon lifecycle |
| Scheduling | Internal Cron | Time-based triggers |
| Storage | JSON files | Config, sessions, state |
| AI Backend | Anthropic Claude API | Model inference |
| Channel | Slack (Socket Mode) | User interaction |

---

## Core Components

### 1. Gateway Service

The gateway is the central WebSocket server that handles all agent communication.

**Service Configuration:**
```
File: ~/.config/systemd/user/clawdbot-gateway.service
Port: 18789 (WebSocket + HTTP)
Bind: loopback (127.0.0.1 only)
Restart: always (5 second delay)
```

**Service File Contents:**
```ini
[Unit]
Description=Clawdbot Gateway (v2026.1.24-3)
After=network-online.target
Wants=network-online.target

[Service]
ExecStart="/usr/bin/node" "/home/ubuntu/.npm-global/lib/node_modules/clawdbot/dist/entry.js" gateway --port 18789
Restart=always
RestartSec=5
KillMode=process
Environment=HOME=/home/ubuntu
Environment=CLAWDBOT_GATEWAY_PORT=18789
Environment=CLAWDBOT_GATEWAY_TOKEN=<token>

[Install]
WantedBy=default.target
```

**Gateway Commands:**
```bash
# Check status
clawdbot gateway status

# Control service
clawdbot gateway start
clawdbot gateway stop
clawdbot gateway restart

# View logs
clawdbot logs
# Or: /tmp/moltbot/moltbot-YYYY-MM-DD.log
```

### 2. Cron Scheduler

The internal cron system manages periodic agent runs.

**Active Cron Jobs:**
```
~/.clawdbot/cron/jobs.json
```

| Job Name | Schedule | Model | Purpose |
|----------|----------|-------|---------|
| memory-sync | `0 */3 * * *` | Haiku | Consolidate progress to memory |
| person-manager | `0 6,12,18,23 * * *` | Opus | Strategic oversight |
| coordinator | `0,30 * * * *` | Sonnet | Phase management |
| task-managers | `*/15 * * * *` | Haiku | Task execution |
| validator | `10,40 * * * *` | Sonnet | Independent QA |
| proactive-scheduler | `*/15 * * * *` | Haiku | Heartbeat monitoring |

**Cron Management:**
```bash
clawdbot cron list           # View all jobs
clawdbot cron enable <name>  # Enable a job
clawdbot cron disable <name> # Disable a job
clawdbot cron run <name>     # Manual trigger
```

### 3. Session Storage

Sessions track conversation state and agent lifecycles.

**Session Types:**
- **Main Sessions**: Direct user conversations (e.g., `agent:main:slack:C0ABAU26S6N`)
- **Cron Sessions**: Scheduled agent runs (e.g., `agent:main:cron:uuid`)
- **Sub-Agent Sessions**: Spawned workers (e.g., `agent:main:subagent:uuid`)

**Storage:**
```
Session store location: Managed by gateway runtime
View: clawdbot sessions --json
Filter: clawdbot sessions --active 120  # Last 2 hours
```

### 4. WebSocket Protocol

The gateway uses a custom WebSocket protocol for real-time communication.

**Key Message Types:**
- `agentTurn` - Start/continue agent conversation
- `sessions_spawn` - Spawn sub-agent
- `browser` - Browser automation
- `exec` - Shell command execution
- `message` - Channel messaging

**Connection:**
```
ws://127.0.0.1:18789
Auth: Bearer token in connect params
```

---

## Communication Architecture

### Inbox System

Agents communicate asynchronously through a file-based inbox system.

**Directory Structure:**
```
~/clawd/scheduler/inboxes/
├── coordinator/
│   ├── archive/
│   └── *.json
├── person-manager/
├── task-managers/
├── validator/
└── workers/
```

**Message Format:**
```json
{
  "id": "msg-timestamp",
  "timestamp": "ISO-8601",
  "from": "sending-agent",
  "to": "receiving-agent",
  "type": "notification|request|response",
  "subject": "Brief subject",
  "content": { ... }
}
```

### Spawn Queue

Sub-agents cannot spawn other agents directly. Instead, they use the spawn queue.

**Location:** `~/clawd/scheduler/spawn-queue/`
```
spawn-queue/
├── requests/    # Pending spawn requests
├── processing/  # Currently being processed
├── responses/   # Spawn results
└── archive/     # Historical records
```

**Spawn Request Format:**
```json
{
  "requestId": "unique-id",
  "requestedBy": "parent-task-id",
  "requestedAt": "ISO-timestamp",
  "spawn": {
    "label": "child-task-id",
    "model": "anthropic/claude-3-haiku-20240307",
    "task": "Task instructions..."
  }
}
```

**Processing:** A cron job (Spawn Processor) runs every 2 minutes to process requests.

### Heartbeat Mechanism

Active tasks maintain heartbeat files to indicate they're still running.

**Location:** `~/clawd/scheduler/heartbeats/`

**Heartbeat Format:**
```json
{
  "taskId": "p3-2",
  "lastHeartbeat": "ISO-timestamp",
  "sessionKey": "agent:main:subagent:uuid",
  "status": "running",
  "progress": "Current step description"
}
```

**Stale Detection:** Heartbeats older than 20 minutes are considered stale. The proactive scheduler may respawn stale tasks.

---

## Agent Hierarchy

### Management Levels

```
👑 Aaron + Sophie ─ Top level ("the big dawgs"), give orders
   │
   └── 👔 Person Manager (Opus, 4x/day) ─ Master Plans, EPICS, meta-management
       │
       ├── 📐 Story Architect (Opus via Claude Code) ─ USER STORIES with full ACs
       │       │   (separate process — can spawn unlimited reviewers)
       │       └──► approved stories ──►─┐
       │                                 │
       ├── 🎯 Coordinator (Opus/Sonnet, 30 min) ◄┘ ─ SUB-TASKS from stories
       │       │
       │       └──► validation requests ──►─┐
       │                                    │
       └── 🔍 Validator (Sonnet, 30 min) ◄──┘ ─ Independent QA
           │
           └── 📋 Task Managers (Haiku, 15 min) ─ Spawn workers
               └── ⚙️ Workers (Sonnet impl / Haiku cmds) ─ Execution
```

### Model Assignments

| Role | Model | Responsibility |
|------|-------|----------------|
| **Person Manager** | Opus | Master Plans, Epics, strategic decisions |
| **Story Architect** | Opus | User Stories, ACs, contingencies, dependencies |
| **Coordinator** | Opus (planning) / Sonnet (monitoring) | Break stories into sub-tasks |
| **Validator** | Sonnet | Independent validation |
| **Task Managers** | Haiku | Spawn workers, heartbeats |
| **Workers (impl)** | Sonnet | Code implementation |
| **Workers (cmd)** | Haiku | Pure command execution ONLY |

### Identity Files

Each agent role has an IDENTITY.md file defining its behavior:

| Agent | Identity File |
|-------|---------------|
| Person Manager | `scheduler/person-manager/IDENTITY.md` |
| Story Architect | `scheduler/story-architect/IDENTITY.md` |
| Coordinator | `scheduler/coordinator/IDENTITY.md` |
| Validator | `scheduler/validator/IDENTITY.md` |
| Task Managers | `scheduler/task-managers/IDENTITY.md` |
| Workers | `scheduler/workers/IDENTITY.md` |

---

## Session & Sub-Agent Management

### Session Lifecycle

```
1. CREATION
   └── Gateway receives request (Slack, Cron, API)
   └── Creates session with unique key
   └── Initializes agent context

2. EXECUTION
   └── Agent reads workspace files
   └── Performs tool calls (exec, browser, etc.)
   └── May spawn sub-agents

3. COMPLETION
   └── Agent outputs final response
   └── Session marked complete
   └── Memory may be persisted
```

### Sub-Agent Spawning

**Direct Spawn (Main/Cron sessions only):**
```javascript
sessions_spawn({
  model: "anthropic/claude-3-haiku-20240307",
  label: "task-identifier",
  task: "Instructions for sub-agent..."
})
```

**Queue-Based Spawn (Sub-agents):**
```bash
# Create spawn request
cat > ~/clawd/scheduler/spawn-queue/requests/my-request.json << 'EOF'
{
  "requestId": "my-request",
  "requestedBy": "parent-task",
  "spawn": { "label": "child-task", "model": "...", "task": "..." }
}
EOF

# Poll for response (processed within 2 minutes)
cat ~/clawd/scheduler/spawn-queue/responses/my-request.json
```

### Concurrency Limits

```json
// From ~/.clawdbot/clawdbot.json
{
  "agents": {
    "defaults": {
      "maxConcurrent": 4,          // Main sessions
      "subagents": {
        "maxConcurrent": 8         // Sub-agent limit
      }
    }
  }
}
```

---

## Configuration System

### Primary Configuration

**Location:** `~/.clawdbot/clawdbot.json`

**Key Sections:**
```json
{
  "meta": { "lastTouchedVersion": "2026.1.24-3" },
  "auth": { "profiles": { ... } },
  "agents": {
    "defaults": {
      "model": { "primary": "anthropic/claude-opus-4-5" },
      "workspace": "/home/ubuntu/clawd",
      "timeoutSeconds": 3600,
      "maxConcurrent": 4
    }
  },
  "channels": {
    "slack": { "mode": "socket", "enabled": true }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": { "mode": "token", "token": "..." }
  }
}
```

### Authentication

**Token Authentication:**
- Gateway uses bearer token auth
- Token stored in both config and systemd service env
- Loopback-only binding adds security layer

**Channel Auth (Slack):**
- Bot Token: `xoxb-...` for API calls
- App Token: `xapp-...` for Socket Mode

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `CLAWDBOT_GATEWAY_PORT` | Gateway WebSocket port |
| `CLAWDBOT_GATEWAY_TOKEN` | Auth token |
| `HOME` | User home directory |

---

## Validation & Testing

### 3-Layer Validation System

The system implements a comprehensive 3-layer validation protocol:

```
┌─────────────────────────────────────────────────────────────────────┐
│   LAYER 1: SELF-VALIDATION (Worker)                                 │
│   - Tests written BEFORE implementation (TDD)                       │
│   - All tests pass (RED → GREEN → REFACTOR)                         │
│   - Acceptance criteria met                                         │
│   - Testing evidence collected                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│   LAYER 2: MANAGER VALIDATION (Coordinator)                         │
│   - Verify test evidence provided                                   │
│   - Confirm tests validate acceptance criteria                      │
│   - Check test coverage adequacy                                    │
│   - Spawn fresh-perspective validator                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│   LAYER 3: INDEPENDENT VALIDATION (Validator)                       │
│   - Run tests independently                                         │
│   - Verify test quality                                             │
│   - Check for edge cases                                            │
│   - Final approval                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Test Frameworks

| Work Type | Testing Tools |
|-----------|---------------|
| Documentation | Validation scripts, link checkers |
| Frontend Code | Jest, Playwright, Cypress |
| Backend Code | Jest, Supertest, integration tests |
| Infrastructure | Smoke tests, deployment validation |

### TDD Requirements

All development follows Test-Driven Development:
1. **RED** - Write tests first (they should fail)
2. **GREEN** - Implement just enough to pass
3. **REFACTOR** - Improve while keeping tests green

---

## Current Limitations & Improvement Areas

### Performance Concerns

| Issue | Description | Impact |
|-------|-------------|--------|
| **Gateway Timeout** | Under high load, gateway can become slow | Spawn failures, stalled tasks |
| **Sequential Processing** | Spawn queue processed every 2 minutes | 2+ minute latency for sub-agent spawns |
| **Memory Pressure** | Large workspaces can slow startup | Longer session initialization |

**Observed Behavior:**
> "Gateway can be slow when lots of things are going on - retry instead of giving up."
> - From `scheduler/coordinator/notes/2026-02-22-gateway-retry-lesson.md`

### Scalability Considerations

| Area | Current State | Limitation |
|------|---------------|------------|
| **Concurrent Agents** | 4 main + 8 sub | Fixed limits, not adaptive |
| **Workspace Size** | Single workspace | No multi-workspace support |
| **Channel Support** | Slack only | No multi-channel routing |
| **Node Distribution** | Single node | No distributed execution |

### Reliability Requirements

| Requirement | Current State | Gap |
|-------------|---------------|-----|
| **Auto-Recovery** | Systemd restart on crash | No graceful degradation |
| **State Persistence** | JSON files | No atomic transactions |
| **Backup Strategy** | Manual git commits | No automated backups |
| **Health Monitoring** | Basic `gateway status` | No alerting system |

### Known Technical Debt

1. **Haiku Model Limitation**: OAuth tokens only access `claude-3-haiku-20240307`, not 3.5 versions
2. **Spawn Queue Latency**: 2-minute polling interval creates bottleneck
3. **No Message Deduplication**: Inbox system lacks idempotency
4. **Single Point of Failure**: Gateway crash affects all operations

---

## Migration Plan

### Overview

This migration plan outlines enhancements to improve reliability, performance, and scalability of the gateway architecture. The plan is divided into phases for incremental improvement.

### Phase 1: Documentation & Monitoring (Week 1)

**Objective:** Improve observability and create baseline metrics.

| Task | Description | Estimate |
|------|-------------|----------|
| 1.1 | Document current architecture (this document) | 4 hours |
| 1.2 | Add structured logging to key components | 2 hours |
| 1.3 | Create health check endpoint enhancements | 2 hours |
| 1.4 | Establish baseline performance metrics | 2 hours |

**Deliverables:**
- [ ] GATEWAY-ARCHITECTURE.md (complete)
- [ ] Enhanced logging configuration
- [ ] Health check documentation

### Phase 2: Reliability Improvements (Weeks 2-3)

**Objective:** Reduce single points of failure and improve recovery.

| Task | Description | Estimate |
|------|-------------|----------|
| 2.1 | Implement spawn queue push model (reduce latency) | 8 hours |
| 2.2 | Add request deduplication to inbox system | 4 hours |
| 2.3 | Create automated backup mechanism | 4 hours |
| 2.4 | Implement graceful shutdown handling | 4 hours |
| 2.5 | Add retry logic with exponential backoff | 4 hours |

**Deliverables:**
- [ ] Improved spawn queue (<30s latency)
- [ ] Idempotent message handling
- [ ] Automated state backups

### Phase 3: Performance Optimization (Weeks 4-5)

**Objective:** Improve throughput and reduce latency.

| Task | Description | Estimate |
|------|-------------|----------|
| 3.1 | Implement connection pooling | 4 hours |
| 3.2 | Add request prioritization | 6 hours |
| 3.3 | Optimize workspace loading | 4 hours |
| 3.4 | Profile and optimize hot paths | 8 hours |

**Deliverables:**
- [ ] 50% reduction in average spawn latency
- [ ] Priority queue for time-sensitive operations
- [ ] Documented performance baselines

### Phase 4: Scalability Enhancements (Weeks 6-8)

**Objective:** Support growth and distribution.

| Task | Description | Estimate |
|------|-------------|----------|
| 4.1 | Design multi-workspace architecture | 8 hours |
| 4.2 | Implement adaptive concurrency limits | 4 hours |
| 4.3 | Evaluate distributed gateway options | 8 hours |
| 4.4 | Add multi-channel routing | 6 hours |

**Deliverables:**
- [ ] Multi-workspace design document
- [ ] Adaptive concurrency implementation
- [ ] Scalability roadmap

### Risk Assessment

| Risk | Mitigation | Priority |
|------|------------|----------|
| Breaking changes during migration | Feature flags, gradual rollout | High |
| Data loss during state changes | Backup before changes, rollback plan | High |
| Performance regression | Baseline metrics, A/B testing | Medium |
| Extended downtime | Off-hours deployment, rapid rollback | Medium |

### Success Criteria

- [ ] Zero breaking changes to existing functionality
- [ ] All existing tests continue to pass
- [ ] 50% improvement in spawn latency (Phase 2)
- [ ] Documentation complete and accurate
- [ ] Migration can be paused/resumed at any phase

---

## Technical Reference

### File Locations

| Purpose | Path |
|---------|------|
| Gateway Config | `~/.clawdbot/clawdbot.json` |
| Systemd Service | `~/.config/systemd/user/clawdbot-gateway.service` |
| Gateway Logs | `/tmp/moltbot/moltbot-YYYY-MM-DD.log` |
| Cron Jobs | `~/.clawdbot/cron/jobs.json` |
| Workspace | `~/clawd/` |
| Scheduler | `~/clawd/scheduler/` |
| Heartbeats | `~/clawd/scheduler/heartbeats/` |
| Inboxes | `~/clawd/scheduler/inboxes/` |
| Spawn Queue | `~/clawd/scheduler/spawn-queue/` |
| Progress | `~/clawd/scheduler/progress/` |
| Agent Identities | `~/clawd/scheduler/{role}/IDENTITY.md` |

### CLI Reference

```bash
# Gateway Management
clawdbot gateway status        # Show status
clawdbot gateway start         # Start service
clawdbot gateway stop          # Stop service
clawdbot gateway restart       # Restart service

# Cron Management
clawdbot cron list             # List all jobs
clawdbot cron enable <name>    # Enable job
clawdbot cron disable <name>   # Disable job
clawdbot cron run <name>       # Run immediately

# Session Management
clawdbot sessions              # List sessions
clawdbot sessions --active 60  # Recent only
clawdbot sessions --json       # JSON output

# Health & Diagnostics
clawdbot doctor                # Health checks
clawdbot status                # Channel health
clawdbot health                # Gateway health
```

### Port Assignments

| Service | Port | Binding |
|---------|------|---------|
| Gateway WebSocket | 18789 | 127.0.0.1 (loopback) |
| HTTP Dashboard | 18789 | 127.0.0.1 (loopback) |

### Model Identifiers

| Alias | Full Model ID |
|-------|---------------|
| opus | anthropic/claude-opus-4-5 |
| sonnet | anthropic/claude-sonnet-4-20250514 |
| haiku | anthropic/claude-3-haiku-20240307 |

---

## Appendix

### Related Documentation

- `docs/CRON-SETUP.md` - Cron configuration guide
- `docs/PLANNING-SYSTEM.md` - Planning workflow documentation
- `scheduler/INDEX.md` - Scheduler registry
- `AGENTS.md` - Agent behavior guidelines

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-24 | p3-2 | Initial comprehensive documentation |

---

*Document generated as part of p3-2: Migrate Gateway to New Architecture*
