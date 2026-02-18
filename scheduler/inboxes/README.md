# Agent Inbox System

Two-way communication between agents without wasting tokens.

## How It Works

Each agent has an inbox folder. When they need to communicate:

1. **Write message** → Create JSON file in recipient's inbox
2. **Recipient checks inbox** → When they run (cron/spawned), they check their inbox
3. **Reply** → Write to original sender's inbox
4. **Archive** → Move processed messages to `archive/` subfolder (preserves history!)

## Structure

```
scheduler/inboxes/
├── person-manager/
│   ├── *.json          # Pending messages
│   └── archive/        # Processed messages (conversation history)
├── coordinator/
│   ├── *.json
│   └── archive/
├── task-managers/
│   ├── *.json
│   └── archive/
└── workers/
    ├── *.json
    └── archive/
```

## Message Format

Filename: `{timestamp}-{from}-{subject}.json`

```json
{
  "id": "unique-id",
  "timestamp": "ISO timestamp",
  "from": "sender-id",
  "to": "recipient-id", 
  "subject": "Brief subject",
  "content": "Full message content",
  "conversationId": "thread-id (optional)",
  "priority": "normal|urgent",
  "requiresResponse": true,
  "replyTo": "original-message-id (if this is a reply)"
}
```

## Conversation Threading

To maintain conversation context:

1. **First message** creates a `conversationId` (use timestamp or unique id)
2. **Replies** include same `conversationId` + `replyTo` field
3. **Archive keeps history** — can grep by conversationId to see full thread

Example thread:
```
archive/1707700000-worker-question.json     # conversationId: "conv-123"
archive/1707700100-coord-reply.json         # conversationId: "conv-123", replyTo: first msg
archive/1707700200-worker-followup.json     # conversationId: "conv-123", replyTo: reply
```

## For Agents: Processing Messages

### Check Inbox
```bash
ls ~/clawd/scheduler/inboxes/{your-inbox}/*.json 2>/dev/null
```

### Read & Reply
```bash
# Read the message
cat ~/clawd/scheduler/inboxes/{your-inbox}/{message-file}

# Write reply to sender's inbox
cat > ~/clawd/scheduler/inboxes/{sender-inbox}/$(date +%s)-{your-id}-reply.json << 'EOF'
{
  "id": "reply-id",
  "timestamp": "...",
  "from": "your-id",
  "to": "original-sender",
  "subject": "Re: original-subject",
  "content": "Your reply",
  "conversationId": "same-as-original",
  "replyTo": "original-message-id"
}
EOF

# ARCHIVE (don't delete!) the processed message
mv ~/clawd/scheduler/inboxes/{your-inbox}/{message-file} \
   ~/clawd/scheduler/inboxes/{your-inbox}/archive/
```

### View Conversation History
```bash
# See all messages in a conversation
grep -l "conv-123" ~/clawd/scheduler/inboxes/*/archive/*.json

# Or see recent messages with a specific agent
ls -lt ~/clawd/scheduler/inboxes/{inbox}/archive/ | head -20
```

## Token Efficiency

- **No polling** — Agents only check inbox when they're already running
- **No spawning for messages** — Just write files
- **Batch processing** — Process all messages in one run
- **Archive keeps history** — No data loss, enables context

## Cleanup (Optional)

To prevent archive bloat, periodically clean old messages:
```bash
# Delete archived messages older than 7 days
find ~/clawd/scheduler/inboxes/*/archive -name '*.json' -mtime +7 -delete
```
