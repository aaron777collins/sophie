# Task 06: movement_2km_rand Pipeline

**Phase:** 1 (2km)
**Pipeline:** 6 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | movement_2km_rand |
| **Radius** | 2km |
| **Features** | Movement (5): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading |
| **Vehicle ID** | No |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/movement_2km_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmMovementRand.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/movement_2km_rand_${TIMESTAMP}.log"
echo "Starting movement_2km_rand at $(date)"
python production_configs_v2/Run2kmMovementRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Log Audit & Success Criteria

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
LOG=$(ls -t logs/movement_2km_rand_*.log 2>/dev/null | head -1)
[ -z "$LOG" ] && { echo "❌ No log file found!"; exit 1; }
grep -iE "error|exception|failed|traceback" "$LOG" | head -10 || echo "✅ No errors"
grep -iE "accuracy|precision|recall|f1" "$LOG" | tail -5
ls -la results/matrix/movement_2km_rand/ 2>/dev/null || echo "⚠️ Results not found"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 6/36: movement_2km_rand** complete
- Radius: 2km | Features: Movement (5) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
