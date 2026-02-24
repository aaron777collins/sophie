# Task 21: extended_100km_const Pipeline

**Phase:** 2 (100km)
**Pipeline:** 21 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | extended_100km_const |
| **Radius** | 100km |
| **Features** | Extended (6): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_accelset_accelYaw |
| **Vehicle ID** | No |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/extended_100km_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmExtendedConst.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/extended_100km_const_${TIMESTAMP}.log"
echo "Starting extended_100km_const at $(date)"
python production_configs_v2/Run100kmExtendedConst.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 21/36: extended_100km_const** complete
- Radius: 100km | Features: Extended (6) | Attack: const_offset_per_id
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
