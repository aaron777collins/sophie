#!/bin/bash
# Mark a spawn request as done
# Usage: mark-done.sh <filename> <status> <sessionKey>

QUEUE_DIR="$HOME/clawd/scheduler/spawn-queue"
PROCESSING_DIR="$QUEUE_DIR/processing"
RESPONSES_DIR="$QUEUE_DIR/responses"

filename="$1"
status="${2:-spawned}"
sessionKey="$3"

if [ -z "$filename" ]; then
    echo "Usage: mark-done.sh <filename> [status] [sessionKey]"
    exit 1
fi

# Get requestId from filename (minus .json)
requestId="${filename%.json}"

# Create response
cat > "$RESPONSES_DIR/$filename" << EOF
{
  "requestId": "$requestId",
  "processedAt": "$(date -Iseconds)",
  "status": "$status",
  "sessionKey": "$sessionKey"
}
EOF

# Remove from processing
rm -f "$PROCESSING_DIR/$filename"

echo "Done: $requestId -> $status"
