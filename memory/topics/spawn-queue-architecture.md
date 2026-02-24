# Spawn Queue Architecture

> **Created:** [2026-02-24 00:49 EST]
> **Context:** Aaron asked about spawn-processor cron; documented for future debugging

## Overview

The spawn queue enables **indirect/chain spawning** — sub-agents can request spawns without having direct `sessions_spawn` access.

## How It Works

```
┌─────────────┐     writes JSON      ┌──────────────────────────┐
│  Worker A   │ ──────────────────►  │ scheduler/spawn-queue/   │
│  (any tier) │                      │ requests/*.json          │
└─────────────┘                      └──────────────────────────┘
                                                │
                                                │ every 2 min
                                                ▼
                                     ┌──────────────────────────┐
                                     │   spawn-processor cron   │
                                     │   (Haiku, controlled)    │
                                     └──────────────────────────┘
                                                │
                                                │ sessions_spawn()
                                                ▼
                                     ┌──────────────────────────┐
                                     │      New Sub-Agent       │
                                     │   (can also use queue)   │
                                     └──────────────────────────┘
```

## Chain Spawning Capability

This enables recursive spawning:
- Agent A spawns Agent B (via queue)
- Agent B can write to queue → spawns Agent C
- Agent C can write to queue → spawns Agent D
- ...and so on

**This is intentional and desired** (confirmed by Aaron 2026-02-24).

## File Locations

| Path | Purpose |
|------|---------|
| `scheduler/spawn-queue/requests/` | Pending spawn requests (JSON) |
| `scheduler/spawn-queue/responses/` | Completed/processed requests |
| `scheduler/spawn-queue/process-queue.sh` | Script that lists pending requests |
| `scheduler/spawn-queue/mark-done.sh` | Script to archive processed requests |

## Request Format

```json
{
  "label": "descriptive-label",
  "model": "claude-3-haiku-20240307",
  "task": "The task instructions for the spawned agent"
}
```

Or nested format:
```json
{
  "spawn": {
    "label": "...",
    "model": "...",
    "task": "..."
  }
}
```

## Safeguards (Current)

- **Choke point:** Only spawn-processor calls `sessions_spawn`
- **Observable:** Requests are files, can inspect queue anytime
- **Controlled model:** Processor runs as Haiku (won't improvise)
- **Batched:** 2-minute intervals, not instant

## Potential Future Safeguards (Not Yet Implemented)

- Spawn depth tracking in request metadata
- Chain depth limit (e.g., max 3-4 levels)
- Global spawn rate limit
- Spawn budget per originating task

## Cron Details

| Field | Value |
|-------|-------|
| **ID** | `600c34c1-fe21-438d-8f69-a92ceeb8342b` |
| **Schedule** | `*/2 * * * *` (every 2 min) |
| **Model** | `claude-3-haiku-20240307` |
| **Delivers to Slack** | No (silent unless it processes something) |

## Debugging Tips

1. **Check pending requests:**
   ```bash
   ls ~/clawd/scheduler/spawn-queue/requests/
   ```

2. **Check processed requests:**
   ```bash
   ls ~/clawd/scheduler/spawn-queue/responses/
   ```

3. **View processor output:**
   ```bash
   ~/clawd/scheduler/spawn-queue/process-queue.sh
   ```

4. **If spawns seem stuck:** Check if spawn-processor cron is enabled and running
