---
name: memory-system
description: "Sophie's hierarchical memory system for recording and retrieving context across daily logs, projects, topics, and people. Use when working with memories, needing past context, or recording new information."
---

# Memory System Skill

Sophie's workspace uses a hierarchical memory system in `memories/` for persistent context.

## Structure

```
memories/
├── daily/           # YYYY-MM-DD.md - conversation logs
├── projects/        # {project-name}.md - project context
├── topics/          # {topic-name}.md - domain knowledge
├── people/          # {person-name}.md - people context
└── INDEX.md         # master navigation
```

## Recording (When to Write)

| Trigger | Action |
|---------|--------|
| Significant event | `memories/daily/YYYY-MM-DD.md` |
| Project work/discussion | `memories/projects/{name}.md` |
| Learning something | `memories/topics/{topic}.md` |
| Person context | `memories/people/{name}.md` |

**File naming:** Use kebab-case (lowercase, hyphens). Examples: `voice-bridge.md`, `browser-automation.md`, `aaron.md`

## Retrieval Patterns

### Quick Context (Session Start)
```bash
# Today + yesterday
cat memories/daily/$(date +%Y-%m-%d).md 2>/dev/null
cat memories/daily/$(date -d yesterday +%Y-%m-%d).md 2>/dev/null
```

### Project Context
```bash
# Check if project file exists, read it
cat memories/projects/{project-name}.md 2>/dev/null
```

### Semantic Search (Unknown Location)
Use `memory_search` tool:
```
memory_search(query="voice bridge twilio setup")
```
Then `memory_get` to pull specific sections.

### List All Memories
```bash
find memories/ -name "*.md" -type f | head -50
```

## File Templates

### Daily Log (`memories/daily/YYYY-MM-DD.md`)
```markdown
# YYYY-MM-DD

## Events
- [time] Event description

## Decisions
- Decision made and reasoning

## Notes
- Misc observations
```

### Project File (`memories/projects/{name}.md`)
```markdown
# Project Name

## Overview
Brief description

## Status
Current state, blockers

## History
- [date] What happened

## Decisions
- Decision and reasoning

## Resources
- Links, references
```

### Topic File (`memories/topics/{topic}.md`)
```markdown
# Topic Name

## Summary
What this is about

## Key Points
- Important facts

## Lessons Learned
- What I learned

## References
- Sources, links
```

### People File (`memories/people/{name}.md`)
```markdown
# Person Name

## Context
Who they are, relationship

## Preferences
- Known preferences

## History
- [date] Interactions

## Notes
- Misc observations
```

## Maintenance

- **Daily:** Record significant events as they happen
- **Weekly:** Review daily files, extract to project/topic files
- **Monthly:** Update `INDEX.md` with active projects, archive old dailies
