# Task 18: movement_100km_rand Pipeline

**Phase:** 2 (100km)
**Pipeline:** 18 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | movement_100km_rand |
| **Radius** | 100km |
| **Features** | Movement (5): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading |
| **Vehicle ID** | No |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/movement_100km_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmMovementRand.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/movement_100km_rand_${TIMESTAMP}.log"
echo "Starting movement_100km_rand at $(date)"
python production_configs_v2/Run100kmMovementRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 18/36: movement_100km_rand** complete
- Radius: 100km | Features: Movement (5) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
