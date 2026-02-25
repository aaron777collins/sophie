# Session Log Organization Guide

**Created:** 2026-02-24  
**Task:** p3-1 - Audit and Refactor Session Logs  
**Status:** Active

This document describes the organization system for session logs across the Clawdbot system.

---

## Overview

Session logs are critical for:
- **Debugging** — Finding what went wrong
- **Context** — Understanding past decisions
- **Continuity** — Maintaining memory across sessions
- **Auditing** — Tracking work completion

## Structure

### Primary Log Locations

```
clawd/
├── memory/
│   ├── daily/              # Daily conversation logs
│   │   └── YYYY-MM-DD.md   # One file per day
│   ├── logs/               # Organized log archives
│   │   ├── daily/          # Archived daily logs
│   │   ├── progress/       # Archived progress logs
│   │   ├── archive/        # Old/historical logs
│   │   ├── INDEX.md        # Log index and navigation
│   │   └── metadata.json   # Log statistics and metadata
│   └── projects/           # Project-specific logs
│       └── {project}/      # 341+ project folders
├── scheduler/
│   ├── progress/           # Task progress tracking
│   │   └── {project}/      # 49+ project directories
│   └── log/                # Scheduler operational logs
└── logs/                   # System logs
    └── channel_mentions.log
```

### Organization Principles

1. **By Time** — Daily logs organized by date (YYYY-MM-DD)
2. **By Project** — Progress logs grouped by project/task
3. **By Type** — Separation of conversation, progress, and system logs
4. **By Activity** — Active vs archived logs

## Search

### Using the Search Tool

```bash
# Basic search
tools/log-search.js "error"

# Search with date filter
tools/log-search.js "completed" --from 2026-02-01

# Search specific project
tools/log-search.js "matrix" --project melo

# Search only progress logs
tools/log-search.js "TDD" --source progress

# Get more context
tools/log-search.js "failed" --context 10
```

### Search Options

| Option | Description |
|--------|-------------|
| `--date YYYY-MM-DD` | Filter by specific date |
| `--from YYYY-MM-DD` | Filter from date |
| `--to YYYY-MM-DD` | Filter to date |
| `--project NAME` | Filter by project name |
| `--source TYPE` | daily\|progress\|projects\|all |
| `--context N` | Lines of context (default: 2) |
| `--limit N` | Max results (default: 20) |

## Analysis

### Using the Analysis Tool

```bash
# Get overall statistics
tools/log-analyze.js stats

# Find large files
tools/log-analyze.js sizes

# Check structure
tools/log-analyze.js structure

# Update metadata
tools/log-analyze.js update-meta

# Full analysis
tools/log-analyze.js all
```

### Size Guidelines

| Size | Status | Action |
|------|--------|--------|
| < 50KB | ✅ Good | No action needed |
| 50-100KB | ⚠️ Warning | Consider splitting |
| > 100KB | 🚨 Critical | Must split or archive |

## Best Practices

### Writing Logs

1. **Always timestamp entries** — Use `[YYYY-MM-DD HH:MM TZ]` format
2. **Use consistent headings** — `## Section`, `### Subsection`
3. **Include context** — What, why, and outcome
4. **Link related logs** — Reference other files when relevant
5. **Keep files focused** — One topic or time period per file

### Maintaining Logs

1. **Regular cleanup** — Archive logs older than 30 days
2. **Size monitoring** — Split files exceeding 50KB
3. **Index updates** — Keep INDEX.md current
4. **Metadata refresh** — Run `log-analyze.js update-meta` weekly

### Searching Effectively

1. **Start broad** — Use simple keywords first
2. **Add filters** — Narrow with date/project/source
3. **Check context** — Increase `--context` for unclear matches
4. **Try variations** — Search synonyms if no results

## Rules

### Mandatory

- [ ] Every log entry MUST have a timestamp
- [ ] Files over 100KB MUST be split or archived
- [ ] Daily logs MUST NOT embed full project status dumps
- [ ] Progress logs MUST reference parent task/project

### Recommended

- Use semantic file names (project-task-date.md)
- Group related logs in subdirectories
- Include summary headers in long files
- Cross-reference related entries

### Avoid

- ❌ Massive single-file logs (>100KB)
- ❌ Duplicate content across files
- ❌ Timestamps without timezone
- ❌ Orphaned logs without project reference

## Migration Guide

### From Old Structure

If you have logs in the old locations:

1. **Daily logs** stay in `memory/daily/`
2. **Progress logs** stay in `scheduler/progress/`
3. **Archive old logs** to `memory/logs/archive/`

### Splitting Large Files

```bash
# Find large files
tools/log-analyze.js sizes --threshold 50

# For each large file:
# 1. Create subdirectory
# 2. Split by section or date
# 3. Create _overview.md index
# 4. Update references
```

## Troubleshooting

### Common Issues

**"No results found"**
- Try broader search terms
- Check spelling
- Remove date filters
- Try `--source all`

**"Too many results"**
- Add project filter
- Add date filter
- Use more specific terms

**"File too large"**
- Run `log-analyze.js sizes`
- Split into logical sections
- Archive old content

## Related Documentation

- [AGENTS.md](../AGENTS.md) — Memory system overview
- [memory/INDEX.md](../memory/INDEX.md) — Memory navigation
- [PROACTIVE-JOBS.md](../PROACTIVE-JOBS.md) — Task tracking

---

*Last updated: 2026-02-24 by p3-1*
