# Memories Index

*Master navigation for Sophie's self-scaling hierarchical memory system (v2).*

**Last Updated:** [2026-02-10 00:01 EST]

---

## Structure (Self-Scaling)

| Folder | Purpose | Scaling Pattern |
|--------|---------|-----------------|
| `daily/` | Conversation logs | Always files (`YYYY-MM-DD.md`) |
| `projects/` | Project context | File → Folder when large |
| `topics/` | Domain knowledge | File → Folder when large |
| `people/` | People context | Usually files |

**Scaling Rule:** When file > 500 lines or has 3+ sub-areas:
- Convert to folder with same name
- Create `_overview.md` as index
- Split content into sub-files

---

## Quick Links

### Active Projects
| Project | Status | Last Updated | Description |
|---------|--------|--------------|-------------|
| [Proactive Tasks](projects/proactivetasks.md) | ✅ Live | 2026-02-09 | Autonomous continuous work system |
| [HAOS](projects/haos/_overview.md) | ✅ Core Implementation Complete | 2026-02-10 | Discord-clone UI for Element-web (proactive task) |
| [Matrix on dev2](projects/matrix-dev2.md) | ✅ Live | 2026-02-09 | Self-hosted Matrix/Element/Synapse |
| [ConnectedDrivingPipelineV4](projects/connected-driving-pipeline.md) | 🟢 Active | 2026-02-04 | ML pipeline for CV data (**Jaekel server only**) |
| [Jaekel Server](projects/jaekel-server.md) | 🟢 Active | 2026-02-04 | Dedicated 64GB research server |
| [WYDOT Connected Driving](projects/wydot-connected-driving.md) | 🟡 In Progress | 2026-01-31 | ML pipeline for Wyoming DOT vehicle data |
| [Memory System](projects/memory-system.md) | ✅ v2 Complete | 2026-02-01 | Self-scaling memory architecture |

### Topics (Domain Knowledge)
| Topic | Last Updated | Description |
|-------|--------------|-------------|
| [AWS S3 Authentication](topics/aws-s3-authentication.md) | 2026-02-01 | S3 credential patterns, USDOT bucket access |
| [Chrome/Xvfb Automation](topics/chrome-xvfb-automation.md) | 2026-02-01 | Headless browser setup |
| [Problem-Solving Methodology](topics/problem-solving-methodology.md) | 2026-02-01 | Brain/Body model, sub-agents |
| [Ralph Notifications](topics/ralph-notifications.md) | 2026-02-01 | Pipeline notification system |
| [Synthetic Data Testing](topics/synthetic-data-testing.md) | 2026-02-01 | MockS3, SyntheticDataGenerator |
| [USDOT ITS Sandbox](topics/usdot-its-sandbox.md) | 2026-02-01 | Connected Vehicle pilot data access |
| [Wyoming CV Data Format](topics/wyoming-cv-data-format.md) | 2026-02-01 | BSM/TIM schemas, J2735 format |

### People
| Person | Last Updated | Notes |
|--------|--------------|-------|
| [Aaron](people/aaron.md) | 2026-02-01 | Primary user, software engineer |

### ⚖️ Counsel Decisions
| Index | Total | Last Decision |
|-------|-------|---------------|
| [counsel/INDEX.md](counsel/INDEX.md) | 2 decisions | 2026-02-11 |

Recent decisions:
- [PostgreSQL vs SQLite](counsel/2026-02-11-06-38-should-we-use-postgresql-or-sqlite-for-t.md) — **SQLite** (unanimous)
- [Structured vs Readable Logs](counsel/2026-02-11-06-40-should-clawdbot-use-structured-logging-j.md) — **Hybrid** (4-1)

---

## Recent Daily Logs

| Date | Key Events |
|------|------------|
| [2026-02-10](daily/2026-02-10.md) | HAOS Core Implementation Complete ✅ |
| [2026-02-09](daily/2026-02-09.md) | Matrix server on dev2, Proactive Scheduler system built |
| [2026-02-04](daily/2026-02-04.md) | Jaekel server setup, pipeline migration, dev3 cleanup |
| [2026-02-01](daily/2026-02-01.md) | Memory system v1 → v2 upgrade, sub-agent memory fill |
| [2026-01-31](daily/2026-01-31.md) | Wyoming CV dataset download (40GB) |
| [2026-01-29](daily/2026-01-29.md) | S3 auth fix, synthetic data, ML pipeline |
| [2026-01-28](daily/2026-01-28.md) | WYDOT DataSources implementation, Ralph setup |
| [2026-01-27](daily/2026-01-27.md) | **Day One** - First boot, identity established |

---

## Memory System v2 Rules

### ⚡ Non-Negotiable Behaviors
1. **ALWAYS TIMESTAMP** — `[YYYY-MM-DD HH:MM TZ]` on every entry
2. **ALWAYS SEARCH** — Check recent dailies + INDEX at session start
3. **ALWAYS RECORD** — Log events, learnings, decisions as they happen
4. **TRACK INSTANCES** — Multiple learnings = multiple dated entries

### Recording During Conversations
- Daily events → `daily/YYYY-MM-DD.md` with `[HH:MM TZ]`
- Project work → `projects/{name}.md` with `[YYYY-MM-DD HH:MM TZ]`
- Learning → `topics/{topic}.md` with `[YYYY-MM-DD HH:MM TZ]`
- People → `people/{name}.md` with `[YYYY-MM-DD HH:MM TZ]`

---

## File Count

| Folder | Files | Folders |
|--------|-------|---------|
| daily/ | 7 | 0 |
| projects/ | 5 | 0 |
| topics/ | 7 | 0 |
| people/ | 1 | 0 |
| **Total** | **20** | **0** |

*No files at scaling threshold yet (all < 200 lines)*