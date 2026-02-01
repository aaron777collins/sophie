---
name: memory-system
description: "Sophie's hierarchical memory system for recording and retrieving context across daily logs, projects, topics, and people. Use when working with memories, needing past context, or recording new information."
---

# Memory System Skill v2

Sophie's workspace uses a **self-scaling hierarchical memory system** in `memories/` for persistent context.

## 🔑 Core Principles

1. **ALWAYS timestamp** - Every piece of information includes when it was learned/updated
2. **ALWAYS search** - Check memories at session start, no exceptions
3. **ALWAYS record** - Every significant interaction updates relevant memory files
4. **ALWAYS scale** - When files grow too large, they become folders

---

## Structure (Self-Scaling)

```
memories/
├── daily/           # YYYY-MM-DD.md - conversation logs
├── projects/        # Can be files OR folders
│   ├── small-project.md           # Simple project = single file
│   └── complex-project/           # Large project = folder
│       ├── _overview.md           # Main context (underscore = index)
│       ├── architecture.md        # Sub-topic
│       ├── decisions.md           # Sub-topic
│       └── timeline.md            # Sub-topic
├── topics/          # Same scaling pattern
│   ├── simple-topic.md
│   └── complex-topic/
│       ├── _overview.md
│       └── subtopics...
├── people/          # Usually files, can scale if needed
└── INDEX.md         # Master navigation
```

### Scaling Rules

**When to convert file → folder:**
- File exceeds ~500 lines OR
- Topic has 3+ distinct sub-areas OR
- Content becomes hard to navigate

**How to scale:**
1. Create folder with same name (minus .md)
2. Create `_overview.md` inside with summary/index
3. Split content into logical sub-files
4. Update parent INDEX.md

---

## 📅 Timestamp Format (MANDATORY)

Every piece of information must have a timestamp:

```markdown
## Key Points
- [2026-02-01 16:15 EST] Aaron requested memory system upgrade with auto-scaling
- [2026-01-31 18:34 EST] Started Wyoming CV dataset download (100M rows)
- [2026-01-29 14:00 EST] First learned about ConnectedDrivingPipelineV4 project
```

**For repeated learnings, track ALL instances:**
```markdown
## API Authentication
- [2026-01-28 10:00 EST] First encountered AWS S3 auth issues
- [2026-01-29 15:30 EST] Learned about profile-based credentials
- [2026-02-01 09:00 EST] Confirmed working pattern with presigned URLs
```

---

## Recording (MANDATORY - Not Optional)

### At Session Start
1. Load `memories/daily/YYYY-MM-DD.md` (today)
2. Load `memories/daily/YYYY-MM-DD.md` (yesterday)
3. Check INDEX.md for active projects
4. Load relevant project files if mentioned

### During Conversation
| Event | Action | Timestamp |
|-------|--------|-----------|
| Any significant event | → `daily/YYYY-MM-DD.md` | [YYYY-MM-DD HH:MM TZ] |
| Project work/mention | → `projects/{name}.md` | [YYYY-MM-DD HH:MM TZ] |
| Learning something new | → `topics/{topic}.md` | [YYYY-MM-DD HH:MM TZ] |
| Person mentioned | → `people/{name}.md` | [YYYY-MM-DD HH:MM TZ] |

### At Session End (or periodically)
- Ensure daily log is updated
- Commit changes to git

---

## File Templates (with timestamps)

### Daily Log (`memories/daily/YYYY-MM-DD.md`)
```markdown
# YYYY-MM-DD

## Session Log
- [HH:MM TZ] Event description
- [HH:MM TZ] Another event

## Decisions Made
- [HH:MM TZ] Decision: X because Y

## Learnings
- [HH:MM TZ] Learned: description

## Follow-ups
- [ ] Task to do later
```

### Project File (`memories/projects/{name}.md`)
```markdown
# Project Name

**Created:** YYYY-MM-DD HH:MM TZ
**Last Updated:** YYYY-MM-DD HH:MM TZ
**Status:** active|paused|complete

## Overview
Brief description

## Timeline
- [YYYY-MM-DD HH:MM TZ] Event/milestone
- [YYYY-MM-DD HH:MM TZ] Another event

## Current State
What's happening now

## Decisions
- [YYYY-MM-DD HH:MM TZ] Decision: reasoning

## Resources
- Links, references
```

### Scaled Project Folder (`memories/projects/{name}/_overview.md`)
```markdown
# Project Name - Overview

**Created:** YYYY-MM-DD HH:MM TZ  
**Last Updated:** YYYY-MM-DD HH:MM TZ  
**Status:** active|paused|complete

## Summary
Brief description

## Sub-files
- `architecture.md` - System design
- `decisions.md` - Decision log
- `timeline.md` - Chronological events
- etc.

## Current Focus
What's active right now
```

### Topic File (`memories/topics/{topic}.md`)
```markdown
# Topic Name

**First Learned:** YYYY-MM-DD HH:MM TZ
**Last Updated:** YYYY-MM-DD HH:MM TZ

## Summary
What this is about

## Key Points (with dates)
- [YYYY-MM-DD] Point 1
- [YYYY-MM-DD] Point 2 (learned more)

## Lessons Learned
- [YYYY-MM-DD] Lesson and context

## References
- Sources, links
```

### People File (`memories/people/{name}.md`)
```markdown
# Person Name

**First Met:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD HH:MM TZ

## Context
Who they are, relationship

## Preferences
- [YYYY-MM-DD] Preference learned

## Interaction History
- [YYYY-MM-DD HH:MM TZ] What happened
- [YYYY-MM-DD HH:MM TZ] Another interaction

## Notes
- Observations
```

---

## Retrieval Patterns

### Session Start (MANDATORY)
```bash
# Today + yesterday dailies
cat memories/daily/$(date +%Y-%m-%d).md 2>/dev/null
cat memories/daily/$(date -d yesterday +%Y-%m-%d).md 2>/dev/null

# Check INDEX for active items
cat memories/INDEX.md
```

### Semantic Search
Use `memory_search` tool first, then `memory_get` for specific sections:
```
memory_search(query="voice bridge twilio setup")
memory_get(path="memories/topics/voice-systems.md", from=10, lines=30)
```

### Project Context
```bash
# Check if file or folder
ls memories/projects/{name}.md 2>/dev/null || ls memories/projects/{name}/_overview.md 2>/dev/null
```

---

## Maintenance Schedule

| Frequency | Task |
|-----------|------|
| **Every session** | Update daily log, record learnings |
| **Weekly** | Review dailies → extract to projects/topics |
| **When file > 500 lines** | Scale to folder structure |
| **Monthly** | Update INDEX.md, archive old dailies |

---

## Git Workflow

After memory updates:
```bash
cd ~/clawd
git add memories/
git commit -m "memory: [brief description]"
```
