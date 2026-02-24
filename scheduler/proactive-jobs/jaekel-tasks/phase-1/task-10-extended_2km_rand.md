# Task 10: extended_2km_rand Pipeline

**Phase:** 1 (2km)
**Pipeline:** 10 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | extended_2km_rand |
| **Radius** | 2km |
| **Features** | Extended (6): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_accelset_accelYaw |
| **Vehicle ID** | No |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/extended_2km_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmExtendedRand.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/extended_2km_rand_${TIMESTAMP}.log"
echo "Starting extended_2km_rand at $(date)"
python production_configs_v2/Run2kmExtendedRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 10/36: extended_2km_rand** complete
- Radius: 2km | Features: Extended (6) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
