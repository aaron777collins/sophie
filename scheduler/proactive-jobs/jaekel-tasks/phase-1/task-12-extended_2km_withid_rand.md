# Task 12: extended_2km_withid_rand Pipeline

**Phase:** 1 (2km)
**Pipeline:** 12 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | extended_2km_withid_rand |
| **Radius** | 2km |
| **Features** | Extended+ID (7): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_accelset_accelYaw, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/extended_2km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmExtendedWithIdRand.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/extended_2km_withid_rand_${TIMESTAMP}.log"
echo "Starting extended_2km_withid_rand at $(date)"
python production_configs_v2/Run2kmExtendedWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 12/36: extended_2km_withid_rand** complete (END OF PHASE 1)
- Radius: 2km | Features: Extended+ID (7) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}

📊 **Phase 1 Complete:** 12/12 pipelines | Proceeding to Phase 2 (100km)...
```
