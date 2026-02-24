# Task 13: basic_100km_const Pipeline

**Phase:** 2 (100km)
**Pipeline:** 13 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_100km_const |
| **Radius** | 100km |
| **Features** | Basic (3): x_pos, y_pos, coreData_elevation |
| **Vehicle ID** | No |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/basic_100km_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmBasicConst.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Pre-Execution Checks

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
# Memory check - critical for 100km
echo "=== MEMORY CHECK ==="
free -h
# Need >15GB free
EOF
```

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_100km_const_${TIMESTAMP}.log"
echo "Starting basic_100km_const at $(date)"
python production_configs_v2/Run100kmBasicConst.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Log Audit Steps

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
LOG=$(ls -t logs/basic_100km_const_*.log 2>/dev/null | head -1)
[ -z "$LOG" ] && { echo "❌ No log file found!"; exit 1; }
echo "=== ERRORS ===" && grep -iE "error|exception|failed|traceback|oom|memory" "$LOG" | head -10 || echo "✅ No errors"
echo "=== ROW COUNTS ===" && grep -iE "rows|records|loaded|filtered" "$LOG" | tail -5
echo "=== ML RESULTS ===" && grep -iE "accuracy|precision|recall|f1" "$LOG" | tail -5
echo "=== RESULTS CHECK ===" && ls -la results/matrix/basic_100km_const/ 2>/dev/null || echo "⚠️ Results not found"
EOF
```

---

## Success Criteria

- [ ] Pipeline completes without OOM errors
- [ ] Row counts: 500,000-2,000,000
- [ ] Memory usage stayed below 50GB
- [ ] ML accuracy >65%
- [ ] Results in `results/matrix/basic_100km_const/`

---

## Slack Update Template

```
✅ **Pipeline 13/36: basic_100km_const** complete
- Radius: 100km | Features: Basic (3) | Attack: const_offset_per_id
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```

---

## On OOM Failure

```bash
# 1. Kill failed processes
ssh jaekel "pkill -f Run100kmBasicConst; pkill -f dask"

# 2. Clear memory
ssh jaekel "sync && echo 3 | sudo tee /proc/sys/vm/drop_caches"

# 3. Reduce workers in config to n_workers: 1, memory_limit: 16GB

# 4. Retry
```
