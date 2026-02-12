# Spawn Queue

This directory enables sub-agents to spawn other sub-agents via a queue system.

## How It Works

Since `sessions_spawn` is not available to sub-agents, they can request spawns by:

1. Writing a JSON file to `requests/`
2. The Spawn Processor cron (every 2 min) processes requests
3. Responses are written to `responses/`
4. Sub-agents poll `responses/` for results

## Request Format

Create a file: `requests/{unique-id}.json`

**Format A (nested spawn object):**
```json
{
  "requestId": "unique-id",
  "requestedBy": "parent-task-id",
  "requestedAt": "ISO timestamp",
  "spawn": {
    "label": "child-task-id",
    "model": "anthropic/claude-3-5-haiku-latest",
    "task": "Your task instructions here..."
  }
}
```

**Format B (flat - also accepted):**
```json
{
  "requestId": "unique-id",
  "requestedBy": "parent-task-id",
  "timestamp": "ISO timestamp",
  "label": "child-task-id",
  "model": "anthropic/claude-3-5-haiku-latest",
  "task": "Your task instructions here..."
}
```

Note: `requestId` can be inferred from filename if missing.

## Response Format

Response written to: `responses/{unique-id}.json`

```json
{
  "requestId": "unique-id",
  "processedAt": "ISO timestamp",
  "status": "spawned" | "completed" | "error",
  "sessionKey": "agent:main:subagent:...",
  "result": "... (if waitForResult was true)",
  "error": "... (if status is error)"
}
```

## For Sub-Agents

### To spawn a child:

```bash
# Create request
cat > ~/clawd/scheduler/spawn-queue/requests/my-request-123.json << 'EOF'
{
  "requestId": "my-request-123",
  "requestedBy": "my-task-id",
  "requestedAt": "2026-02-12T07:00:00Z",
  "spawn": {
    "label": "my-child-task",
    "model": "anthropic/claude-3-5-haiku-latest",
    "task": "Read ~/clawd/scheduler/workers/IDENTITY.md. Then do: [your instructions]"
  }
}
EOF
```

### To check for response:

```bash
# Poll for response (may take up to 2 minutes)
cat ~/clawd/scheduler/spawn-queue/responses/my-request-123.json 2>/dev/null || echo "Not yet processed"
```

## Processor Cron

The Spawn Processor cron runs every 2 minutes and:
1. Lists all files in `requests/`
2. For each request, calls `sessions_spawn`
3. Writes response to `responses/`
4. Deletes the request file

Responses are kept for 1 hour, then cleaned up.
