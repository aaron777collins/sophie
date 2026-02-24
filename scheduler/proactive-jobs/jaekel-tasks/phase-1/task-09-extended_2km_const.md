# Task 09: extended_2km_const Pipeline

**Phase:** 1 (2km)
**Pipeline:** 9 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | extended_2km_const |
| **Radius** | 2km |
| **Features** | Extended (6): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_accelset_accelYaw |
| **Vehicle ID** | No |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/extended_2km_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmExtendedConst.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/extended_2km_const_${TIMESTAMP}.log"
echo "Starting extended_2km_const at $(date)"
python production_configs_v2/Run2kmExtendedConst.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 9/36: extended_2km_const** complete
- Radius: 2km | Features: Extended (6) | Attack: const_offset_per_id
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
