# Agent Inbox System

Two-way communication between agents without wasting tokens.

## How It Works

Each agent has an inbox folder. When they need to communicate:

1. **Write message** → Create JSON file in recipient's inbox
2. **Recipient checks inbox** → When they run (cron/spawned), they check their inbox
3. **Reply** → Write to original sender's inbox
4. **Cleanup** → Delete processed messages

## Structure

```
scheduler/inboxes/
├── person-manager/     # Person Manager's inbox
├── coordinator/        # Coordinator's inbox
├── task-managers/      # Task Managers' inbox
└── workers/            # Workers' inbox (shared, use task-id in filename)
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
  "conversationId": "optional-thread-id",
  "priority": "normal|urgent",
  "requiresResponse": true,
  "replyTo": "original-message-id (if this is a reply)"
}
```

## For Agents

### Check Your Inbox
```bash
ls ~/clawd/scheduler/inboxes/{your-inbox}/*.json 2>/dev/null
```

### Read a Message
```bash
cat ~/clawd/scheduler/inboxes/{your-inbox}/{message-file}
```

### Reply to a Message
```bash
cat > ~/clawd/scheduler/inboxes/{sender-inbox}/$(date +%s)-reply-{subject}.json << 'EOF'
{
  "id": "reply-unique-id",
  "timestamp": "ISO timestamp",
  "from": "your-id",
  "to": "original-sender",
  "subject": "Re: original-subject",
  "content": "Your reply content",
  "replyTo": "original-message-id"
}
EOF
```

### Delete Processed Message
```bash
rm ~/clawd/scheduler/inboxes/{your-inbox}/{message-file}
```

## Token Efficiency

- **No polling** — Agents only check inbox when they're already running
- **No spawning for messages** — Just write files
- **Batch processing** — Process all messages in one run
- **Cleanup** — Delete old messages to keep inboxes small

## Communication Patterns

### Manager → Worker (Task Assignment)
1. Manager spawns worker with task
2. Worker does work
3. Worker writes status/questions to manager's inbox
4. Manager checks inbox on next run, responds if needed

### Worker → Manager (Status Update / Question)
1. Worker writes to manager's inbox
2. Worker continues working (or waits if blocking)
3. Manager's cron picks up message, responds
4. Worker checks their inbox on next action

### Escalation
1. Worker writes urgent message to task-manager inbox
2. Task manager escalates to coordinator inbox
3. Coordinator escalates to person-manager inbox
