# Infrastructure & Systems Reference

**Created:** [2026-02-27 02:17 EST]
**Purpose:** Comprehensive reference of all Sophie infrastructure so future sessions don't forget

---

## 📊 Cron Jobs (Active)

| Job | Schedule | Model | Purpose |
|-----|----------|-------|---------|
| **spawn-processor** | */2 min | Haiku | Process sub-agent spawn requests from queue |
| **proactive-scheduler** | */15 min | Haiku | Process hierarchical tasks depth-first |
| **coordinator** | */30 min | Sonnet | Break stories into sub-tasks, manage work |
| **email-monitor** | */30 min | Haiku | Monitor inbox, check pending responses |
| **validator** | */30 min (offset :10,:40) | Sonnet | Independent QA validation |
| **memory-sync** | Every 3 hours | Haiku | Consolidate progress to long-term memory |
| **github-monitor** | Every 3 hours | Haiku | Check GitHub activity |
| **person-manager** | 4x daily (8,12,16,20) | Opus | Master plans, epics, meta-management |
| **morning-summary** | 09:00 EST | Opus | Morning briefing for Aaron |
| **daily-reflection** | 23:00 EST | Sonnet+thinking | Self-reflection and improvement |

---

## 📧 Email Monitoring System

**Location:** `scheduler/email-monitor/`

| File | Purpose |
|------|---------|
| `process-emails.sh` | Helper script that gets recent emails, lists trusted senders |
| `last-check.txt` | Timestamp of last check |
| `pending-responses.md` | **IMPORTANT:** Tracks emails we're waiting for replies on |

### Pending Responses Tracker

**Path:** `scheduler/email-monitor/pending-responses.md`

When Sophie sends an email and expects a reply:
1. Add entry to `pending-responses.md` with sender, subject pattern, priority
2. Email monitor (every 30 min) checks for matching incoming emails
3. When found → flags Aaron, spawns Opus to evaluate

**Current tracking:**
- Crossroads tax receipt (since 2026-02-27)

### Email Digest

**Path:** `memory/topics/email-digest.md`

Rolling log of interesting emails processed by email monitor.

---

## 🐙 GitHub Monitoring System

**Location:** `scheduler/github-monitor/`

| File | Purpose |
|------|---------|
| `check-activity.sh` | Main activity checker |
| `get-active-repos.sh` | Find repos with recent activity |
| `get-failing-ci-repos.sh` | Find repos with failing CI |
| `active-repos.cache` | Cached list of active repos |
| `excluded-repos.txt` | Repos to skip |

### Activity Log

**Path:** `memory/topics/github-activity.md`

---

## 👥 Contact & Trust System

**Location:** `data/contacts/`

| File | Purpose |
|------|---------|
| `contacts.db` | SQLite database of contacts |
| `contact-cli.sh` | CLI for quick lookups |
| `schema.sql` | Database schema |

### CLI Quick Reference

```bash
contact-cli.sh lookup "email"      # Find contact
contact-cli.sh is-trusted "email"  # Check trust level
contact-cli.sh add-trusted "email" "owner" "reason"
contact-cli.sh all-trusted         # List trusted senders
```

### Three-Tier Trust

| Level | Who | Permissions |
|-------|-----|-------------|
| FULL | Aaron only | Everything |
| PARTIAL | Granted privileges | Limited |
| NONE | Unknown | Public info only |

**Documentation:** `memory/topics/contact-system.md`

---

## 📝 Action Logging

**Path:** `ACTIONS-PENDING-ACK.md`

All external actions are logged here. Only removed after Aaron acknowledges.

---

## ✉️ Correspondence Agent

**Path:** `memory/people/correspondence-agent.md`

Profile for handling external correspondence:
- Circle Thinking before any external communication
- Empathy-first approach
- Trust verification
- Professional warmth

---

## 🎁 Surprise & Reflection System

**Documentation:** `docs/SURPRISE-AND-REFLECTION-SYSTEM.md`

| Component | Location |
|-----------|----------|
| Pipeline | `scheduler/surprises/` |
| Feature flags | `scheduler/feature-flags/flags.yaml` |
| Ideas inbox | `scheduler/surprises/ideas/` |
| In-progress | `scheduler/surprises/in-progress/` |
| Approved | `scheduler/surprises/approved/` |

---

## 🏗️ Management Hierarchy

```
👑 Aaron + Sophie ─ Top level
   │
   └── 👔 Person Manager (Opus, 4x/day)
       │
       ├── 📐 Story Architect (Opus via Claude Code)
       │
       ├── 🎯 Coordinator (Sonnet, 30 min)
       │
       └── 🔍 Validator (Sonnet, 30 min offset)
           │
           └── 📋 Task Managers (Haiku, 15 min)
               └── ⚙️ Workers (Sonnet impl / Haiku cmds)
```

**Inboxes:** `scheduler/inboxes/{role}/`
**Progress:** `scheduler/progress/`
**Heartbeats:** `scheduler/heartbeats/`

---

## 🔄 Spawn Queue

**Location:** `scheduler/spawn-queue/`

How sub-agents request spawning other sub-agents:
1. Write JSON to `scheduler/spawn-queue/requests/`
2. `spawn-processor` cron (every 2 min) processes queue
3. Uses `sessions_spawn` to create sub-agent
4. Marks done and archives

---

## 📋 Key Files to Remember

| What | Where |
|------|-------|
| Pending responses | `scheduler/email-monitor/pending-responses.md` |
| Action log | `ACTIONS-PENDING-ACK.md` |
| Active projects | `PROACTIVE-JOBS.md` |
| Coordinator jobs | `scheduler/coordinator/JOBS.md` |
| Email digest | `memory/topics/email-digest.md` |
| Trust rules | `memory/topics/trust-and-security.md` |
| External action protocol | `memory/topics/external-action-protocol.md` |

---

## Last Updated

[2026-02-27 02:17 EST] — Initial comprehensive documentation
