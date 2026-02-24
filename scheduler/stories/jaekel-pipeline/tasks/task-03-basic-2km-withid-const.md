# Task 03: basic_2km_withid_const

**Status:** 🟡 PENDING  
**Dependencies:** Task 02  
**Estimated Time:** 3 min  
**Phase:** 1 (2km pipelines)

---

## Pipeline Details

| Property | Value |
|----------|-------|
| **Pipeline Name** | basic_2km_withid_const |
| **Config File** | `production_configs_v2/basic_2km_withid_const_pipeline_config.json` |
| **Run Script** | `production_configs_v2/Run2kmBasicWithIdConst.py` |
| **Radius** | 2km |
| **Feature Set** | Basic (4 features) |
| **Vehicle ID** | Yes |
| **Attack Type** | const_offset_per_id |
| **Expected Rows** | 5,000-20,000 |

---

## Execution Commands

### Step 1: Run Pipeline

```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate

# Execute pipeline
python production_configs_v2/Run2kmBasicWithIdConst.py 2>&1 | tee logs/basic_2km_withid_const_$(date +%Y%m%d_%H%M%S).log
```

### Step 2: Log Audit

```bash
LOG=$(ls -t logs/basic_2km_withid_const_*.log | head -1)

echo "=========================================="
echo "LOG AUDIT: basic_2km_withid_const"
echo "Log file: $LOG"
echo "=========================================="

# 1. Check for errors
echo "=== ERRORS ==="
grep -iE "error|exception|failed|traceback" $LOG | head -5
# EXPECTED: No critical errors

# 2. Check row counts
echo "=== ROW COUNTS ==="
grep -iE "rows|records|loaded|filtered" $LOG
# EXPECTED: 5,000-20,000 rows

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
ls -la results/matrix/basic_2km_withid_const/
# EXPECTED: CSV files with ML results

# Check cache created
ls -la cache/matrix/basic_2km_withid_const/
# EXPECTED: clean.parquet and attack.parquet
```

---

## Success Criteria

- [ ] Pipeline executed without errors
- [ ] Log audit shows no critical errors
- [ ] Row counts within expected range (5,000-20,000)
- [ ] Attack verification shows const_offset_per_id applied
- [ ] ML accuracy > 65%
- [ ] Results files created in results/matrix/basic_2km_withid_const/
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
3. Proceed to Task 04 (unless this is Task 36)
