# Cron Setup Guide

Sophie uses scheduled cron jobs to run proactive management agents. This enables autonomous project work, coordination, and oversight.

## The Management Hierarchy

```
👔 Person Manager (4x/day)    — Strategic oversight, cleanup
   └── 🎯 Coordinator (30 min)   — Phase management, task breakdown
       └── 📋 Task Managers (15 min) — Execute and track tasks
           └── 🔍 Validator (30 min)    — Independent QA verification
```

## Required Cron Jobs

Add these to your Clawdbot cron configuration:

### Using Clawdbot CLI

```bash
# Person Manager - runs 4x daily (adjust times to your schedule)
clawdbot cron add "person-manager" --schedule "0 8,12,17,21 * * *" \
  --model opus --text "Read scheduler/person-manager/IDENTITY.md and scheduler/person-manager/JOBS.md. Execute your duties."

# Coordinator - runs every 30 minutes at :00 and :30
clawdbot cron add "coordinator" --schedule "0,30 * * * *" \
  --model sonnet --text "Read scheduler/coordinator/IDENTITY.md and scheduler/coordinator/JOBS.md. Execute your duties."

# Task Managers - runs every 15 minutes
clawdbot cron add "task-managers" --schedule "*/15 * * * *" \
  --model haiku --text "Read scheduler/task-managers/IDENTITY.md and PROACTIVE-JOBS.md. Execute pending tasks."

# Validator - runs every 30 minutes at :10 and :40 (offset from Coordinator)
clawdbot cron add "validator" --schedule "10,40 * * * *" \
  --model sonnet --text "Read scheduler/validator/IDENTITY.md and scheduler/validator/JOBS.md. Process validation requests."
```

### Manual Cron (crontab)

If you prefer system crontab, add to `crontab -e`:

```cron
# Person Manager (4x daily at 8am, 12pm, 5pm, 9pm)
0 8,12,17,21 * * * cd /path/to/workspace && clawdbot run --cron person-manager

# Coordinator (every 30 min)
0,30 * * * * cd /path/to/workspace && clawdbot run --cron coordinator

# Task Managers (every 15 min)
*/15 * * * * cd /path/to/workspace && clawdbot run --cron task-managers

# Validator (every 30 min, offset)
10,40 * * * * cd /path/to/workspace && clawdbot run --cron validator
```

## Model Recommendations

| Agent | Model | Why |
|-------|-------|-----|
| Person Manager | Opus | Strategic decisions, needs deep reasoning |
| Coordinator | Sonnet/Opus | Phase planning, moderate complexity |
| Task Managers | Haiku | Execution only, follows instructions |
| Validator | Sonnet | Independent verification needs good judgment |

## Verifying Setup

After adding cron jobs:

```bash
# List all cron jobs
clawdbot cron list

# Test run a specific job
clawdbot cron run person-manager

# Check job status
clawdbot cron status
```

## Disabling Scheduling

To disable proactive work temporarily:

```bash
# Disable specific job
clawdbot cron disable task-managers

# Or clear all jobs
clawdbot cron clear
```

## Notes

- Jobs only do work if their JOBS.md file has pending tasks
- Empty JOBS.md = agent replies `HEARTBEAT_OK` and exits
- All activity is logged to `scheduler/*/notes/`
- The hierarchy ensures work flows down properly
