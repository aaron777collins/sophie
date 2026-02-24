# Task 01: basic_2km_const Pipeline

**Phase:** 1 (2km)
**Pipeline:** 1 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_2km_const |
| **Radius** | 2km |
| **Features** | Basic (3): x_pos, y_pos, coreData_elevation |
| **Vehicle ID** | No |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/basic_2km_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmBasicConst.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Pre-Execution Checks

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Check config exists
test -f production_configs_v2/basic_2km_const_pipeline_config.json && echo "✅ Config exists" || echo "❌ Config missing"

# Check run script exists
test -f production_configs_v2/Run2kmBasicConst.py && echo "✅ Run script exists" || echo "❌ Run script missing"

# Check no existing process
pgrep -f "Run2kmBasicConst" && echo "⚠️ Process already running" || echo "✅ No existing process"

# Check memory
free -h | grep Mem
EOF
```

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate

# Create timestamped log file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_2km_const_${TIMESTAMP}.log"

echo "Starting basic_2km_const at $(date)"
echo "Log file: $LOG_FILE"

python production_configs_v2/Run2kmBasicConst.py 2>&1 | tee "$LOG_FILE"

echo "Completed at $(date)"
EOF
```

---

## Log Audit Steps

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
LOG=$(ls -t logs/basic_2km_const_*.log 2>/dev/null | head -1)

if [ -z "$LOG" ]; then
  echo "❌ No log file found!"
  exit 1
fi

echo "=========================================="
echo "LOG AUDIT: basic_2km_const"
echo "Log file: $LOG"
echo "=========================================="

echo ""
echo "=== ERRORS ==="
grep -iE "error|exception|failed|traceback" "$LOG" | head -10 || echo "✅ No errors found"

echo ""
echo "=== ROW COUNTS ==="
grep -iE "rows|records|loaded|filtered" "$LOG" | tail -5

echo ""
echo "=== ATTACK VERIFICATION ==="
grep -iE "attacker|malicious|isAttacker|attack.*applied|const_offset_per_id" "$LOG" | head -5

echo ""
echo "=== ML RESULTS ==="
grep -iE "accuracy|precision|recall|f1|score" "$LOG" | tail -5

echo ""
echo "=== COMPLETION STATUS ==="
grep -iE "complete|finished|done|success" "$LOG" | tail -3

echo ""
echo "=== RESULTS CHECK ==="
ls -la results/matrix/basic_2km_const/ 2>/dev/null || echo "⚠️ Results directory not found"
EOF
```

---

## Success Criteria

- [ ] Pipeline completes without errors
- [ ] Log shows no exceptions or tracebacks
- [ ] Row counts logged (expect 5,000-20,000)
- [ ] Attack verification shows const_offset_per_id applied
- [ ] ML accuracy logged (expect >70%)
- [ ] Results directory created: `results/matrix/basic_2km_const/`
- [ ] Completion message in log

---

## Slack Update Template

```
✅ **Pipeline 1/36: basic_2km_const** complete
- Radius: 2km | Features: Basic (3) | Attack: const_offset_per_id
- Rows processed: {ROW_COUNT}
- ML Accuracy: {ACCURACY}%
- Duration: {DURATION}
- Status: ✅ SUCCESS
```

---

## On Failure

```bash
# 1. Check the log for error details
ssh jaekel "tail -50 /home/ubuntu/repos/ConnectedDrivingPipelineV4/logs/basic_2km_const_*.log | grep -A5 -B5 error"

# 2. Kill orphan processes
ssh jaekel "pkill -f Run2kmBasicConst; pkill -f dask"

# 3. Clear partial cache if exists
ssh jaekel "rm -rf /home/ubuntu/repos/ConnectedDrivingPipelineV4/cache/matrix/basic_2km_const/"

# 4. Retry (max 3 attempts)
```

---

## Dependencies

- **Depends On:** Phase 0 Pre-Flight complete
- **Blocks:** None (can run independently within phase)
