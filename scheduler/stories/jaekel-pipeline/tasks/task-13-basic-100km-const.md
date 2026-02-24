# Task 13: basic_100km_const

**Status:** 🟡 PENDING  
**Dependencies:** Task 12  
**Estimated Time:** 8 min  
**Phase:** 2 (100km pipelines)

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Pipeline Name** | basic_100km_const |
| **Config File** | `production_configs_v2/basic_100km_const_pipeline_config.json` |
| **Run Script** | `production_configs_v2/Run100kmBasicConst.py` |
| **Radius** | 100km |
| **Feature Set** | Basic (3 features) |
| **Vehicle ID** | No |
| **Attack Type** | const_offset_per_id |
| **Expected Rows** | 500,000-2,000,000 |

---

## Execution Commands

### Step 1: Run Pipeline

```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate

# Execute pipeline
python production_configs_v2/Run100kmBasicConst.py 2>&1 | tee logs/basic_100km_const_$(date +%Y%m%d_%H%M%S).log
```

### Step 2: Log Audit

```bash
LOG=$(ls -t logs/basic_100km_const_*.log | head -1)

echo "=========================================="
echo "LOG AUDIT: basic_100km_const"
echo "Log file: $LOG"
echo "=========================================="

# 1. Check for errors
echo "=== ERRORS ==="
grep -iE "error|exception|failed|traceback" $LOG | head -5
# EXPECTED: No critical errors

# 2. Check row counts
echo "=== ROW COUNTS ==="
grep -iE "rows|records|loaded|filtered" $LOG
# EXPECTED: 500,000-2,000,000 rows

# 3. Check attack application
echo "=== ATTACK VERIFICATION ==="
grep -iE "attacker|malicious|isAttacker|attack.*applied|const_offset_per_id" $LOG
# EXPECTED: 30% attackers applied with const_offset_per_id

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
ls -la results/matrix/basic_100km_const/
# EXPECTED: CSV files with ML results

# Check cache created
ls -la cache/matrix/basic_100km_const/
# EXPECTED: clean.parquet and attack.parquet
```

---

## Success Criteria

- [ ] Pipeline executed without errors
- [ ] Log audit shows no critical errors
- [ ] Row counts within expected range (500,000-2,000,000)
- [ ] Attack verification shows const_offset_per_id applied
- [ ] ML accuracy > 65%
- [ ] Results files created in results/matrix/basic_100km_const/
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
3. Proceed to Task 14 (unless this is Task 36)
