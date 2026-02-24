# Task 20: movement_100km_withid_rand Pipeline

**Phase:** 2 (100km)
**Pipeline:** 20 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | movement_100km_withid_rand |
| **Radius** | 100km |
| **Features** | Movement+ID (6): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/movement_100km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmMovementWithIdRand.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/movement_100km_withid_rand_${TIMESTAMP}.log"
echo "Starting movement_100km_withid_rand at $(date)"
python production_configs_v2/Run100kmMovementWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 20/36: movement_100km_withid_rand** complete
- Radius: 100km | Features: Movement+ID (6) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
