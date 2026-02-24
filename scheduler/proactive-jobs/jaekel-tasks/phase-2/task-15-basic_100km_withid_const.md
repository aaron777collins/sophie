# Task 15: basic_100km_withid_const Pipeline

**Phase:** 2 (100km)
**Pipeline:** 15 of 36
**Estimated Time:** 5-10 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_100km_withid_const |
| **Radius** | 100km |
| **Features** | Basic+ID (4): x_pos, y_pos, coreData_elevation, coreData_id |
| **Vehicle ID** | Yes |
| **Attack Type** | const_offset_per_id |
| **Config** | production_configs_v2/basic_100km_withid_const_pipeline_config.json |
| **Run Script** | production_configs_v2/Run100kmBasicWithIdConst.py |
| **Expected Rows** | ~500,000-2,000,000 |
| **Memory** | 8-15GB |

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_100km_withid_const_${TIMESTAMP}.log"
echo "Starting basic_100km_withid_const at $(date)"
python production_configs_v2/Run100kmBasicWithIdConst.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Slack Update Template

```
✅ **Pipeline 15/36: basic_100km_withid_const** complete
- Radius: 100km | Features: Basic+ID (4) | Attack: const_offset_per_id
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
