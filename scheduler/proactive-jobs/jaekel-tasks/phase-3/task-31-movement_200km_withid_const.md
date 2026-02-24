# Task 31: movement_200km_withid_const Pipeline

**Phase:** 3 (200km)
**Pipeline:** 31 of 36
**Estimated Time:** 15-30 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | movement_200km_withid_const |
| **Radius** | 200km |
| **Features** | Movement+ID (6): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/movement_200km_withid_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run200kmMovementWithIdConst.py |
| **Expected Rows** | ~5,000,000-15,000,000 |
| **Memory** | 20-40GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/movement_200km_withid_const_${TIMESTAMP}.log"
echo "Starting movement_200km_withid_const at $(date)"
python production_configs_v2/Run200kmMovementWithIdConst.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 31/36: movement_200km_withid_const** complete
- Radius: 200km | Features: Movement+ID (6) | Attack: const_offset_per_id
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
