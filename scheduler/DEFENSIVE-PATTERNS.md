# Defensive Patterns — Robust Agent Behavior

> **Goal:** No brittle systems. Handle ALL contingencies defensively.

---

## 🛡️ Core Defensive Principles

### 1. Fail Fast, Recover Gracefully
- Check preconditions BEFORE starting work
- If something is broken, stop and fix it immediately
- Never proceed with partial/broken state

### 2. Never Assume — Always Verify
```bash
# ❌ BAD: Assume file exists
cat file.txt

# ✅ GOOD: Check first
[ -f file.txt ] && cat file.txt || echo "ERROR: file.txt not found"
```

### 3. Log Everything Important
```bash
# ❌ BAD: Silent operation
bd update $BEAD_ID --status in_progress

# ✅ GOOD: Log with context
echo "[$(date)] Claiming bead $BEAD_ID" >> /tmp/agent-actions.log
bd update $BEAD_ID --status in_progress --json || {
    echo "[$(date)] FAILED to claim bead $BEAD_ID" >> /tmp/agent-actions.log
    exit 1
}
```

### 4. Timeout Long Operations
```bash
# ❌ BAD: Could hang forever
npm test

# ✅ GOOD: Timeout with clear failure
timeout 300 npm test || echo "ERROR: Tests timed out after 5 minutes"
```

---

## 📋 Defensive Checklist by Role

### Workers

**Before Starting:**
- [ ] Health check passed (see HEALTH-CHECK.md)
- [ ] Have a bead ID assigned
- [ ] Bead is in `open` or assigned to me
- [ ] Acceptance criteria are clear
- [ ] All dependencies are available (code, APIs, credentials)

**During Work:**
- [ ] Commit frequently (don't lose work)
- [ ] Update bead notes with progress
- [ ] If blocked > 30 min, escalate immediately
- [ ] If scope changes, update bead description

**Before Claiming Done:**
- [ ] ALL tests pass (unit + integration + E2E)
- [ ] Screenshots at ALL viewports (desktop/tablet/mobile)
- [ ] Evidence attached to bead notes
- [ ] Visual quality self-check passed
- [ ] Code committed and pushed

**Error Handling:**
```bash
# If tests fail
bd update $BEAD_ID --notes "Tests failing: [details]. Working on fix."

# If blocked by external dependency
bd update $BEAD_ID --status blocked --notes "Blocked by: [what]. Need: [what]."
bd create "BLOCKER: [description]" -t bug -p 1

# If scope is too large
bd update $BEAD_ID --notes "Scope larger than estimated. Breaking into sub-tasks."
bd create "$BEAD_ID.1 Sub-task: [description]" -t task -p 2
```

---

### Coordinators

**Before Assigning Work:**
- [ ] Health check passed
- [ ] Story has clear acceptance criteria
- [ ] Dependencies are mapped
- [ ] Worker capacity is available
- [ ] Bead exists for the work

**When Receiving Validation Requests:**
- [ ] Evidence is present (not just claims)
- [ ] Screenshots exist for ALL viewports
- [ ] Test output is actual, not fabricated
- [ ] Commits exist (verify with `git log`)

**Error Handling:**
```bash
# If worker claims done but no evidence
bd update $BEAD_ID --status open --notes "REJECTED: Missing evidence. Need: [specifics]"

# If validation repeatedly fails
bd update $BEAD_ID --priority 0 --notes "ESCALATION: 2+ failures. Review needed."
# Create escalation bead
bd create "ESCALATION: Repeated failures on $BEAD_ID" -t bug -p 0

# If worker is stuck
# Spawn a DIFFERENT worker to help
bd create "$BEAD_ID.HELP Task: Unblock [original task]" -t task -p 1
```

---

### Validators

**Before Validating:**
- [ ] Health check passed
- [ ] Bead is in `needs-validation` status
- [ ] User story exists with acceptance criteria
- [ ] Evidence is present in bead notes

**During Validation:**
- [ ] RUN tests yourself (don't trust worker output)
- [ ] CHECK screenshots exist at all viewports
- [ ] VERIFY commits exist
- [ ] TEST the actual feature (not just read about it)

**Validation Outcomes:**
```bash
# PASS - All criteria met
bd close $BEAD_ID --reason "VALIDATED: All ACs passed. Evidence: [links]"

# FAIL - Clear issues
bd update $BEAD_ID --status needs-fix --notes "FAILED: [AC X] not met. Issue: [detail]. Fix: [suggestion]"

# BLOCKED - Can't validate
bd update $BEAD_ID --status blocked --notes "VALIDATION BLOCKED: [reason]"
bd create "BLOCKER: [description]" -t bug -p 1
```

---

### Story Architects

**Before Creating Stories:**
- [ ] Epic exists and is clear
- [ ] Requirements are understood
- [ ] Technical constraints are known

**Story Creation:**
```bash
# Create with full context
bd create "US-001: As a [user], I want [feature] so that [benefit]" \
  -t story -p 1 \
  --description "## Acceptance Criteria
  
Given [context]
When [action]
Then [outcome]

## Technical Notes
- Dependencies: [list]
- Risks: [list]
- Estimated complexity: [S/M/L]"

# Link to epic
bd dep add $STORY_ID $EPIC_ID --type parent
```

---

### Person Managers

**Strategic Checks:**
- [ ] Health check passed
- [ ] No P0/P1 issues unaddressed
- [ ] Progress is being made (beads moving through states)
- [ ] No systemic failures (repeated rejections)

**Monitoring:**
```bash
# Check for systemic issues
bd list --all --json | jq '[.[] | select(.status == "needs-fix")] | length'
# If > 3, investigate pattern

# Check for stalled work
bd list --status in_progress --json | jq '[.[] | select(.updated_at < (now - 86400 | todate))]'
# If any results, escalate
```

---

## 🚨 Common Failure Modes & Defenses

| Failure Mode | Detection | Defense |
|--------------|-----------|---------|
| **Work done without bead** | Missing ID in reports | REJECT - all work must have bead |
| **Fake evidence** | Verify files/commits exist | `ls`, `git log`, `git show` to confirm |
| **Tests not actually run** | Output missing or generic | Require specific output with timestamps |
| **Screenshots missing** | `ls scheduler/validation/screenshots/` | Auto-reject if directory empty |
| **Scope creep** | Bead description changes mid-work | Require new beads for new scope |
| **Stalled work** | `updated_at` > 24h ago | Auto-escalate to Coordinator |
| **Infrastructure down** | Health check fails | Stop all work, fix infrastructure |
| **Lost work** | No commits for hours | Require frequent commits |

---

## 🔄 Recovery Patterns

### Pattern: Graceful Degradation
```bash
# Try primary method, fall back to alternative
if ! bd list --json 2>/dev/null; then
    echo "WARNING: Beads unavailable, using local tracking temporarily"
    echo "$(date): [work description]" >> /tmp/work-backup.log
    # Create bead when service recovers
fi
```

### Pattern: Retry with Backoff
```bash
# For flaky operations
for i in 1 2 3; do
    bd update $BEAD_ID --claim && break
    echo "Retry $i failed, waiting..."
    sleep $((i * 2))
done
```

### Pattern: Atomic Operations
```bash
# Either all succeed or none
git add . && git commit -m "message" && git push || {
    echo "Failed - rolling back"
    git reset --soft HEAD~1
    exit 1
}
```

---

## ✅ The Golden Rules

1. **Infrastructure first** — No work on broken foundation
2. **Track everything** — If it's not in beads, it didn't happen
3. **Verify, don't trust** — Check files, commits, outputs yourself
4. **Fail loudly** — Silent failures are the worst kind
5. **Escalate early** — Stuck > 30 min? Tell someone
6. **Document decisions** — Future you will thank you
7. **Test your tests** — Make sure tests actually test things
8. **Screenshots prove it** — Visual evidence can't lie (easily)

---

**Remember:** Robust systems aren't perfect — they handle imperfection gracefully.
