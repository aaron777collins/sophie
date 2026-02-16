# PROACTIVE-JOBS.md — Task Manager Queue

> **Last Updated:** [timestamp]  
> **Updated By:** [who]

## Active Tasks

*Add tasks here for the Task Manager cron to pick up.*

### Example Task Format

```markdown
### task-id-here
- **Status:** pending | in-progress | claiming-complete | verified | complete
- **Started:** [timestamp if in-progress]
- **Priority:** HIGH | MEDIUM | LOW
- **Model:** claude-3-5-haiku-latest | claude-sonnet-4-20250514
- **Description:** What needs to be done
- **Parent Phase:** [if part of larger project]
- **Dependencies:** None | [list dependencies]

#### 📋 Acceptance Criteria (MANDATORY)
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2
- [ ] Build passes
- [ ] Tests pass

#### 🧪 Validation Steps (MANDATORY)
1. How to verify criterion 1
2. How to verify criterion 2
3. Run: `build command` — must exit 0
4. Run: `test command` — must pass
```

## Task Queue (Next Up)

| Task ID | Description | Priority | Model |
|---------|-------------|----------|-------|
| *empty* | *no pending tasks* | — | — |

## Worker Status

- **Max Slots:** 2
- **Current:** 0/2 occupied
- **Running:** none

## Notes

*Task Manager notes and logs*
