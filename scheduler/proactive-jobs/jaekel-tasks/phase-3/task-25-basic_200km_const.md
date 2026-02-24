# Task 25: basic_200km_const Pipeline

**Phase:** 3 (200km)
**Pipeline:** 25 of 36
**Estimated Time:** 15-30 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_200km_const |
| **Radius** | 200km |
| **Features** | Basic (3): x_pos, y_pos, coreData_elevation |
| **Vehicle ID** | No |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/basic_200km_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run200kmBasicConst.py |
| **Expected Rows** | ~5,000,000-15,000,000 |
| **Memory** | 20-40GB |

---

## Pre-Execution Checks (CRITICAL for 200km)

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
echo "=== MEMORY CHECK (need >40GB free) ==="
free -h
echo ""
echo "=== DISK CHECK (need >100GB free) ==="
df -h /home/ubuntu
echo ""
echo "=== PROCESS CHECK ==="
pgrep -fa "dask|Run200km" || echo "✅ No conflicting processes"
EOF
```

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_200km_const_${TIMESTAMP}.log"
echo "Starting basic_200km_const at $(date)"
python production_configs_v2/Run200kmBasicConst.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Log Audit Steps

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
LOG=$(ls -t logs/basic_200km_const_*.log 2>/dev/null | head -1)
[ -z "$LOG" ] && { echo "❌ No log file found!"; exit 1; }
echo "=== ERRORS (esp OOM) ===" && grep -iE "error|exception|failed|traceback|oom|memory|killed" "$LOG" | head -10 || echo "✅ No errors"
echo "=== ROW COUNTS ===" && grep -iE "rows|records|loaded|filtered" "$LOG" | tail -5
echo "=== ML RESULTS ===" && grep -iE "accuracy|precision|recall|f1" "$LOG" | tail -5
echo "=== RESULTS CHECK ===" && ls -la results/matrix/basic_200km_const/ 2>/dev/null || echo "⚠️ Results not found"
EOF
```

---

## Success Criteria

- [ ] Pipeline completes without OOM/killed
- [ ] Row counts: 5,000,000-15,000,000
- [ ] Memory stayed below 62GB limit
- [ ] Results in `results/matrix/basic_200km_const/`

---

## Slack Update Template

```
✅ **Pipeline 25/36: basic_200km_const** complete
- Radius: 200km | Features: Basic (3) | Attack: const_offset_per_id
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```

---

## On OOM Failure

```bash
# 1. Kill processes
ssh jaekel "pkill -f Run200kmBasicConst; pkill -f dask"

# 2. Drop caches
ssh jaekel "sync && echo 3 | sudo tee /proc/sys/vm/drop_caches"

# 3. Edit config: n_workers: 1, memory_limit: 16GB

# 4. Retry with reduced config
```
