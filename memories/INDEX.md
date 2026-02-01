# Memories Index

*Master navigation for Sophie's self-scaling hierarchical memory system (v2).*

**Last Updated:** [2026-02-01 16:25 EST]

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
| [WYDOT Connected Driving](projects/wydot-connected-driving.md) | 🟡 In Progress | 2026-01-31 | ML pipeline for Wyoming DOT vehicle data |
| [Memory System](projects/memory-system.md) | 🔄 v2 Upgrade | 2026-02-01 | Self-scaling memory architecture |

### Key Topics
| Topic | Last Updated | Description |
|-------|--------------|-------------|
| [Chrome/Xvfb Automation](topics/chrome-xvfb-automation.md) | 2026-02-01 | Headless browser automation setup |
| [AWS S3 Authentication](topics/aws-s3-authentication.md) | 2026-02-01 | S3 credential patterns and gotchas |
| [Problem-Solving Methodology](topics/problem-solving-methodology.md) | 2026-02-01 | Brain/Body model, sub-agents |

### People
| Person | Notes |
|--------|-------|
| [Aaron](../USER.md) | Primary user (main file in workspace root) |

---

## Recent Daily Logs

| Date | Key Events |
|------|------------|
| [2026-02-01](daily/2026-02-01.md) | Memory system v1 → v2 upgrade, self-scaling |
| [2026-01-29](daily/2026-01-29.md) | S3 auth fix, synthetic data, ML pipeline |
| [2026-01-28](daily/2026-01-28.md) | WYDOT DataSources implementation |
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

### When Files Become Folders
Example of scaling:
```
topics/browser-automation.md      # Small: single file
topics/browser-automation/        # Large: folder
    ├── _overview.md              # Index with summary
    ├── chrome-xvfb.md           # Sub-topic
    ├── playwright.md            # Sub-topic
    └── troubleshooting.md       # Sub-topic
```

---

## File Count

| Folder | Files | Folders |
|--------|-------|---------|
| daily/ | 4 | 0 |
| projects/ | 2 | 0 |
| topics/ | 3 | 0 |
| people/ | 0 | 0 |

*Next scaling candidate: topics/chrome-xvfb-automation.md (review at 500 lines)*
