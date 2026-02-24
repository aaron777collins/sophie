# Task 36: extended_200km_withid_rand Pipeline

**Phase:** 3 (200km)
**Pipeline:** 36 of 36 🎉 FINAL
**Estimated Time:** 15-30 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | extended_200km_withid_rand |
| **Radius** | 200km |
| **Features** | Extended+ID (7): x_pos, y_pos, coreData_elevation, coreData_speed, coreData_heading, coreData_accelset_accelYaw, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/extended_200km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run200kmExtendedWithIdRand.py |
| **Expected Rows** | ~5,000,000-15,000,000 |
| **Memory** | 20-40GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/extended_200km_withid_rand_${TIMESTAMP}.log"
echo "Starting extended_200km_withid_rand at $(date)"
python production_configs_v2/Run200kmExtendedWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
🎉 **Pipeline 36/36: extended_200km_withid_rand** complete - ALL PIPELINES DONE!
- Radius: 200km | Features: Extended+ID (7) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}

🏆 **ALL 36 PIPELINES COMPLETE!**

Summary:
| Phase | Radius | Pipelines | Status |
|-------|--------|-----------|--------|
| 1     | 2km    | 12/12     | ✅      |
| 2     | 100km  | 12/12     | ✅      |
| 3     | 200km  | 12/12     | ✅      |

Total execution time: {TOTAL_TIME}
Results: /home/ubuntu/repos/ConnectedDrivingPipelineV4/results/matrix/
```
