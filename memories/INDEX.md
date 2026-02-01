# Memories Index

*Master navigation for Sophie's hierarchical memory system.*

---

## Structure

| Folder | Purpose | Naming Convention |
|--------|---------|-------------------|
| `daily/` | Conversation logs, daily events | `YYYY-MM-DD.md` |
| `projects/` | Project-specific context & history | `{project-name}.md` (kebab-case) |
| `topics/` | Domain knowledge, learnings, skills | `{topic-name}.md` (kebab-case) |
| `people/` | People context (contacts, preferences) | `{person-name}.md` (kebab-case) |

---

## Quick Links

### Active Projects
- [Memory System](projects/memory-system.md) - Hierarchical memory architecture (just built!)

### Key Topics
*(Building as we go)*

### People
- [Aaron](../USER.md) - Primary user (main file in workspace root)

---

## How This System Works

### Recording (During Conversations)
1. **Daily events** → `daily/YYYY-MM-DD.md` (always log significant interactions)
2. **Project work** → create/update `projects/{name}.md`
3. **Learning something** → create/update `topics/{topic}.md`
4. **Meeting someone** → create/update `people/{name}.md`

### Retrieval (Starting Sessions)
1. Check `daily/` for recent days (today + yesterday)
2. Check relevant `projects/` files if working on something specific
3. Use `memory_search` for semantic search across all memories

### Maintenance
- Periodically review daily files → distill into project/topic/people files
- Keep INDEX.md updated with active projects and key topics
- Archive old daily files (>30 days) to `daily/archive/` if needed

---

*Last updated: 2025-02-01*
