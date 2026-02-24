# Task 16: basic_100km_withid_rand Pipeline

**Phase:** 2 (100km)
**Pipeline:** 16 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_100km_withid_rand |
| **Radius** | 100km |
| **Features** | Basic+ID (4): x_pos, y_pos, coreData_elevation, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/basic_100km_withid_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmBasicWithIdRand.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_100km_withid_rand_${TIMESTAMP}.log"
echo "Starting basic_100km_withid_rand at $(date)"
python production_configs_v2/Run100kmBasicWithIdRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 16/36: basic_100km_withid_rand** complete
- Radius: 100km | Features: Basic+ID (4) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
