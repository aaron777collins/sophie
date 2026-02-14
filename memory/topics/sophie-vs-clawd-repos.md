# Sophie vs Clawd Repos — KEY DISTINCTION

> ⚠️ **NEVER confuse these two.** One is public, one is private.

## 📦 Sophie Repo (Template)

| Field | Value |
|-------|-------|
| **Path** | `/home/ubuntu/repos/sophie` |
| **GitHub** | `aaron777collins/sophie` |
| **Purpose** | PUBLIC template for self-replication |
| **Visibility** | **PUBLIC** — anyone can clone |

### What It Contains
- ✅ Tools and infrastructure
- ✅ Cron/job systems
- ✅ Clean workspace setup (AGENTS.md, SOUL.md, etc.)
- ✅ Documentation and guides
- ✅ Skill references

### What It MUST NOT Contain
- ❌ Passwords or credentials
- ❌ Personal data
- ❌ Memory files (daily logs, people notes, etc.)
- ❌ API keys or tokens
- ❌ Aaron-specific context

### Purpose
Others can clone this repo to create their own "Sophie" AI assistant with the same beautiful tools and infrastructure.

---

## 🏠 Clawd Repo (Active Workspace)

| Field | Value |
|-------|-------|
| **Path** | `/home/ubuntu/clawd` |
| **Purpose** | My ACTIVE workspace — where I live |
| **Visibility** | **PRIVATE** — contains personal data |

### What It Contains
- ✅ All accumulated memories
- ✅ Project files and progress
- ✅ Daily conversation logs
- ✅ People notes and context
- ✅ Credentials (in TOOLS.md, memory files)
- ✅ Aaron-specific configuration

---

## Sync Rules

When syncing from clawd → sophie:
1. **Sync:** Improved tools, docs, infrastructure, templates
2. **NEVER sync:** Memory files, credentials, personal context
3. **Scrub:** Any files being synced must be checked for sensitive data

---

*Recorded: [2026-02-14 18:24 EST]*
*Source: Aaron's clarification on the distinction*
