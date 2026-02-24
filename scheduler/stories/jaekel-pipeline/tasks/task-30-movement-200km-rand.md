# Task 30: movement_200km_rand

**Status:** 🟡 PENDING  
**Dependencies:** Task 29  
**Estimated Time:** 20 min  
**Phase:** 3 (200km pipelines)

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Pipeline Name** | movement_200km_rand |
| **Config File** | `production_configs_v2/movement_200km_rand_pipeline_config.json` |
| **Run Script** | `production_configs_v2/Run200kmMovementRand.py` |
| **Radius** | 200km |
| **Feature Set** | Movement (5 features) |
| **Vehicle ID** | No |
| **Attack Type** | rand_offset |
| **Expected Rows** | 5,000,000-15,000,000 |

---

## Execution Commands

### Step 1: Run Pipeline

```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate

# Execute pipeline
python production_configs_v2/Run200kmMovementRand.py 2>&1 | tee logs/movement_200km_rand_$(date +%Y%m%d_%H%M%S).log
```

### Step 2: Log Audit

```bash
LOG=$(ls -t logs/movement_200km_rand_*.log | head -1)

echo "=========================================="
echo "LOG AUDIT: movement_200km_rand"
echo "Log file: $LOG"
echo "=========================================="

# 1. Check for errors
echo "=== ERRORS ==="
grep -iE "error|exception|failed|traceback" $LOG | head -5
# EXPECTED: No critical errors

# 2. Check row counts
echo "=== ROW COUNTS ==="
grep -iE "rows|records|loaded|filtered" $LOG
# EXPECTED: 5,000,000-15,000,000 rows

# 3. Check attack application
echo "=== ATTACK VERIFICATION ==="
grep -iE "attacker|malicious|isAttacker|attack.*applied|rand_offset" $LOG
# EXPECTED: 30% attackers applied with rand_offset

# 4. Check ML results
echo "=== ML RESULTS ==="
grep -iE "accuracy|precision|recall|f1|score" $LOG
# EXPECTED: Accuracy > 65%

# 5. Check completion
echo "=== COMPLETION ==="
grep -iE "complete|finished|done|success" $LOG | tail -3
# EXPECTED: Pipeline complete message
```

### Step 3: Verify Results

```bash
# Check results directory
ls -la results/matrix/movement_200km_rand/
# EXPECTED: CSV files with ML results

# Check cache created
ls -la cache/matrix/movement_200km_rand/
# EXPECTED: clean.parquet and attack.parquet
```

---

## Success Criteria

- [ ] Pipeline executed without errors
- [ ] Log audit shows no critical errors
- [ ] Row counts within expected range (5,000,000-15,000,000)
- [ ] Attack verification shows rand_offset applied
- [ ] ML accuracy > 65%
- [ ] Results files created in results/matrix/movement_200km_rand/
- [ ] Cache files created

---

## If Failed

1. Check log for specific error
2. If OOM: Reduce workers in config, retry
3. If data error: Check column names in config
4. Document failure and notify Slack
5. DO NOT proceed to next task until resolved

---

## Completion

When successful:
1. Update status to ✅ COMPLETE in this file
2. Update TASK-INDEX.md
3. Proceed to Task 31 (unless this is Task 36)
