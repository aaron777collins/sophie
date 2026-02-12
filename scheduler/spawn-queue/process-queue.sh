#!/bin/bash
# Spawn Queue Processor Script
# Prevents duplicate processing by moving files atomically

QUEUE_DIR="$HOME/clawd/scheduler/spawn-queue"
REQUESTS_DIR="$QUEUE_DIR/requests"
RESPONSES_DIR="$QUEUE_DIR/responses"
PROCESSING_DIR="$QUEUE_DIR/processing"
LOCKFILE="/tmp/spawn-queue-processor.lock"

# Create dirs if needed
mkdir -p "$PROCESSING_DIR"

# Exit if already running (prevent duplicate spawns)
if [ -f "$LOCKFILE" ]; then
    pid=$(cat "$LOCKFILE")
    if kill -0 "$pid" 2>/dev/null; then
        echo "Already running (pid $pid)"
        exit 0
    fi
fi
echo $$ > "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

# Check for pending requests
shopt -s nullglob
requests=("$REQUESTS_DIR"/*.json)

if [ ${#requests[@]} -eq 0 ]; then
    echo "NO_REQUESTS"
    exit 0
fi

# Output requests for the cron agent to process
echo "PENDING_REQUESTS:${#requests[@]}"
for req in "${requests[@]}"; do
    filename=$(basename "$req")
    # Move to processing (atomic - prevents double processing)
    if mv "$req" "$PROCESSING_DIR/$filename" 2>/dev/null; then
        echo "REQUEST:$filename"
        cat "$PROCESSING_DIR/$filename"
        echo "---END_REQUEST---"
    fi
done
