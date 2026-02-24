# Task 08: movement_2km_withid_rand Pipeline

**Phase:** 1 (2km)
**Pipeline:** 8 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | movement_2km_withid_rand |
| **Radius** | 2km |
| **Features** | Movement+ID (6): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/movement_2km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmMovementWithIdRand.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/movement_2km_withid_rand_${TIMESTAMP}.log"
echo "Starting movement_2km_withid_rand at $(date)"
python production_configs_v2/Run2kmMovementWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 8/36: movement_2km_withid_rand** complete
- Radius: 2km | Features: Movement+ID (6) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
