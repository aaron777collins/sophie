# Memories Index

*Master navigation for Sophie's hierarchical memory system.*

**Last Updated:** 2026-02-01 ~16:00 EST

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
| Project | Status | Description |
|---------|--------|-------------|
| [WYDOT Connected Driving](projects/wydot-connected-driving.md) | 🟡 In Progress | ML pipeline for Wyoming DOT vehicle data |
| [Memory System](projects/memory-system.md) | ✅ Complete | Hierarchical memory architecture |

### Key Topics
| Topic | Description |
|-------|-------------|
| [Chrome/Xvfb Automation](topics/chrome-xvfb-automation.md) | Headless browser automation setup |
| [AWS S3 Authentication](topics/aws-s3-authentication.md) | S3 credential patterns and gotchas |
| [Problem-Solving Methodology](topics/problem-solving-methodology.md) | Brain/Body model, sub-agents |

### People
| Person | Notes |
|--------|-------|
| [Aaron](../USER.md) | Primary user (main file in workspace root) |

---

## Recent Daily Logs

| Date | Highlights |
|------|------------|
| [2026-02-01](daily/2026-02-01.md) | Memory system design & organization |
| [2026-01-29](daily/2026-01-29.md) | S3 auth fix, synthetic data, ML pipeline validation |
| [2026-01-28](daily/2026-01-28.md) | WYDOT DataSources implementation, Ralph setup |
| [2026-01-27](daily/2026-01-27.md) | **Day One** - First boot, identity established |

---

## How This System Works

### Recording (During Conversations)
1. **Daily events** → `daily/YYYY-MM-DD.md` (always log significant interactions with timestamps)
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
- **Always include dates and times** when recording events

---

## File Count

| Folder | Count |
|--------|-------|
| daily/ | 4 files |
| projects/ | 2 files |
| topics/ | 3 files |
| people/ | 0 files (using USER.md for Aaron) |
