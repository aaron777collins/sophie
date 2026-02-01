# Memory System

## Overview
Sophie's hierarchical memory architecture for persistent context across conversations.

## Status
✅ **Complete** - Initial implementation done 2025-02-01

## Structure
```
memories/
├── daily/           # YYYY-MM-DD.md conversation logs
├── projects/        # {name}.md project context
├── topics/          # {topic}.md domain knowledge  
├── people/          # {name}.md people context
└── INDEX.md         # master navigation
```

## History
- [2025-02-01] Aaron requested hierarchical memory system
- [2025-02-01] Designed structure: daily/projects/topics/people
- [2025-02-01] Implemented folder structure, migrated existing daily files
- [2025-02-01] Updated IDENTITY.md with memory system as core identity
- [2025-02-01] Updated AGENTS.md with recording/retrieval guidelines
- [2025-02-01] Created `skills/memory-system/` skill for retrieval

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
- Kebab-case: `project-name.md`, `topic-name.md`
- Dates in daily: `YYYY-MM-DD.md`

## Resources
- [IDENTITY.md](../../IDENTITY.md) - Memory system section
- [AGENTS.md](../../AGENTS.md) - Recording/retrieval guidelines
- [Skill](../../skills/memory-system/SKILL.md) - Retrieval patterns
