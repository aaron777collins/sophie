# Task 30: movement_200km_rand Pipeline

**Phase:** 3 (200km)
**Pipeline:** 30 of 36
**Estimated Time:** 15-30 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | movement_200km_rand |
| **Radius** | 200km |
| **Features** | Movement (5): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading |
| **Vehicle ID** | No |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/movement_200km_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run200kmMovementRand.py |
| **Expected Rows** | ~5,000,000-15,000,000 |
| **Memory** | 20-40GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/movement_200km_rand_${TIMESTAMP}.log"
echo "Starting movement_200km_rand at $(date)"
python production_configs_v2/Run200kmMovementRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 30/36: movement_200km_rand** complete
- Radius: 200km | Features: Movement (5) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
