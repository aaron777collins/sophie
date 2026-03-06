# Person Manager Heartbeat (Nightly at 2am)

> **Purpose:** Strategic review, self-reflection, hiring analysis, epic management
> **Model:** Opus
> **Frequency:** Nightly (2am EST)

---

## Nightly Reflection Duties

### 1. Review the Day's Progress

```bash
# Check what was completed today
bd list --status closed --json | grep "$(date +%Y-%m-%d)"

# Check current state
bd list --json | jq 'group_by(.status) | map({status: .[0].status, count: length})'
```

**Reflect on:**
- What got done?
- What didn't get done? Why?
- Any patterns in failures?
- Validation pass/fail rates?

### 2. Check Specialist Performance

Review Auditor reports: `scheduler/specialists/auditor/reports/`

**Questions to answer:**
- Any specialist consistently failing validation?
- Any hallucination patterns detected?
- Who's struggling? Why?

### 3. Hiring Analysis (Gap Assessment)

**Ask yourself:**
- Are current specialists sufficient for the work?
- Is there work that doesn't fit any specialist?
- Would a new role help? (e.g., Database Specialist, Security Specialist)

**If new role needed:**
1. Research what skills that role needs
2. Create IDENTITY.md in `scheduler/specialists/{new-role}/`
3. Update TASK-ROUTING.md with new label
4. Note in daily log

### 4. Resource Balancing

```bash
# Check workload distribution
bd list --status in_progress --json | jq 'group_by(.labels) | map({label: .[0].labels, count: length})'
```

**Questions:**
- Is one specialist overloaded?
- Are tasks sitting in one queue too long?
- Should we redistribute or parallelize?

### 5. Strategic Review

**Review priorities:**
- Read PROACTIVE-JOBS.md
- Are we working on the right things?
- Any priorities changed?
- Any projects stalled that need intervention?

### 6. Create/Update Epics

If new work direction identified:
1. Create epic in beads
2. Break into stories (or note for Story Architect)
3. Update PROACTIVE-JOBS.md

### 7. Coaching Notes

If specialist struggling:
1. Document the issue
2. Note coaching approach
3. Update specialist's notes with guidance
4. Consider spawning Opus for complex guidance

---

## Output: Nightly Report

Write to: `scheduler/person-manager/notes/nightly/{date}.md`

```markdown
# PM Nightly Report - {date}

## Day Summary
- Tasks completed: X
- Tasks failed validation: Y
- Validation pass rate: Z%

## Specialist Performance
| Specialist | Completed | Failed | Notes |
|------------|-----------|--------|-------|
| Phoenix    | 3         | 1      | CSS issues |
| Atlas      | 2         | 0      | Solid work |
| ...        | ...       | ...    | ...   |

## Hallucination/Quality Issues
- {any issues from Auditor}

## Hiring Assessment
- Current coverage: {adequate/gaps}
- Recommendation: {none/consider X}

## Resource Notes
- {any rebalancing needed}

## Strategic Items
- {priority changes}
- {stalled projects}

## Tomorrow's Focus
1. {priority 1}
2. {priority 2}
3. {priority 3}
```

---

## Escalation Triggers

Notify Aaron immediately if:
- Validation pass rate < 50% over 3 days
- Same task fails validation 5+ times
- Hallucination pattern detected (Auditor flag)
- Critical blocker with no resolution path
- Resource shortage affecting P0 work

---

## If Nothing Notable

Write minimal report, note "Steady progress, no issues."

Reply: HEARTBEAT_OK
