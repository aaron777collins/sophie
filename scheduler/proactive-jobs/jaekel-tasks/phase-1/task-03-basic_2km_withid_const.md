# Task 03: basic_2km_withid_const Pipeline

**Phase:** 1 (2km)
**Pipeline:** 3 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_2km_withid_const |
| **Radius** | 2km |
| **Features** | Basic+ID (4): x_pos, y_pos, coreData_elevation, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/basic_2km_withid_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmBasicWithIdConst.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_2km_withid_const_${TIMESTAMP}.log"
echo "Starting basic_2km_withid_const at $(date)"
python production_configs_v2/Run2kmBasicWithIdConst.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Log Audit Steps

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
LOG=$(ls -t logs/basic_2km_withid_const_*.log 2>/dev/null | head -1)
[ -z "$LOG" ] && { echo "❌ No log file found!"; exit 1; }
echo "=== ERRORS ===" && grep -iE "error|exception|failed|traceback" "$LOG" | head -10 || echo "✅ No errors"
echo "=== ROW COUNTS ===" && grep -iE "rows|records|loaded|filtered" "$LOG" | tail -5
echo "=== ML RESULTS ===" && grep -iE "accuracy|precision|recall|f1" "$LOG" | tail -5
echo "=== RESULTS CHECK ===" && ls -la results/matrix/basic_2km_withid_const/ 2>/dev/null || echo "⚠️ Not found"
EOF
```

---

## Success Criteria

- [ ] Pipeline completes without errors
- [ ] Row counts: 5,000-20,000
- [ ] const_offset_per_id attack applied
- [ ] ML accuracy >70%
- [ ] Results in `results/matrix/basic_2km_withid_const/`

---

## Slack Update Template

```
✅ **Pipeline 3/36: basic_2km_withid_const** complete
- Radius: 2km | Features: Basic+ID (4) | Attack: const_offset_per_id
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
