# Task 24: extended_100km_withid_rand Pipeline

**Phase:** 2 (100km)
**Pipeline:** 24 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | extended_100km_withid_rand |
| **Radius** | 100km |
| **Features** | Extended+ID (7): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_accelset_accelYaw, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/extended_100km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmExtendedWithIdRand.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/extended_100km_withid_rand_${TIMESTAMP}.log"
echo "Starting extended_100km_withid_rand at $(date)"
python production_configs_v2/Run100kmExtendedWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 24/36: extended_100km_withid_rand** complete (END OF PHASE 2)
- Radius: 100km | Features: Extended+ID (7) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}

📊 **Phase 2 Complete:** 12/12 pipelines | Proceeding to Phase 3 (200km)...
```
