# Spawn Queue

Sub-agents can request spawns by writing files here. The gateway processes them.

## Request Format

Create a file: `requests/{requester}-{timestamp}.json`

```json
{
  "requestId": "unique-id",
  "requestedBy": "task-id or agent-name",
  "requestedAt": "ISO timestamp",
  "spawn": {
    "label": "descriptive-label",
    "model": "anthropic/claude-3-5-haiku-latest",
    "task": "Your task prompt here"
  }
}
```

## Processing

The spawn queue processor:
1. Reads pending requests from `requests/`
2. Spawns the requested sessions
3. Moves processed requests to `archive/`
4. Writes results to `results/`
