# Health Check Protocol — ALL AGENTS MUST RUN FIRST

> **This is MANDATORY. Run these checks BEFORE any work.**
> **If ANY check fails, follow the recovery procedure. Do NOT proceed with broken infrastructure.**

---

## ⚡ Quick Health Check (Run Every Session Start)

```bash
#!/bin/bash
# Copy-paste this entire block to verify system health

echo "=== BEADS HEALTH CHECK ==="
if bd list --json >/dev/null 2>&1; then
    echo "✅ Beads: WORKING"
else
    echo "❌ Beads: FAILED - see recovery below"
    exit 1
fi

echo "=== DOLT SERVER CHECK ==="
if pgrep -f "dolt sql-server" >/dev/null; then
    echo "✅ Dolt Server: RUNNING"
else
    echo "❌ Dolt Server: NOT RUNNING - starting..."
    cd ~/.beads/dolt 2>/dev/null || cd ~/clawd/.beads/dolt
    nohup dolt sql-server --host 127.0.0.1 --port 3307 > /tmp/dolt.log 2>&1 &
    sleep 2
    if pgrep -f "dolt sql-server" >/dev/null; then
        echo "✅ Dolt Server: STARTED"
    else
        echo "❌ Dolt Server: FAILED TO START - escalate P0"
        exit 1
    fi
fi

echo "=== GIT STATUS ==="
cd ~/clawd
if git status --porcelain | grep -q .; then
    echo "⚠️ Git: Uncommitted changes present"
else
    echo "✅ Git: Clean"
fi

echo "=== BEADS STALE CHECK ==="
STALE=$(bd list --all --json 2>/dev/null | jq '[.[] | select(.status == "in_progress")] | length')
if [ "$STALE" -gt 0 ]; then
    echo "⚠️ Beads: $STALE issues in_progress (check for stalled work)"
else
    echo "✅ Beads: No stalled in_progress issues"
fi

echo ""
echo "=== HEALTH CHECK COMPLETE ==="
```

---

## 🔧 Recovery Procedures

### Problem: Beads Commands Fail

**Symptoms:** `bd list` returns error, "database locked", connection refused

**Recovery Steps:**
```bash
# Step 1: Check for stale locks
bd doctor --fix --yes

# Step 2: Restart Dolt server
pkill -f "dolt sql-server" 2>/dev/null
sleep 1
cd ~/clawd/.beads/dolt
nohup dolt sql-server --host 127.0.0.1 --port 3307 > /tmp/dolt.log 2>&1 &
sleep 2

# Step 3: Verify
bd list --json
```

**If still failing:** Escalate as P0-CRITICAL to Person Manager inbox.

---

### Problem: Dolt Server Not Running

**Symptoms:** Port 3307 not listening, beads commands timeout

**Recovery Steps:**
```bash
# Check if running
pgrep -a dolt

# If not running, start it
cd ~/clawd/.beads/dolt
nohup dolt sql-server --host 127.0.0.1 --port 3307 > /tmp/dolt.log 2>&1 &

# Verify
sleep 2 && bd list --json | head -5
```

---

### Problem: JSONL Out of Sync

**Symptoms:** Git shows `.beads/issues.jsonl` as changed but shouldn't be

**Recovery Steps:**
```bash
# Re-export JSONL
bd list --all --json > ~/clawd/.beads/issues.jsonl

# Commit the sync
cd ~/clawd
git add .beads/issues.jsonl
git commit -m "sync: beads JSONL export"
```

---

### Problem: Beads Stuck in Wrong State

**Symptoms:** Bead shows `in_progress` but no one is working on it

**Recovery Steps:**
```bash
# Find stale beads (not updated in 24+ hours)
bd list --status in_progress --json | jq '.[] | select(.updated_at < (now - 86400 | todate))'

# Option 1: Reassign to open
bd update {bead-id} --status open --notes "Reassigned: stale for 24h+"

# Option 2: If work was done, request validation
bd update {bead-id} --status needs-validation --notes "Recovered from stale state"
```

---

### Problem: Git Push Fails

**Symptoms:** Push rejected, remote has changes

**Recovery Steps:**
```bash
# Pull with rebase
git pull --rebase origin master

# If conflicts
git status  # See conflicted files
# Fix conflicts manually
git add .
git rebase --continue

# Push
git push
```

---

## 📊 Stale Bead Detection

**Run this to find work that may be stuck:**

```bash
# Issues in_progress for more than 8 hours
bd list --status in_progress --json | jq -r '.[] | "\(.id): \(.title) (updated: \(.updated_at))"'

# Issues blocked without clear blocker
bd list --status blocked --json | jq -r '.[] | "\(.id): \(.title) - blocked by: \(.dependencies // "unknown")"'

# Issues needs-validation for more than 4 hours
bd list --status needs-validation --json | jq -r '.[] | "\(.id): \(.title) (updated: \(.updated_at))"'
```

---

## 🚨 Escalation Matrix

| Problem | Severity | Who Handles | Response Time |
|---------|----------|-------------|---------------|
| Dolt server down | P0-CRITICAL | Person Manager | Immediate |
| Beads commands fail | P0-CRITICAL | Person Manager | Immediate |
| Bead stale >24h | P1-HIGH | Coordinator | Within 4h |
| JSONL out of sync | P2-MEDIUM | Any agent | Within 8h |
| Git push fails | P2-MEDIUM | Any agent | Within 8h |
| Missing screenshots | P3-LOW | Worker | Before validation |

---

## ✅ Pre-Flight Checklist (Before ANY Work)

Every agent session must verify:

- [ ] `bd list --json` returns data (not error)
- [ ] Dolt server process is running
- [ ] Git working tree is clean (or changes are intentional)
- [ ] No beads stuck in `in_progress` > 8 hours
- [ ] You have a bead ID for your work (or will create one)

**If any check fails → Fix it or escalate. Do NOT proceed with broken infrastructure.**

---

## 🔄 Continuous Monitoring (Cron Jobs)

The following should run periodically:

### Every 15 minutes (Task Managers)
```bash
# Health check
bd doctor 2>&1 | grep -E "(error|warning)" && echo "ALERT: Beads health issue"
```

### Every 30 minutes (Coordinator/Validator)
```bash
# Stale bead check
STALE=$(bd list --status in_progress --json | jq '[.[] | select(.updated_at < (now - 28800 | todate))] | length')
[ "$STALE" -gt 0 ] && echo "ALERT: $STALE beads stale >8h"
```

### Every 4 hours (Person Manager)
```bash
# System health report
bd status
bd doctor
git status --short
```

---

**Remember:** A healthy infrastructure is the foundation. Don't build on broken ground.
