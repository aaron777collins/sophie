# Task 02: basic_2km_rand Pipeline

**Phase:** 1 (2km)
**Pipeline:** 2 of 36
**Estimated Time:** 2-3 minutes
**Server:** jaekel

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Name** | basic_2km_rand |
| **Radius** | 2km |
| **Features** | Basic (3): x_pos, y_pos, coreData_elevation |
| **Vehicle ID** | No |
| **Attack Type** | rand_offset |
| **Config** | production_configs_v2/basic_2km_rand_pipeline_config.json |
| **Run Script** | production_configs_v2/Run2kmBasicRand.py |
| **Expected Rows** | ~5,000-20,000 |
| **Memory** | <2GB |

---

## Pre-Execution Checks

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
test -f production_configs_v2/basic_2km_rand_pipeline_config.json && echo "✅ Config exists" || echo "❌ Config missing"
test -f production_configs_v2/Run2kmBasicRand.py && echo "✅ Run script exists" || echo "❌ Run script missing"
pgrep -f "Run2kmBasicRand" && echo "⚠️ Process already running" || echo "✅ No existing process"
free -h | grep Mem
EOF
```

---

## Execution Command

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/basic_2km_rand_${TIMESTAMP}.log"
echo "Starting basic_2km_rand at $(date)"
python production_configs_v2/Run2kmBasicRand.py 2>&1 | tee "$LOG_FILE"
echo "Completed at $(date)"
EOF
```

---

## Log Audit Steps

```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
LOG=$(ls -t logs/basic_2km_rand_*.log 2>/dev/null | head -1)
[ -z "$LOG" ] && { echo "❌ No log file found!"; exit 1; }
echo "=== ERRORS ===" && grep -iE "error|exception|failed|traceback" "$LOG" | head -10 || echo "✅ No errors"
echo "=== ROW COUNTS ===" && grep -iE "rows|records|loaded|filtered" "$LOG" | tail -5
echo "=== ATTACK VERIFICATION ===" && grep -iE "attacker|rand_offset" "$LOG" | head -5
echo "=== ML RESULTS ===" && grep -iE "accuracy|precision|recall|f1" "$LOG" | tail -5
echo "=== RESULTS CHECK ===" && ls -la results/matrix/basic_2km_rand/ 2>/dev/null || echo "⚠️ Not found"
EOF
```

---

## Success Criteria

- [ ] Pipeline completes without errors
- [ ] Row counts: 5,000-20,000
- [ ] rand_offset attack applied
- [ ] ML accuracy >70%
- [ ] Results in `results/matrix/basic_2km_rand/`

---

## Slack Update Template

```
✅ **Pipeline 2/36: basic_2km_rand** complete
- Radius: 2km | Features: Basic (3) | Attack: rand_offset
- Rows: {ROW_COUNT} | Accuracy: {ACCURACY}% | Duration: {DURATION}
```
