#!/bin/bash
# Check if PROACTIVE-JOBS.md has active tasks before triggering Haiku
# Run via system cron every 15 minutes instead of the Clawdbot cron

JOBS_FILE="$HOME/clawd/PROACTIVE-JOBS.md"
GATEWAY_PORT=18789
GATEWAY_TOKEN="0d06bec1b3a5d6863d861d3664e86097d0d01131577519b6"

# Extract Active Tasks section and check for actual tasks
active_section=$(sed -n '/^## Active Tasks/,/^## /p' "$JOBS_FILE" | head -n -1)

# Check if there's anything besides "(No active tasks)" or empty lines
if echo "$active_section" | grep -qE '^\s*###\s+\S+|^-\s+\*\*Type'; then
    echo "[$(date)] Active tasks found, triggering proactive-scheduler..."
    # Trigger the cron job via gateway API
    curl -s -X POST "http://127.0.0.1:${GATEWAY_PORT}/cron/run" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
        -d '{"jobId": "c60a003b-6a62-43bc-82f3-0b7941be8651"}'
    echo ""
else
    echo "[$(date)] No active tasks, skipping Haiku call"
fi
