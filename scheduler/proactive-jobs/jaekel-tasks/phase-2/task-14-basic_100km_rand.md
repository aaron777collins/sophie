# Task 14: basic_100km_rand Pipeline

**Phase:** 2 (100km)
**Pipeline:** 14 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_100km_rand |
| **Radius** | 100km |
| **Features** | Basic (3): x_pos, y_pos, coreData_elevation |
| **Vehicle ID** | No |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/basic_100km_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmBasicRand.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_100km_rand_${TIMESTAMP}.log"
echo "Starting basic_100km_rand at $(date)"
python production_configs_v2/Run100kmBasicRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 14/36: basic_100km_rand** complete
- Radius: 100km | Features: Basic (3) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
