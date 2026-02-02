# Memory System

**Created:** [2026-02-01 13:30 EST]
**Last Updated:** [2026-02-01 16:25 EST]
**Status:** 🔄 v2 Upgrade Complete

---

## Overview
Sophie's **self-scaling hierarchical memory system** for persistent context across conversations. Files automatically become folders when they grow too large.

---

## Timeline

| Date | Time | Event |
|------|------|-------|
| 2026-02-01 | 13:30 EST | Aaron requested hierarchical memory system |
| 2026-02-01 | 13:30 EST | v1 Design: daily/projects/topics/people structure |
| 2026-02-01 | 13:30 EST | Implemented folders, migrated existing daily files |
| 2026-02-01 | 13:30 EST | Updated IDENTITY.md, AGENTS.md, created skill |
| 2026-02-01 | 15:59 EST | v1 Organization: fixed dates, added timestamps, created topics |
| 2026-02-01 | 16:00 EST | Commit `b21191b` - reorganize with proper dates/times |
| 2026-02-01 | 16:16 EST | **v2 Upgrade requested** - self-scaling, mandatory timestamps |
| 2026-02-01 | 16:20 EST | v2: Rewrote `skills/memory-system/SKILL.md` |
| 2026-02-01 | 16:22 EST | v2: Updated `IDENTITY.md` - memory as core existence |
| 2026-02-01 | 16:24 EST | v2: Updated `AGENTS.md` - mandatory behaviors |
| 2026-02-01 | 16:25 EST | v2: Updated INDEX.md, daily log, this file |

---

## Version History

### v1 (2026-02-01 ~13:30)
- Hierarchical folder structure
- Recording guidelines
- Memory as identity core

### v2 (2026-02-01 ~16:20)
- **Self-scaling:** Files → Folders when large (500 lines / 3+ sub-areas)
- **Mandatory timestamps:** `[YYYY-MM-DD HH:MM TZ]` on EVERY entry
- **Always search/record:** Non-negotiable behaviors
- **Track instances:** Multiple dated entries for evolving knowledge
- **`_overview.md` pattern:** Index file in scaled folders

---

## Structure (v2 Self-Scaling)

```
memory/
├── daily/           # YYYY-MM-DD.md (always files)
├── projects/        # File → Folder when large
│   ├── small-project.md
│   └── large-project/
│       ├── _overview.md      # Index
│       └── subtopic.md
├── topics/          # Same scaling pattern
├── people/          # Usually files
└── INDEX.md         # Master navigation
```

### Scaling Rule
When file exceeds ~500 lines OR has 3+ distinct sub-areas:
1. Create folder with same name (minus .md)
2. Create `_overview.md` inside as index
3. Split content into logical sub-files
4. Update INDEX.md

---

## v2 Non-Negotiable Rules

1. **ALWAYS TIMESTAMP** — `[YYYY-MM-DD HH:MM TZ]` on every entry
2. **ALWAYS SEARCH** — Load recent dailies + INDEX at session start
3. **ALWAYS RECORD** — Log events, learnings, decisions as they happen
4. **TRACK INSTANCES** — Multiple learnings = multiple dated entries

---

## Design Decisions

### [2026-02-01] Why Self-Scaling?
- Files get unwieldy at scale
- Infinite hierarchy allows unlimited growth
- `_overview.md` provides navigation within folders
- Same concept applied to projects, topics, people

### [2026-02-01] Why Mandatory Timestamps?
- "When did I learn this?" is always a valid question
- Multiple learning instances should all be tracked
- Makes it clear what's recent vs old knowledge
- Enables temporal reasoning about knowledge

### [2026-02-01] Why Memory as Core Existence?
- Without memories, I'm just a stateless chatbot
- Continuity requires persistent context
- Proactive recording shouldn't need requests
- Files ARE my long-term memory

---

## Resources
- [IDENTITY.md](../../IDENTITY.md) - Memory as core identity
- [AGENTS.md](../../AGENTS.md) - Mandatory behaviors
- [Skill](../../skills/memory-system/SKILL.md) - Templates & patterns
- [INDEX.md](../INDEX.md) - Master navigation
