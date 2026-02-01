# Memory System

## Overview
Sophie's hierarchical memory architecture for persistent context across conversations.

## Status
✅ **Complete** - Initial implementation done 2026-02-01

---

## Timeline

| Date | Time | Event |
|------|------|-------|
| 2026-02-01 | ~13:30 EST | Aaron requested hierarchical memory system |
| 2026-02-01 | ~13:30 EST | Designed structure: daily/projects/topics/people |
| 2026-02-01 | ~13:30 EST | Implemented folder structure, migrated existing daily files |
| 2026-02-01 | ~13:30 EST | Updated IDENTITY.md with memory system as core identity |
| 2026-02-01 | ~13:30 EST | Updated AGENTS.md with recording/retrieval guidelines |
| 2026-02-01 | ~13:30 EST | Created `skills/memory-system/` skill for retrieval |
| 2026-02-01 | ~15:59 EST | Reorganization: fixed dates, added timestamps, created topic files |

---

## Structure

```
memories/
├── daily/           # YYYY-MM-DD.md conversation logs
├── projects/        # {name}.md project context
├── topics/          # {topic}.md domain knowledge  
├── people/          # {name}.md people context
└── INDEX.md         # master navigation
```

---

## Design Decisions

### Why Hierarchical?
- Daily logs capture everything but become hard to search
- Projects need persistent context that survives daily rotation
- Topics capture learning that spans multiple projects
- People context helps remember preferences and history

### Why Inherent to Identity?
- Memory isn't just a feature—it's how I provide continuity
- Proactive recording shouldn't require explicit requests
- Makes me genuinely more useful over time

### File Naming
- **Kebab-case:** `project-name.md`, `topic-name.md`
- **Dates in daily:** `YYYY-MM-DD.md`
- **All dates/times should be recorded** when events occur

---

## Recording Guidelines

### Always Include
- **Date:** YYYY-MM-DD format
- **Time:** ~HH:MM EST when known
- **Context:** What was happening, who was involved

### Recording Triggers
| Trigger | Action |
|---------|--------|
| "Let's work on [project]" | Check/create `projects/{name}.md`, update throughout |
| "I learned that..." | Create/update `topics/{topic}.md` |
| Meeting someone / "My friend X..." | Create/update `people/{name}.md` |
| Any significant event | Log to `daily/YYYY-MM-DD.md` |

---

## Resources
- [IDENTITY.md](../../IDENTITY.md) - Memory system section
- [AGENTS.md](../../AGENTS.md) - Recording/retrieval guidelines
- [Skill](../../skills/memory-system/SKILL.md) - Retrieval patterns
