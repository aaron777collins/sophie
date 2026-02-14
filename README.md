# SOPHIE

> **S**ophisticated **O**mnichannel **P**ersonal **H**elp & **I**nfo **E**ngine

A complete AI agent workspace template with hierarchical task management, memory systems, planning frameworks, and verification chains. Built for [Clawdbot](https://github.com/clawdbot/clawdbot) / OpenClaw.

## What is SOPHIE?

SOPHIE is a **workspace template** that transforms a basic AI agent into a sophisticated personal assistant with:

- 🧠 **Hierarchical Memory** — Self-scaling memory system across daily logs, projects, topics, and people
- 👔 **Management Hierarchy** — Multi-level agent coordination (Person Manager → Coordinator → Task Managers → Workers)
- 📋 **Planning System** — Iterative plan refinement with review passes before execution
- 🔍 **Verification Chain** — Trust-but-verify completion validation at every level
- 💜 **The Circle** — Multi-perspective reasoning framework for decisions
- 🪞 **Self-Reflection** — Daily learning and continuous improvement

## Quick Start

### Prerequisites

- [Clawdbot](https://github.com/clawdbot/clawdbot) installed and configured
- An AI model provider (Anthropic Claude recommended)

### Installation

```bash
# Clone this repo to your workspace
git clone https://github.com/aaron777collins/sophie.git ~/clawd

# Run the onboarding wizard
cd ~/clawd
./onboard.sh
```

The onboarding wizard will:
1. Ask for your name and preferences
2. Generate your personalized IDENTITY.md and USER.md
3. Set up the cron jobs for proactive scheduling
4. Configure your memory system

### First Conversation

After setup, start a conversation with your agent:

```
You: Hey, who are you?
Agent: *reads SOUL.md, IDENTITY.md* I'm [your chosen name]! Let me get to know you...
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR AI AGENT                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   SOUL.md    │  │ IDENTITY.md  │  │   USER.md    │               │
│  │  (Who I am)  │  │ (My details) │  │ (About you)  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    MANAGEMENT HIERARCHY                         │ │
│  │                                                                  │ │
│  │  👑 Human ─ Top level, gives orders                             │ │
│  │     └── 👔 Person Manager (4x/day) ─ Strategic planning         │ │
│  │         └── 🎯 Coordinator (30 min) ─ Phase management          │ │
│  │             └── 📋 Task Managers (15 min) ─ Task coordination   │ │
│  │                 └── ⚙️ Workers (spawned) ─ Execution            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      MEMORY SYSTEM                              │ │
│  │                                                                  │ │
│  │  memory/                                                         │ │
│  │  ├── daily/           # YYYY-MM-DD.md conversation logs         │ │
│  │  ├── projects/        # Project context (auto-scales to folders)│ │
│  │  ├── topics/          # Domain knowledge                        │ │
│  │  ├── people/          # People context                          │ │
│  │  ├── reflections/     # Self-improvement logs                   │ │
│  │  └── INDEX.md         # Master navigation                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      CORE SYSTEMS                               │ │
│  │                                                                  │ │
│  │  📋 Planning System    → Iterative plan refinement              │ │
│  │  🔍 Verification Chain → Trust-but-verify completions           │ │
│  │  💜 The Circle         → Multi-perspective reasoning            │ │
│  │  🪞 Self-Reflection    → Daily learning & improvement           │ │
│  │  🤝 Hired Agents       → Recursive task decomposition           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
sophie/
├── README.md                 # This file
├── onboard.sh               # Setup wizard
├── AGENTS.md                # Master coordination guide
├── SOUL.md                  # Agent personality template
├── IDENTITY.md              # Agent identity template
├── USER.md                  # Human user template
├── BOOTSTRAP.md             # First-run instructions
├── HEARTBEAT.md             # Periodic check-in config
├── MEMORY.md                # Curated long-term memory
├── PROACTIVE-JOBS.md        # Task queue
│
├── docs/                    # System documentation
│   ├── PLANNING-SYSTEM.md
│   ├── VERIFICATION-SYSTEM.md
│   ├── MANAGEMENT-HIERARCHY.md
│   ├── HIRED-AGENTS.md
│   ├── SPAWNING-GUIDE.md
│   ├── THE-CIRCLE.md
│   ├── THE-COUNSEL.md
│   └── SELF-REFLECTION.md
│
├── scheduler/               # Management hierarchy
│   ├── person-manager/
│   │   ├── IDENTITY.md
│   │   ├── JOBS.md
│   │   └── notes/
│   ├── coordinator/
│   │   ├── IDENTITY.md
│   │   ├── JOBS.md
│   │   └── notes/
│   ├── task-managers/
│   │   └── IDENTITY.md
│   ├── workers/
│   │   └── IDENTITY.md
│   ├── spawn-queue/
│   │   └── README.md
│   ├── heartbeats/
│   ├── progress/
│   └── inboxes/
│       ├── person-manager/
│       ├── coordinator/
│       ├── task-managers/
│       └── workers/
│
├── memory/                  # Memory system
│   ├── INDEX.md
│   ├── daily/
│   ├── projects/
│   ├── topics/
│   ├── people/
│   └── reflections/
│       ├── daily/
│       ├── insights/
│       └── improvements/
│
├── skills/                  # Custom skills
│   ├── circle/
│   │   └── SKILL.md
│   ├── counsel/
│   │   └── SKILL.md
│   ├── hired-agents/
│   │   └── SKILL.md
│   └── memory-system/
│       └── SKILL.md
│
└── config/                  # Configuration templates
    ├── clawdbot-config.template.json
    └── cron-jobs.template.md
```

## Core Systems

### 1. Management Hierarchy

A layered system where each level has specific responsibilities:

| Level | Agent | Frequency | Model | Responsibility |
|-------|-------|-----------|-------|----------------|
| L1 | Person Manager | 4x/day | Opus | Strategic planning, oversight |
| L2 | Coordinator | 30 min | Opus/Sonnet | Phase management, task breakdown |
| L3 | Task Managers | 15 min | Sonnet | Task coordination, worker spawning |
| L4 | Workers | On-demand | Haiku/Sonnet | Task execution |

### 2. Planning System

No execution without an approved plan:

```
Human: "Build X"
    ↓
L1 creates Master Plan → Review → Refine → Approve
    ↓
L2 creates Phase Plans → Review → Refine → Approve
    ↓
L2 populates PROACTIVE-JOBS.md
    ↓
L3/L4 execute pre-planned tasks
```

### 3. Verification Chain

Trust but verify at every level:

```
Worker claims "done"
    ↓
Task Manager VERIFIES (runs tests, checks output)
    ↓
Coordinator AUDITS (spot-checks, integration tests)
    ↓
Person Manager CONFIRMS (deployment check)
    ↓
ACTUALLY COMPLETE ✅
```

### 4. Memory System

Self-scaling hierarchical memory:

- **Daily logs** — Conversation records by date
- **Projects** — Project-specific context (auto-scales to folders)
- **Topics** — Domain knowledge accumulation
- **People** — Relationship context
- **Reflections** — Learning and improvement

### 5. The Circle

Multi-perspective reasoning for decisions:

| Weight | Agents | When to Use |
|--------|--------|-------------|
| 💭 Internal | 0 | Quick mental check |
| 🟢 Light | 1-2 | Minor decisions |
| 🟡 Standard | 3 | Important choices |
| 🟠 Elevated | 5 | Complex situations |
| 🔴 Council | 5-7 | Mission-critical |

## Customization

### Changing the Name

Edit `IDENTITY.md`:
```markdown
- **Name:** YourAgentName
```

### Adding Skills

Create a new skill in `skills/your-skill/SKILL.md` following the template.

### Modifying Behavior

Edit `SOUL.md` to change personality and interaction style.

## Requirements

- Clawdbot v2026.1.x or later
- Claude Opus recommended (Sonnet minimum)
- ~500MB disk space for memory accumulation

## Contributing

Contributions welcome! Please read the existing documentation to understand the systems before proposing changes.

## License

MIT License - See LICENSE file

## Credits

Originally developed as "Sophie" - the personal AI assistant workspace. Open-sourced to help others build sophisticated AI agent systems.

---

*"Many hands make light work. Fresh perspectives catch what tired agents miss."*
