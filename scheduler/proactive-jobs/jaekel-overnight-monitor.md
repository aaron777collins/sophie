# Jaekel Pipeline Overnight Monitor

**Purpose:** Autonomously monitor and fix pipeline execution overnight
**Schedule:** Every 15 minutes
**Priority:** High
**Model:** Sonnet (escalate to Opus for complex issues)

## Tasks

### 1. Check Pipeline Progress
```bash
ssh jaekel 'python3 -c "
import json
with open(\"/home/ubuntu/.pipeline-queue/state.json\") as f:
    d = json.load(f)
j = d.get(\"current_job\", {})
h = [x for x in d.get(\"history\", []) if x[\"id\"].startswith(\"20260224\")]
s = [x for x in h if x.get(\"exit_code\") == 0]
f = [x for x in h if x.get(\"exit_code\") != 0]
print(f\"Progress: {len(h)}/36 ({len(s)} success, {len(f)} failed)\")
print(f\"Current: {j.get(\"pipeline\", \"none\")} [{j.get(\"status\", \"?\")}]\")
"'
```

### 2. Audit for Row Count Consistency
All 2km pipelines should have ~264K rows
All 100km pipelines should have consistent rows
All 200km pipelines should have consistent rows

Check logs for "Total rows" and verify consistency.

### 3. Check for Errors
```bash
ssh jaekel "grep -r 'Error\|Exception\|Traceback' /var/www/static/pipeline-results/20260224_*/*/pipeline.log 2>/dev/null | tail -20"
```

### 4. Verify Daemon Health
```bash
ssh jaekel "pgrep -af daemon_v2 && ps aux | grep 'Run.*km' | grep python | head -3"
```

### 5. Actions on Issues

**If daemon not running:**
```bash
ssh jaekel 'cd ~/.pipeline-queue && nohup python3 daemon_v2.py > daemon.log 2>&1 &'
```

**If row count mismatch detected:**
1. Stop daemon
2. Clear cache for affected pipeline
3. Re-queue that pipeline
4. Restart daemon

**If too many failures (>3):**
1. Stop daemon
2. Audit logs thoroughly
3. Fix root cause
4. Clear affected caches
5. Reset queue
6. Restart

### 6. Completion Check
When 36/36 complete:
1. Generate summary report
2. Clear intermediate caches (keep only source data)
3. Notify in Slack
4. Archive logs

## Notes Log
- [2026-02-24 00:00 EST] Created overnight monitor
- Check results at: http://65.108.237.46/dashboard/
