# Task 04: basic_2km_withid_rand Pipeline

**Phase:** 1 (2km)
**Pipeline:** 4 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_2km_withid_rand |
| **Radius** | 2km |
| **Features** | Basic+ID (4): x_pos, y_pos, coreData_elevation, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/basic_2km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmBasicWithIdRand.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_2km_withid_rand_${TIMESTAMP}.log"
echo "Starting basic_2km_withid_rand at $(date)"
python production_configs_v2/Run2kmBasicWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Log Audit & Success Criteria

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
LOG=$(ls -t logs/basic_2km_withid_rand_*.log 2>/dev/null | head -1)
[ -z "$LOG" ] && { echo "❌ No log file found!"; exit 1; }
grep -iE "error|exception|failed|traceback" "$LOG" | head -10 || echo "✅ No errors"
grep -iE "accuracy|precision|recall|f1" "$LOG" | tail -5
ls -la results/matrix/basic_2km_withid_rand/ 2>/dev/null || echo "⚠️ Results not found"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 4/36: basic_2km_withid_rand** complete
- Radius: 2km | Features: Basic+ID (4) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
