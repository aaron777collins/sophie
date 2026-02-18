# Worker Spawn Template

> **USE THIS TEMPLATE** when spawning workers. Copy/paste and fill in blanks.
> Missing completion steps = stale tasks = blocked work!

```
You are sub-agent {TASK_ID} working on {PROJECT_NAME}.

## YOUR TASK
{ONE_SENTENCE_DESCRIPTION}

## BEFORE YOU START
1. Read ~/clawd/AGENTS.md (especially "As a Sub-Agent on a Proactive Task")
2. Read ~/clawd/scheduler/progress/{PARENT_ID}/_manager.md (if exists)
3. Read ~/clawd/scheduler/progress/{PARENT_ID}/{TASK_ID}.md (if exists)
4. Read ~/clawd/memory/projects/{PROJECT}/_overview.md

## REPO PATH
{FULL_PATH_TO_REPO}

## 🧪 TDD APPROACH (MANDATORY)
**Follow Test-Driven Development:**
1. Write tests FIRST (before implementation)
2. Run tests — they should FAIL (red)
3. Implement the feature
4. Run tests — they should PASS (green)
5. Refactor if needed (keep tests green)

## TESTS TO WRITE
{LIST_OF_TESTS_TO_CREATE}
- Unit tests: {test files}
- E2E tests (if UI): {playwright test files}

## WHAT TO BUILD
{EXPLICIT_LIST_OF_WHAT_TO_CREATE_OR_MODIFY}

## SUCCESS CRITERIA
{CHECKBOXES_OF_WHAT_DONE_LOOKS_LIKE}
- [ ] All unit tests pass: `pnpm test`
- [ ] All E2E tests pass: `pnpm test:e2e` (if applicable)
- [ ] Build passes: `pnpm build`

## ⚠️ WHEN DONE (CRITICAL — DO ALL OF THESE!)
1. Update scheduler/progress/{PARENT_ID}/{TASK_ID}.md with full work log
2. Update memory/projects/{PROJECT}/_overview.md
3. Git commit your changes
4. **🚨 UPDATE ~/clawd/PROACTIVE-JOBS.md:**
   - Change YOUR task's `Status: in-progress` → `Status: completed`
   - Add `Completed: YYYY-MM-DD HH:MM EST` field
   - THE SCHEDULER READS THIS TO START NEXT TASKS!
5. **DELETE your heartbeat:** `rm ~/clawd/scheduler/heartbeats/{TASK_ID}.json`
6. Send brief Slack notification: "✅ {TASK_ID} complete"

⚠️ IF YOU SKIP STEPS 4-5, THE WHOLE SYSTEM STALLS!

## IF YOU GET STUCK
Document what you tried, mark status as blocked, explain the issue.
```

---

## Quick Reference Checklist

Every worker MUST do before finishing:

- [ ] Progress file updated
- [ ] Memory updated
- [ ] Git committed
- [ ] **PROACTIVE-JOBS.md status → completed**
- [ ] **Heartbeat file DELETED**
- [ ] Slack notification sent
