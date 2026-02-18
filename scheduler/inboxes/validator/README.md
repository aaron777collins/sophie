# Validator Inbox

Validation requests from Coordinator and Task Managers go here.

## Message Types

### validation-request
Request to validate completed work.

```json
{
  "id": "val-req-TIMESTAMP",
  "timestamp": "ISO",
  "from": "coordinator",
  "to": "validator",
  "type": "validation-request",
  "subject": "Validate: {task-id or batch}",
  "content": {
    "task_ids": ["p1-2-a", "p1-2-b"],
    "project": "project-name",
    "phase": "Phase N",
    "claimed_by": "coordinator",
    "claimed_at": "ISO timestamp",
    "files_changed": ["path/to/file.ts"],
    "acceptance_criteria": [
      "Criterion 1",
      "Criterion 2"
    ]
  }
}
```

## Processing

1. Validator reads requests from this directory
2. Validates work independently
3. Sends results to `scheduler/inboxes/coordinator/`
4. Archives processed messages to `archive/`
