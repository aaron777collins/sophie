# Task 32: movement_200km_withid_rand Pipeline

**Phase:** 3 (200km)
**Pipeline:** 32 of 36
**Estimated Time:** 15-30 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | movement_200km_withid_rand |
| **Radius** | 200km |
| **Features** | Movement+ID (6): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/movement_200km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run200kmMovementWithIdRand.py |
| **Expected Rows** | ~5,000,000-15,000,000 |
| **Memory** | 20-40GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/movement_200km_withid_rand_${TIMESTAMP}.log"
echo "Starting movement_200km_withid_rand at $(date)"
python production_configs_v2/Run200kmMovementWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 32/36: movement_200km_withid_rand** complete
- Radius: 200km | Features: Movement+ID (6) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
